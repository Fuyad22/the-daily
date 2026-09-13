"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { buttonVariants } from "./button";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  pendingLabel?: string;
};

export function SubmitButton({
  variant,
  className,
  children,
  pendingLabel,
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(buttonVariants({ variant, className }), pending && "cursor-wait")}
      {...props}
    >
      {pending && <Spinner />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="h-3.5 w-3.5 flex-none animate-spin"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2.2"
        opacity="0.25"
      />
      <path
        d="M18 10a8 8 0 00-8-8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
