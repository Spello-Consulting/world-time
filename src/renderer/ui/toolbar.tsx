import * as React from "react";
import { cn } from "../lib/cn";
import { Text } from "./text";

/** The toolbar strip doubles as a window drag region (interactive children opt out). */
export function Toolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "region-drag flex h-13 shrink-0 items-center gap-3 px-4",
        "border-b border-separator",
        className,
      )}
      {...props}
    />
  );
}

export function ToolbarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-w-0 flex-1 items-center gap-2", className)} {...props} />;
}

export function ToolbarTitle({
  className,
  ...props
}: Omit<React.HTMLAttributes<HTMLSpanElement>, "color">) {
  return <Text variant="large-strong" className={cn(className)} {...props} />;
}

export function ToolbarActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)} {...props} />
  );
}
