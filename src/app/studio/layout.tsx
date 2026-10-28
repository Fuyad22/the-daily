import type { ReactNode } from "react";
import Link from "next/link";
import { hasRoleAtLeast, requireRole, roleLabel, STAFF_ROLES } from "@/lib/auth/dal";
import { SITE_NAME } from "@/lib/site";

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(STAFF_ROLES);
  const isEditorial = hasRoleAtLeast(user.role, "editor");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-line bg-surface px-4 py-6">
        <Link href="/" className="mb-8 block font-display text-lg font-semibold text-ink">
          {SITE_NAME}
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          <NavLink href="/studio">Dashboard</NavLink>
          <NavLink href="/studio/articles">Articles</NavLink>
          {isEditorial && (
            <>
              <NavLink href="/studio/categories">Categories</NavLink>
              <NavLink href="/studio/tags">Tags</NavLink>
              <NavLink href="/studio/comments">Comments</NavLink>
            </>
          )}
          {user.role === "super_admin" && <NavLink href="/studio/users">Users</NavLink>}
        </nav>
        <p className="mt-8 text-xs text-muted">
          Signed in as {user.name} · {roleLabel(user.role)}
        </p>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-ink/80 hover:bg-black/[0.04] hover:text-ink"
    >
      {children}
    </Link>
  );
}
