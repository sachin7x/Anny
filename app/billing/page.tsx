import Link from "next/link";
import { redirect } from "next/navigation";
import { BillingActions } from "@/components/billing-actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_key,status,current_period_end,stripe_customer_id,cancel_at_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasCustomer = Boolean(subscription?.stripe_customer_id);
  const plan = subscription?.plan_key ?? "free";
  const status = subscription?.status ?? "free";

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-6 py-10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-[-.08em]">ANY<span className="text-lime-600">.</span></Link>
        <Link href="/dashboard" className="text-sm font-semibold text-neutral-600">← Dashboard</Link>
      </nav>
      <section className="mx-auto max-w-5xl py-20">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Account · Billing</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-.07em]">Your subscription.</h1>
        <div className="mt-10 rounded-[2rem] border border-black/10 bg-white p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Current plan</p>
              <h2 className="mt-1 text-2xl font-semibold capitalize">{plan.replaceAll("_", " ")}</h2>
            </div>
            <span className="rounded-full bg-lime-100 px-4 py-2 text-xs font-bold capitalize">{status.replaceAll("_", " ")}</span>
          </div>
          {subscription?.current_period_end && <p className="mt-4 text-sm text-neutral-500">Current period ends {new Date(subscription.current_period_end).toLocaleDateString()}.</p>}
          {subscription?.cancel_at_period_end && <p className="mt-2 text-sm text-amber-700">Your subscription is set to cancel at the end of this billing period.</p>}
          <div className="my-8 border-t border-neutral-100" />
          <p className="max-w-2xl text-sm leading-7 text-neutral-500">Payments are handled by Stripe. ANY never stores card numbers. Subscription status is updated from verified billing events, not browser redirects.</p>
          <BillingActions hasCustomer={hasCustomer} />
        </div>
      </section>
    </main>
  );
}
