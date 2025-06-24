"use client";

import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
}

export function LogoutButton({ 
  className = "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600", 
  children = "Logout",
  redirectTo = "/user/login"
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setError(null);
      
      const result = await authClient.signOut();
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Redirect after successful logout
      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    }
  };

  const performLogout = () => {
    startTransition(() => {
      void handleLogout();
    });
  };

  return (
    <div className="relative">
      <button
        onClick={performLogout}
        disabled={isPending}
        className={`${className} ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isPending ? "Logging out..." : children}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}