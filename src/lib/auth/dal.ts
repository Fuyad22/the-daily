import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import {
  roleOf,
  roleLabel,
  hasRoleAtLeast,
  STAFF_ROLES,
  EDITORIAL_ROLES,
  type Role,
} from "./roles";

export { roleOf, roleLabel, hasRoleAtLeast, STAFF_ROLES, EDITORIAL_ROLES };
export type { Role };

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

/**
 * The real authorization boundary — call this at the top of every studio page
 * AND independently inside every mutating Server Action. A Proxy matcher does
 * not protect Server Actions on the same path, so page-level checks alone are
 * not enough.
 */
export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const role = roleOf(user);
  if (!roles.includes(role)) {
    redirect("/");
  }
  return { ...user, role };
}
