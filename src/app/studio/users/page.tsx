import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireRole, roleOf } from "@/lib/auth/dal";
import { UserRowActions } from "./user-row-actions";

export default async function UsersPage() {
  const currentUser = await requireRole(["admin"]);
  const { users } = await auth.api.listUsers({
    query: { sortBy: "createdAt", sortDirection: "desc", limit: 100 },
    headers: await headers(),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
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
            {users.map((user) => (
              <tr key={user.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{user.name}</td>
                <td className="px-5 py-3 text-muted">{user.email}</td>
                <td className="px-5 py-3">
                  {user.id === currentUser.id ? (
                    <span className="text-muted">{roleOf(user)} (you)</span>
                  ) : (
                    <UserRowActions
                      userId={user.id}
                      role={roleOf(user)}
                      banned={Boolean(user.banned)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
