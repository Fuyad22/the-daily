// Pure role vocabulary — no "server-only" or next/headers imports, so client
// components can safely import roleLabel/hasRoleAtLeast without pulling the
// session/DB code in @/lib/auth/dal into the browser bundle.

export type Role = "reader" | "author" | "editor" | "admin" | "super_admin";

const ROLE_RANK: Record<Role, number> = {
  reader: 0,
  author: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
};

const ROLE_LABELS: Record<Role, string> = {
  reader: "Reader",
  author: "Author",
  editor: "Editor",
  admin: "Admin",
  super_admin: "Super Admin",
};

// Shared allow-lists so every studio page/action grants super_admin whatever
// admin can do, without repeating both role names at each call site.
export const STAFF_ROLES: Role[] = ["author", "editor", "admin", "super_admin"];
export const EDITORIAL_ROLES: Role[] = ["editor", "admin", "super_admin"];

export function roleOf(user: { role?: string | null } | null | undefined): Role {
  const role = user?.role as Role | undefined;
  return role && role in ROLE_RANK ? role : "reader";
}

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

export function hasRoleAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
