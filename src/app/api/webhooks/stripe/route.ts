import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

async function upsertSubscription(data: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  status?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, data.userId),
  });

  if (existing) {
    await db.update(subscriptions).set(data).where(eq(subscriptions.userId, data.userId));
  } else {
    await db.insert(subscriptions).values({ ...data, cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false });
  }
}

function customerId(customer: string | { id: string } | null): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const stripeCustomerId = customerId(session.customer);
    if (session.mode === "subscription" && userId && stripeCustomerId) {
      await upsertSubscription({
        userId,
        stripeCustomerId,
        stripeSubscriptionId:
          typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;
    const stripeCustomerId = customerId(subscription.customer);
    const item = subscription.items.data[0];

    if (userId && stripeCustomerId) {
      await upsertSubscription({
        userId,
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: item?.price.id ?? null,
        status: subscription.status,
        currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const stripeCustomerId = customerId(invoice.customer);
    if (stripeCustomerId) {
      await db
        .update(subscriptions)
        .set({ status: "past_due" })
        .where(eq(subscriptions.stripeCustomerId, stripeCustomerId));
    }
  }

  return NextResponse.json({ received: true });
}
