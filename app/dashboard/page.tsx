import Link from "next/link";
import { redirect } from "next/navigation";
import { BillingActions } from "@/components/billing-actions";
import { signOut } from "./actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_key,status,stripe_customer_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-6 py-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-[-.08em]">ANY<span className="text-lime-600">.</span></Link>
        <div className="flex items-center gap-4">
          <Link href="/billing" className="text-sm font-semibold">Billing</Link>
          <form action={signOut}><button className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-white">Sign out</button></form>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl py-16">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Your workspace</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-.07em]">Good to have you, {displayName}.</h1>
        <p className="mt-4 text-neutral-500">{user.email}</p>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-[2rem] bg-black p-8 text-white sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/45">Voice workspace</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-.06em]">Your next thought<br/>starts with a word.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/55">The account foundation is live in the codebase. Audio capture and transcription are the next product milestone.</p>
            <span className="mt-8 inline-flex rounded-full bg-[#c8f169] px-4 py-2 text-xs font-bold text-black">Dictation engine · In development</span>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-8">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Your plan</p>
            <h2 className="mt-4 text-3xl font-semibold capitalize tracking-[-.05em]">{subscription?.plan_key?.replaceAll("_", " ") ?? "Free"}</h2>
            <p className="mt-2 text-sm capitalize text-neutral-500">{subscription?.status?.replaceAll("_", " ") ?? "No active subscription"}</p>
            <BillingActions hasCustomer={Boolean(subscription?.stripe_customer_id)} />
            <Link href="/billing" className="mt-5 inline-block text-xs font-semibold underline">View billing details</Link>
          </section>
        </div>
      </section>
    </main>
  );
}
