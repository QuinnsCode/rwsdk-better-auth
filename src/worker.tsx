import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import HomePage from "@/app/pages/home/HomePage";
import { setCommonHeaders } from "@/app/headers";
import { userRoutes } from "@/app/pages/user/routes";
import AdminPage from "@/app/pages/admin/Admin";
import { type User, type Organization, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
import { 
  initializeServices, 
  setupOrganizationContext, 
  setupSessionContext, 
  extractOrgFromSubdomain,
  shouldSkipMiddleware 
} from "@/lib/middlewareFunctions";
import CreateOrgPage from "@/app/pages/orgs/CreateOrgPage";
import OrgDashboard from "@/app/components/Organizations/OrgDashboard";

export { SessionDurableObject } from "./session/durableObject";

export type AppContext = {
  session: any | null;
  user: any | null;
  organization: Organization | null;
  userRole: string | null;
  orgError: 'ORG_NOT_FOUND' | 'NO_ACCESS' | 'ERROR' | null;
};

export default defineApp([
  setCommonHeaders(),
  
  // 🔧 CONDITIONAL MIDDLEWARE - Only runs for non-auth routes
  async ({ ctx, request, headers }) => {
    // Always initialize services
    await initializeServices();
    
    // Skip middleware setup for auth routes
    if (shouldSkipMiddleware(request)) {
      console.log('🔍 Skipping middleware for:', new URL(request.url).pathname);
      return;
    }
    
    // Setup context for other routes
    await setupSessionContext(ctx, request);
    await setupOrganizationContext(ctx, request);
    
    // Handle organization errors for frontend routes
    if (ctx.orgError && 
        !request.url.includes('/api/') && 
        !request.url.includes('/user/') &&
        !request.url.includes('/orgs/new')) {

      const url = new URL(request.url);
      
      if (ctx.orgError === 'ORG_NOT_FOUND') {
        // Redirect to main domain with org creation option
        const mainDomain = url.hostname.includes('localhost') 
          ? 'localhost:5173' 
          : url.hostname.split('.').slice(-2).join('.');
        
        const orgSlug = extractOrgFromSubdomain(request);
        return new Response(null, {
          status: 302,
          headers: { 
            Location: `${url.protocol}//${mainDomain}/orgs/new?suggested=${orgSlug}` 
          },
        });
      }
      
      if (ctx.orgError === 'NO_ACCESS') {
        // User is logged in but not a member - show login page
        return new Response(null, {
          status: 302,
          headers: { Location: `/user/login` },
        });
      }
    }
  },
  
  render(Document, [
    route("/", [
      ({ ctx, request }) => {
        const orgSlug = extractOrgFromSubdomain(request);
        
        // If no subdomain, show main landing page
        if (!orgSlug) {
          return HomePage;
        }
        
        // If we have an organization but user isn't logged in or doesn't have role
        if (ctx.organization && (!ctx.user || !ctx.userRole)) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/user/login" },
          });
        }
        
        // Show organization dashboard for subdomain requests
        return OrgDashboard;
      },
    ]),

    route("/org-not-found", ({ request }) => {
      const url = new URL(request.url);
      const slug = url.searchParams.get('slug');
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Organization Not Found</h1>
          <p>The organization "{slug}" doesn't exist.</p>
          <a href="/">Return to Home</a>
        </div>
      );
    }),
    
    route("/no-access", ({ request }) => {
      const url = new URL(request.url);
      const slug = url.searchParams.get('slug');
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Access Denied</h1>
          <p>You don't have access to the organization "{slug}".</p>
          <a href="/">Return to Home</a>
        </div>
      );
    }),

    route("/orgs/new", CreateOrgPage),
    route("/dashboard", OrgDashboard),
    
    route("/protected", [
      ({ ctx }) => {
        if (!ctx.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/user/login" },
          });
        }
      },
      Home,
    ]),
    
    route("/admin", AdminPage),
    prefix("/user", userRoutes),
    
    // API Routes
    route("/api/auth/*", async ({ request }) => {
      try {
        await initializeServices();
        const { auth } = await import("@/lib/auth");
        const response = await auth.handler(request);
        return response;
      } catch (error) {
        console.error('🚨 Auth route error:', error);
        return new Response(JSON.stringify({ 
          error: 'Auth failed', 
          message: error?.message || String(error)
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }),

    route("/api/protected", async ({ request, ctx }) => {
      if (!ctx.session) {
        return new Response("Unauthorized", { status: 401 });
      }
      return new Response(`Hello ${ctx.user.name}!`);
    }),
  ]),
]);