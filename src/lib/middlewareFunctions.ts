// @/lib/middlewareFunctions.ts
import { type User, type Organization, db, setupDb } from "@/db";
import type { AppContext } from "@/worker";
import { env } from "cloudflare:workers";

let dbInitialized = false;

export async function initializeServices() {
  if (!dbInitialized) {
    await setupDb(env);
    dbInitialized = true;
  }
}

export function shouldSkipMiddleware(request: Request): boolean {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Skip middleware for auth routes completely
  if (pathname.startsWith('/api/auth/')) {
    console.log('🔍 Skipping middleware for auth route:', pathname);
    return true;
  }
  
  return false;
}

export async function setupSessionContext(ctx: AppContext, request: Request) {
  try {
    if (shouldSkipMiddleware(request)) {
      ctx.session = null;
      ctx.user = null;
      return;
    }
    
    console.log('🔍 Setting up session context for:', new URL(request.url).pathname);
    
    // Import auth
    const { auth } = await import("@/lib/auth");
    
    try {
      const session = await auth.api.getSession({
        headers: request.headers
      });
      
      ctx.session = session;
      ctx.user = session?.user as any;
      console.log('✅ Session context set:', !!ctx.user ? `User: ${ctx.user?.email}` : 'No user');
    } catch (authError) {
      console.warn('⚠️ Auth session failed, continuing without session:', authError?.message);
      ctx.session = null;
      ctx.user = null;
    }
    
  } catch (error) {
    console.error("Session setup error:", error);
    ctx.session = null;
    ctx.user = null;
  }
}

export async function setupOrganizationContext(ctx: AppContext, request: Request) {
  try {
    if (shouldSkipMiddleware(request)) {
      ctx.organization = null;
      ctx.userRole = null;
      ctx.orgError = null;
      return;
    }
    
    const url = new URL(request.url);
    console.log('🔍 Setting up organization context for:', url.pathname);
    
    const orgSlug = extractOrgFromSubdomain(request);
    console.log('🔍 Extracted org slug:', orgSlug, 'from URL:', request.url);
    
    if (!orgSlug) {
      // No organization context (main domain)
      ctx.organization = null;
      ctx.userRole = null;
      ctx.orgError = null;
      return;
    }
    
    try {
      // Find the organization
      const organization = await db.organization.findUnique({
        where: { slug: orgSlug },
        include: {
          members: {
            where: ctx.user ? { userId: ctx.user.id } : undefined,
            select: { role: true }
          }
        }
      });
      
      if (!organization) {
        console.log('❌ Organization not found:', orgSlug);
        ctx.organization = null;
        ctx.userRole = null;
        ctx.orgError = 'ORG_NOT_FOUND';
        return;
      }
      
      // Check if user has access (if user is logged in)
      if (ctx.user) {
        const userMembership = organization.members?.[0];
        if (!userMembership) {
          console.log('❌ User has no access to org:', orgSlug);
          ctx.organization = organization;
          ctx.userRole = null;
          ctx.orgError = 'NO_ACCESS';
          return;
        }
        
        ctx.userRole = userMembership.role;
        console.log('✅ User has access to org:', orgSlug, 'with role:', ctx.userRole);
      } else {
        // No user logged in, but org exists
        ctx.userRole = null;
      }
      
      ctx.organization = organization;
      ctx.orgError = null;
      
    } catch (dbError) {
      console.error("Database error in org context:", dbError);
      ctx.organization = null;
      ctx.userRole = null;
      ctx.orgError = 'ERROR';
    }
    
  } catch (error) {
    console.error("Organization context error:", error);
    ctx.organization = null;
    ctx.userRole = null;
    ctx.orgError = 'ERROR';
  }
}

export function extractOrgFromSubdomain(request: Request): string | null { 
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // Handle localhost development
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[1] === 'localhost') {
      const orgSlug = parts[0];
      if (/^[a-z0-9-]+$/.test(orgSlug) && orgSlug.length > 0) {
        return orgSlug;
      }
    }
    return null;
  }
  
  // Handle workers.dev URLs
  if (hostname.includes('workers.dev')) {
    const parts = hostname.split('.');
    if (parts.length >= 4) {
      const orgSlug = parts[0];
      if (/^[a-z0-9-]+$/.test(orgSlug) && orgSlug.length > 0) {
        return orgSlug;
      }
    }
    return null;
  }
  
  // Handle custom domains (like quinncodes.com)
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const orgSlug = parts[0];
    if (/^[a-z0-9-]+$/.test(orgSlug) && orgSlug.length > 0) {
      return orgSlug;
    }
  }
  
  return null;
}