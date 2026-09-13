import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

export function buttonVariants({
  variant = "primary",
  className,
}: {
  variant?: ButtonVariant;
  className?: string;
} = {}) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-y-0",
    variant === "primary" &&
      "bg-accent px-5 py-2.5 text-accent-ink shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 active:shadow-sm",
    variant === "secondary" &&
      "border border-black/15 px-5 py-2.5 text-ink hover:border-black/25 hover:bg-black/[0.03]",
    variant === "ghost" && "px-2 py-1.5 text-muted transition-colors hover:text-ink",
    className
  );
}

export function Button({
  variant,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonVariants({ variant, className })} {...props} />;
}
