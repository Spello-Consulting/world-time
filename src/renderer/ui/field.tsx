import * as React from "react";
import { cn } from "../lib/cn";

export function FieldSet({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-3", className)} {...props} />;
}

export function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 rounded-card bg-control-subtle/60 p-1.5", className)}
      {...props}
    />
  );
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Field({ orientation = "vertical", className, ...props }: FieldProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-[9px] px-2.5 py-2",
        orientation === "horizontal" ? "flex-row items-center justify-between" : "flex-col",
        className,
      )}
      {...props}
    />
  );
}

export function FieldContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-w-0 flex-col gap-0.5", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] text-primary select-none", className)} {...props} />;
}
