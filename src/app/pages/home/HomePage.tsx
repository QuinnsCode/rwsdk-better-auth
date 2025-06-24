// app/pages/user/login.tsx (or wherever you want to place it)
import { type AppContext } from "@/worker";

import { LogoutButton } from "@/app/pages/user/LoginButton";
import { BetterAuthLogin } from "@/app/pages/user/BetterAuthLogin";
import { RoleToggleButton } from "@/app/pages/user/RoleToggleButton";

export default function HomePage({ ctx }: { ctx: AppContext }) {
  // If user is already logged in, redirect to home
  if (ctx.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-12">HOME PAGE</h1>
          <hr className="border-b-black border-b-8 my-12"></hr>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Already Logged In</h1>
          <p className="text-gray-600 mb-4">
            Welcome back, {ctx.user.name || ctx.user.email}!
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Role: {ctx.user.role || "user"}
          </p>
          <div className="w-full inline-flex items-center justify-between">
            <a 
              href="/" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go Home
            </a>
            <div className="items-center space-x-2 mx-4">
              <LogoutButton 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                redirectTo="/user/login"
              >
                Logout
              </LogoutButton>
            </div>
            <div className="items-center space-x-2">
              <RoleToggleButton 
                currentRole={ctx.user.role || "user"}
                userId={ctx.user.id}
              />
            </div>
            {ctx.user.role === "admin" && (
              <a 
                href="/admin" 
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Admin Panel
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <BetterAuthLogin />
      </div>
    </div>
  );
}