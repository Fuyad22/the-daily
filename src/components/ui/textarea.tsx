import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-lg border border-black/15 px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition-colors duration-150 placeholder:text-black/35 hover:border-black/25 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30",
        className
      )}
      {...props}
    />
  );
}
