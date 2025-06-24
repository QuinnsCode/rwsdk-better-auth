"use client";

import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";

interface RoleToggleButtonProps {
  currentRole?: string;
  userId: string;
  className?: string;
}

export function RoleToggleButton({ 
  currentRole = "user", 
  userId,
  className 
}: RoleToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = currentRole === "admin";
  const targetRole = isAdmin ? "user" : "admin";

  const handleRoleToggle = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const result = await authClient.admin.setRole({
        userId,
        role: targetRole,
      });
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess(`Role changed to ${targetRole}!`);
      
      // Refresh the page after a short delay to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change role");
    }
  };

  const performRoleToggle = () => {
    startTransition(() => {
      void handleRoleToggle();
    });
  };

  const defaultClassName = isAdmin 
    ? "bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
    : "bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600";

  return (
    <div className="relative">
      <button
        onClick={performRoleToggle}
        disabled={isPending}
        className={`${className || defaultClassName} ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isPending 
          ? "Changing..." 
          : isAdmin 
            ? "↓ Switch to User" 
            : "↑ Upgrade to Admin"
        }
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
      
      {success && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-green-100 border border-green-300 text-green-700 text-sm rounded whitespace-nowrap z-10">
          {success}
        </div>
      )}
    </div>
  );
}