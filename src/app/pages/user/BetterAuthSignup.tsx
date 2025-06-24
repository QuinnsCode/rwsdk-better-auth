"use client";

import { useState, useTransition } from "react";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { authClient } from "@/lib/auth-client";

export default function BetterAuthSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSignup = async () => {
    try {
      console.log('Starting signup for:', email);
      
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/", // Redirect after successful signup
      }, {
        onRequest: () => {
          console.log('Signup request started...');
        },
        onSuccess: (ctx) => {
          console.log('Signup successful:', ctx);
          setResult("Signup successful! Redirecting...");
          // Auto-redirect handled by callbackURL
        },
        onError: (ctx) => {
          console.error('Signup error:', ctx.error);
          setResult(`Signup failed: ${ctx.error.message}`);
        },
      });

      if (error) {
        setResult(`Signup failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setResult(`Signup failed: ${error.message}`);
    }
  };

  const handlePerformSignup = () => {
    if (!email || !password || !name) {
      setResult("Please fill in all fields");
      return;
    }
    
    startTransition(() => void handleSignup());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePerformSignup();
  };

  return (
    <AuthLayout>
      <h1 className="text-4xl font-bold text-red-500">Sign up</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            className="w-full p-2 border rounded"
            minLength={8}
            required
          />
        </div>
        
        <button 
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Sign up"}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-2 rounded ${
          result.includes('successful') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {result}
        </div>
      )}

      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/user/login" className="text-blue-500 hover:underline">
          Sign in
        </a>
      </p>
    </AuthLayout>
  );
}