"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    await signIn("email", { email, redirect: false });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">
          Check your terminal for the magic link preview URL.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-sm">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full border rounded px-3 py-2"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white rounded px-3 py-2"
        >
          Send magic link
        </button>
      </div>
    </div>
  );
}
