import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { roleOf } from "@/lib/auth/dal";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function hasPremiumAccess(
  user: { id: string; role?: string | null } | null | undefined
): Promise<boolean> {
  if (!user) return false;
  if (roleOf(user) !== "reader") return true; // staff bypass the paywall

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
  });
  return Boolean(subscription?.status && ACTIVE_STATUSES.has(subscription.status));
}
