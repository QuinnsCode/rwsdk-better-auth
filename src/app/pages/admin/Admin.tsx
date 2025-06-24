// app/pages/admin/admin.tsx
import { type AppContext } from "@/worker";
import AdminTest from "./AdminTest";

export default function AdminPage({ ctx }: { ctx: AppContext }) {
  // Check if user is admin
  if (!ctx.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You must be logged in to access this page.</p>
          <a 
            href="/user/login" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  if (ctx.user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You must be an admin to access this page.</p>
          <p className="text-sm text-gray-500">Current role: {ctx.user.role || "user"}</p>
          <a 
            href="/" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4 inline-block"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTest currentUser={ctx.user} />
    </div>
  );
}