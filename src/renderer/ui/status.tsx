import * as React from "react";
import { cn } from "../lib/cn";

export interface StatusProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "info";
}

export function Status({ variant = "info", className, ...props }: StatusProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px]",
        variant === "error"
          ? "bg-support-red/12 text-support-red"
          : "bg-control text-secondary",
        className,
      )}
      {...props}
    />
  );
}
