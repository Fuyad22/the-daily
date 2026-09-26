"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { roleLabel, type Role } from "@/lib/auth/roles";

const ROLES: Role[] = ["reader", "author", "editor", "admin", "super_admin"];

export function UserRowActions({
  userId,
  role,
  banned,
  emailVerified,
}: {
  userId: string;
  role: Role;
  banned: boolean;
  emailVerified: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRoleChange(next: Role) {
    startTransition(async () => {
      // The admin client's role type only knows Better Auth's own default
      // "user"/"admin" pair — our own role tiers live entirely in the `role`
      // text column and our own DAL, so the server accepts any string here.
      await authClient.admin.setRole({ userId, role: next as unknown as "admin" | "user" });
      router.refresh();
    });
  }

  function handleBanToggle() {
    startTransition(async () => {
      if (banned) {
        await authClient.admin.unbanUser({ userId });
      } else {
        await authClient.admin.banUser({ userId });
      }
      router.refresh();
    });
  }

  function handleVerifyEmail() {
    startTransition(async () => {
      await authClient.admin.updateUser({ userId, data: { emailVerified: true } });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        disabled={pending}
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        className="rounded-lg border border-black/15 px-2 py-1 text-sm text-ink outline-none focus-visible:border-accent"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {roleLabel(r)}
          </option>
        ))}
      </select>
      {!emailVerified && (
        <Button variant="ghost" disabled={pending} onClick={handleVerifyEmail}>
          Verify email
        </Button>
      )}
      <Button variant="ghost" disabled={pending} onClick={handleBanToggle}>
        {banned ? "Unban" : "Ban"}
      </Button>
    </div>
  );
}
