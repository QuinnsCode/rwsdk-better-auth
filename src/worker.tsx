import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import HomePage from "@/app/pages/home/HomePage";
import { setCommonHeaders } from "@/app/headers";
import { userRoutes } from "@/app/pages/user/routes";
import AdminPage from "@/app/pages/admin/Admin";
import { type User, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";

export { SessionDurableObject } from "./session/durableObject";

export type AppContext = {
  session: any;
  user: any;
};

// Global flags for one-time initialization
let dbInitialized = false;
let authInstance: any = null;

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, headers }) => {
    // Only initialize once
    if (!dbInitialized) {
      await setupDb(env);
      dbInitialized = true;
      
      // Create auth instance immediately after db setup
      const { auth } = await import("@/lib/auth");
      authInstance = auth;
    }

    // This runs on every request (fast)
    try {
      const session = await authInstance.api.getSession({
        headers: request.headers
      });
      ctx.session = session;
      ctx.user = session?.user || null;
    } catch (error) {
      console.error("Session error:", error);
      ctx.session = null;
      ctx.user = null;
    }
  },
  
  render(Document, [
    // route("/", () => new Response("Hello, World!")),
    route("/", HomePage),
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
    route("/api/auth/*", ({ request }) => authInstance.handler(request)),

    route("/api/protected", async ({ request }) => {
        const session = await authInstance.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        return new Response(`Hello ${session.user.name}!`);
    }),
  ]),
]);