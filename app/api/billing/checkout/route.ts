import Stripe from "stripe";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLAN_PRICE_ENV: Record<string, string | undefined> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : request.nextUrl.origin;

  if (origin && origin !== expectedOrigin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to choose a plan." }, { status: 401 });
  }

  let planKey: string;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("plan_key" in body) || typeof body.plan_key !== "string") {
      return NextResponse.json({ error: "A valid plan_key is required." }, { status: 400 });
    }
    planKey = body.plan_key;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const priceId = PLAN_PRICE_ENV[planKey];
  if (!priceId) {
    return NextResponse.json({ error: "This plan is not configured for checkout yet." }, { status: 503 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  try {
    const { data: active, error: subscriptionLookupError } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due", "incomplete", "unpaid"])
      .limit(1)
      .maybeSingle();

    if (subscriptionLookupError) {
      return NextResponse.json({ error: "Subscription storage is unavailable." }, { status: 503 });
    }
    if (active) {
      return NextResponse.json({
        error: "An existing subscription is already linked to this account. Manage it from Billing."
      }, { status: 409 });
    }

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(existing?.stripe_customer_id
        ? { customer: existing.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan_key: planKey },
      subscription_data: { metadata: { user_id: user.id, plan_key: planKey } },
      allow_promotion_codes: true,
      success_url: `${expectedOrigin}/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${expectedOrigin}/pricing?billing=cancelled`
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Unable to start checkout. Please try again." }, { status: 502 });
  }
}
