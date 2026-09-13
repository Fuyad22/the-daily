import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { isStripeConfigured } from "@/lib/stripe";
import { createBillingPortalSession } from "@/lib/subscriptions/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { formatArticleDate } from "@/lib/format";

export const metadata: Metadata = { title: "Billing" };

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/billing");

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
  });
  const isActive = Boolean(subscription?.status && ACTIVE_STATUSES.has(subscription.status));

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Billing</h1>
      <div className="rounded-xl border border-line bg-surface p-6">
        {isActive ? (
          <>
            <p className="text-sm text-muted">Status</p>
            <p className="mb-4 capitalize text-ink">{subscription!.status}</p>
            {subscription!.currentPeriodEnd && (
              <>
                <p className="text-sm text-muted">
                  {subscription!.cancelAtPeriodEnd ? "Ends on" : "Renews on"}
                </p>
                <p className="mb-6 text-ink">{formatArticleDate(subscription!.currentPeriodEnd)}</p>
              </>
            )}
            {isStripeConfigured() ? (
              <form
                action={async () => {
                  "use server";
                  await createBillingPortalSession();
                }}
              >
                <SubmitButton variant="secondary" pendingLabel="Opening…">
                  Manage subscription
                </SubmitButton>
              </form>
            ) : null}
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">You don&rsquo;t have an active subscription.</p>
            <Link href="/subscribe" className={buttonVariants()}>
              Subscribe
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
