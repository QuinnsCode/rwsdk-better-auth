// @/app/serverActions/orgs/createOrg.ts
"use server";

import { requestInfo } from "rwsdk/worker";
import { db, setupDb } from "@/db";
import { initializeServices } from "@/lib/middlewareFunctions";
import { initAuth } from "@/lib/auth";
import { env } from "cloudflare:workers";

function getRedirectUrl(slug: string, request: Request): string {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const protocol = url.protocol;
  
  // Local development (localhost)
  if (hostname.includes('localhost')) {
    const port = url.port || '5173';
    return `${protocol}//${slug}.localhost:${port}/dashboard`;
  }
  
  // Wrangler dev (workers.dev)
  if (hostname.includes('workers.dev')) {
    const workerDomain = hostname.split('.').slice(-3).join('.');
    return `${protocol}//${slug}.${workerDomain}/dashboard`;
  }
  
  // Production (quinncodes.com)
  return `${protocol}//${slug}.quinncodes.com/dashboard`;
}

export async function createOrganization(formData: FormData) {
  try {
    // Initialize services first
    await initializeServices();
    
    const { ctx, request } = requestInfo;
    
    console.log('🔍 Server action debug:');
    console.log('🔍 ctx.user exists:', !!ctx.user);
    console.log('🔍 ctx.session exists:', !!ctx.session);
    console.log('🔍 request URL:', request.url);
    console.log('🔍 request hostname:', new URL(request.url).hostname);
    
    // Get user session
    let userId: string | null = null;
    
    if (ctx.user) {
      userId = ctx.user.id;
    } else {
      try {
        const authInstance = initAuth();
        const session = await authInstance.api.getSession({
          headers: request.headers
        });
        userId = session?.user?.id || null;
      } catch (authError) {
        console.error('Auth error in server action:', authError);
      }
    }
    
    if (!userId) {
      throw new Error('Unauthorized - please sign in');
    }

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    // Validate inputs
    if (!name || !slug) {
      throw new Error('Name and slug are required');
    }

    // Validate slug format
    if (!/^[a-z0-9\-]+$/.test(slug)) {
      throw new Error('Slug can only contain lowercase letters, numbers, and hyphens');
    }

    console.log('Creating org with name:', name, 'slug:', slug, 'userId:', userId);

    // Check if slug is taken
    const existing = await db.organization.findUnique({
      where: { slug }
    });

    if (existing) {
      throw new Error('Organization slug already taken');
    }

    // Create org
    const org = await db.organization.create({
      data: {
        id: crypto.randomUUID(),
        name,
        slug,
        createdAt: new Date()
      }
    });

    console.log('Organization created:', org.id);

    // Add user as admin
    await db.member.create({
      data: {
        id: crypto.randomUUID(),
        userId: userId,
        organizationId: org.id,
        role: 'admin',
        createdAt: new Date()
      }
    });

    console.log('User added as admin to org');

    // Get the appropriate redirect URL based on environment
    const redirectUrl = getRedirectUrl(slug, request);
    console.log('🔗 Redirecting to:', redirectUrl);

    // Return success with redirect URL for client-side handling
    return {
      success: true,
      redirectUrl: redirectUrl,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug
      }
    };

  } catch (error) {
    console.error('Create organization error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create organization'
    };
  }
}