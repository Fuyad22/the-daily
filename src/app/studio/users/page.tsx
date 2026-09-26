import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireRole, roleLabel, roleOf } from "@/lib/auth/dal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRowActions } from "./user-row-actions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const currentUser = await requireRole(["super_admin"]);
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";

  const { users } = await auth.api.listUsers({
    query: { sortBy: "createdAt", sortDirection: "desc", limit: 100 },
    headers: await headers(),
  });

  const filtered = query
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      )
    : users;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
        <form action="/studio/users" className="flex gap-2">
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name or email…"
            className="w-64"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>
      {query && (
        <p className="text-sm text-muted">
          {filtered.length} result{filtered.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{user.name}</td>
                  <td className="px-5 py-3 text-muted">
                    {user.email}
                    {!user.emailVerified && (
                      <span className="ml-2 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {user.id === currentUser.id ? (
                      <span className="text-muted">{roleLabel(roleOf(user))} (you)</span>
                    ) : (
                      <UserRowActions
                        userId={user.id}
                        role={roleOf(user)}
                        banned={Boolean(user.banned)}
                        emailVerified={Boolean(user.emailVerified)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
