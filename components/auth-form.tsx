"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (authError) throw authError;

        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
        } else {
          setMessage("Check your inbox for the confirmation link. Once confirmed, you can sign in.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (authError) throw authError;

        router.replace("/dashboard");
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Email address</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black"
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Password</span>
        <input
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black"
          placeholder="At least 8 characters"
        />
      </label>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-lime-50 px-4 py-3 text-sm text-neutral-700">{message}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-black px-5 py-4 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
      </button>
      <p className="text-center text-sm text-neutral-500">
        {isSignup ? "Already have an account?" : "New to ANY?"}{" "}
        <Link className="font-semibold text-black underline" href={isSignup ? "/login" : "/signup"}>
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
