"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

function siteUrl(): string {
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

export async function createCheckoutSession(): Promise<{ error: string } | undefined> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/subscribe");

  if (!isStripeConfigured() || !process.env.STRIPE_PRICE_ID_MONTHLY) {
    return { error: "Subscriptions aren't configured yet." };
  }

  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID_MONTHLY, quantity: 1 }],
    customer: existing?.stripeCustomerId ?? undefined,
    customer_email: existing?.stripeCustomerId ? undefined : user.email,
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
    success_url: `${siteUrl()}/account/billing?checkout=success`,
    cancel_url: `${siteUrl()}/subscribe`,
  });

  if (!session.url) return { error: "Could not start checkout." };
  redirect(session.url);
}

export async function createBillingPortalSession(): Promise<{ error: string } | undefined> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/billing");

  if (!isStripeConfigured()) return { error: "Billing isn't configured yet." };

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
  });
  if (!subscription?.stripeCustomerId) {
    return { error: "No subscription found for your account yet." };
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${siteUrl()}/account/billing`,
  });

  redirect(session.url);
}
