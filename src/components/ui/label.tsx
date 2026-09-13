import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-[13px] font-semibold text-[#46454A]", className)}
      {...props}
    />
  );
}
