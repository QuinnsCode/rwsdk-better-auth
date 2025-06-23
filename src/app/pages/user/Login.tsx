"use client";

import { useState, useTransition } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { finishPasskeyLogin, startPasskeyLogin } from "./functions";
// import { Button } from "@/components/ui/button";

export function Login() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();

  const passkeyLogin = async () => {
    // 1. Get a challenge from the worker
    const options = await startPasskeyLogin();

    // 2. Ask the browser to sign the challenge
    const login = await startAuthentication({ optionsJSON: options });

    // 3. Give the signed challenge to the worker to finish the login process
    const success = await finishPasskeyLogin(login);

    if (!success) {
      setResult("Login failed");
    } else {
      setResult("Login successful!");
      setTimeout(() => {
        window.location.pathname = "/";
      }, 2300);
    }
  };

  const handlePerformPasskeyLogin = () => {
    startTransition(() => void passkeyLogin());
  };

  return (
    <div className="max-w-[400px] w-full mx-auto px-10">
      <h1 className="text-center">Login</h1>
      <p className="py-6">Enter your username below to sign-in.</p>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        suppressHydrationWarning
      />
      <button 
        onClick={handlePerformPasskeyLogin}
        disabled={isPending}
        suppressHydrationWarning
      >
        {isPending ? <>...</> : "Login with Passkey"}
      </button>
      {result && <div>{result}</div>}
    </div>
  );
}