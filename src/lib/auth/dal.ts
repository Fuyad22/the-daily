import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth, type Role } from "@/lib/auth";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

const ROLE_RANK: Record<Role, number> = {
  reader: 0,
  author: 1,
  editor: 2,
  admin: 3,
};

export function roleOf(user: { role?: string | null } | null | undefined): Role {
  const role = user?.role as Role | undefined;
  return role && role in ROLE_RANK ? role : "reader";
}

export function hasRoleAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

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
