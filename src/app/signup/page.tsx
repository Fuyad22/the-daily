import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/" className="font-display text-2xl font-semibold text-ink">
        {SITE_NAME}
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <h1 className="mb-6 font-display text-xl font-semibold text-ink">
          Create an account
        </h1>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
