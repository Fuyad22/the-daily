import type { Metadata } from "next";
import { isStripeConfigured } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/subscriptions/actions";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

export const metadata: Metadata = { title: "Subscribe" };

export default function SubscribePage() {
  const configured = isStripeConfigured() && Boolean(process.env.STRIPE_PRICE_ID_MONTHLY);

  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">Subscribe to The Daily</h1>
      <p className="mt-3 text-muted">Full access to every story, for one monthly price.</p>
      <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-line bg-surface p-8">
        <p className="font-display text-4xl font-semibold text-ink">
          $8<span className="text-base font-normal text-muted">/month</span>
        </p>
        {configured ? (
          <form
            action={async () => {
              "use server";
              await createCheckoutSession();
            }}
            className="mt-6"
          >
            <SubmitButton className="w-full" pendingLabel="Redirecting…">
              Subscribe
            </SubmitButton>
          </form>
        ) : (
          <>
            <Button disabled className="mt-6 w-full">
              Coming soon
            </Button>
            <p className="mt-4 text-sm text-muted">
              Subscriptions aren&rsquo;t live yet — check back soon.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
