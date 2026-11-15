import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-6 py-16">
      <section className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-8 sm:p-10">
        <Link href="/" className="text-2xl font-black tracking-[-.08em]">ANY<span className="text-lime-600">.</span></Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Create your account</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.06em]">Your voice starts here.</h1>
        <p className="mt-4 text-sm leading-6 text-neutral-500">Create an account to save your preferences and manage your voice workspace.</p>
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-xs leading-5 text-neutral-400">By creating an account, you agree to our <Link className="underline" href="/terms">Terms</Link> and acknowledge our <Link className="underline" href="/privacy">Privacy Notice</Link>.</p>
      </section>
    </main>
  );
}
