"use client";

import { useState, useTransition } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import {
  finishPasskeyRegistration,
  startPasskeyRegistration,
} from "./functions";
import { AuthLayout } from "@/app/layouts/AuthLayout";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();

  const passkeyRegister = async () => {
    try {
      console.log('Starting registration for:', username);
      
      // 1. Get a challenge from the worker
      const options = await startPasskeyRegistration(username);
      console.log('Got options:', options);

      if (!options) {
        throw new Error('No options returned from server');
      }

      // 2. Ask the browser to sign the challenge
      const registration = await startRegistration({ optionsJSON: options });

      // 3. Give the signed challenge to the worker to finish the registration process
      const success = await finishPasskeyRegistration(username, registration);

      if (!success) {
        setResult("Registration failed");
      } else {
        setResult("Registration successful!");
      }
    } catch (error) {
      console.error('Registration error:', error);
      setResult(`Registration failed: ${error.message}`);
    }
  };

  const handlePerformPasskeyRegister = () => {
    startTransition(() => void passkeyRegister());
  };

  return (
    <AuthLayout>
      <h1 className="text-4xl font-bold text-red-500">Sign up</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <button onClick={handlePerformPasskeyRegister} disabled={isPending}>
        {isPending ? "..." : "Register with passkey"}
      </button>
      {result && <div>{result}</div>}
    </AuthLayout>
  );
}