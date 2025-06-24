"use client";

import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";

export function BetterAuthLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSignIn = async () => {
    try {
      setResult("");
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setResult(`Login failed: ${error.message}`);
        return;
      }

      setResult("Login successful!");
      setTimeout(() => {
        window.location.pathname = "/";
      }, 1500);
    } catch (err) {
      setResult(`Login failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleSignUp = async () => {
    try {
      setResult("");
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        setResult(`Sign up failed: ${error.message}`);
        return;
      }

      setResult("Account created successfully! You can now sign in.");
      // Switch to sign in mode
      setIsSignUp(false);
      setName("");
    } catch (err) {
      setResult(`Sign up failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      if (isSignUp) {
        void handleSignUp();
      } else {
        void handleSignIn();
      }
    });
  };

  const getCurrentUser = async () => {
    try {
      const session = await authClient.getSession();
      if (session.data) {
        setResult(`Current user: ${session.data.user.email} (${session.data.user.role || 'user'})`);
      } else {
        setResult("No active session");
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setResult("Signed out successfully!");
      setEmail("");
      setPassword("");
      setName("");
    } catch (err) {
      setResult(`Sign out failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div className="max-w-[400px] w-full mx-auto px-10">
      <h1 className="text-center text-2xl font-bold mb-2">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h1>
      <p className="py-6 text-gray-600 text-center">
        {isSignUp 
          ? "Create a new account below." 
          : "Enter your credentials below to sign in."
        }
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              suppressHydrationWarning
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            suppressHydrationWarning
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            suppressHydrationWarning
          />
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          suppressHydrationWarning
        >
          {isPending ? "..." : (isSignUp ? "Create Account" : "Sign In")}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setResult("");
          }}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          {isSignUp 
            ? "Already have an account? Sign in" 
            : "Don't have an account? Sign up"
          }
        </button>
      </div>

      {/* Development utilities */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={getCurrentUser}
            className="text-sm bg-gray-100 text-gray-700 py-1 px-3 rounded hover:bg-gray-200"
          >
            Check Current Session
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm bg-red-100 text-red-700 py-1 px-3 rounded hover:bg-red-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      {result && (
        <div className={`mt-4 p-3 rounded text-sm ${
          result.includes("successful") 
            ? "bg-green-100 text-green-700 border border-green-200" 
            : result.includes("failed") || result.includes("Error")
            ? "bg-red-100 text-red-700 border border-red-200"
            : "bg-blue-100 text-blue-700 border border-blue-200"
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}