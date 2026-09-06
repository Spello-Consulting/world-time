import * as React from "react";
import { cn } from "../lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type ?? "text"}
      className={cn(
        "region-no-drag h-9 w-full rounded-[9px] bg-input px-3 text-[13px] text-primary",
        "border border-separator outline-none transition-colors",
        "placeholder:text-tertiary focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40",
        "disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
});
