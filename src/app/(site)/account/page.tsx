import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser, roleOf } from "@/lib/auth/dal";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const role = roleOf(user);

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Account</h1>
      <div className="rounded-xl border border-line bg-surface p-6">
        <p className="text-sm text-muted">Name</p>
        <p className="mb-4 text-ink">{user.name}</p>
        <p className="text-sm text-muted">Email</p>
        <p className="mb-6 text-ink">{user.email}</p>
        <div className="flex items-center gap-3">
          <SignOutButton />
          {role !== "reader" && (
            <Link href="/studio" className="text-sm font-semibold text-accent">
              Go to Studio →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
