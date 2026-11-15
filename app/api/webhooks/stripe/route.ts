import Stripe from "stripe";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer) {
  return typeof customer === "string" ? customer : customer.id;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  // Ignore subscriptions belonging to other products in a shared Stripe account.
  if (!userId) return;

  const admin = createAdminClient();
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const { error } = await admin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: getCustomerId(subscription.customer),
    stripe_subscription_id: subscription.id,
    plan_key: subscription.metadata.plan_key ?? "unknown",
    price_id: priceId,
    status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString()
  }, { onConflict: "stripe_subscription_id" });

  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret || !webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(secret);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error: insertError } = await admin.from("stripe_events").insert({
    event_id: event.id,
    event_type: event.type
  });

  if (insertError?.code === "23505") {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (insertError) {
    return NextResponse.json({ error: "Unable to record webhook event." }, { status: 500 });
  }

  try {
    if (event.type.startsWith("customer.subscription.")) {
      await syncSubscription(event.data.object as Stripe.Subscription);
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscription(subscription);
      }
    }

    const { error: markError } = await admin
      .from("stripe_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("event_id", event.id);

    if (markError) throw markError;
    return NextResponse.json({ received: true });
  } catch {
    // Remove the idempotency row so Stripe's retry can safely process this event again.
    await admin.from("stripe_events").delete().eq("event_id", event.id);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
