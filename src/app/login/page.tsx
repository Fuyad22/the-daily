import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/" className="font-display text-2xl font-semibold text-ink">
        {SITE_NAME}
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <h1 className="mb-6 font-display text-xl font-semibold text-ink">Sign in</h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted">
          Don&rsquo;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-accent">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
