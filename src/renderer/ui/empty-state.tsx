import * as React from "react";
import { cn } from "../lib/cn";
import { Text } from "./text";

export interface EmptyStateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  placement?: "viewport" | "inline";
  className?: string;
}

export function EmptyState({
  title,
  description,
  actions,
  placement = "inline",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        placement === "viewport" ? "h-full min-h-[60vh] p-8" : "p-8",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1.5 max-w-sm">
        <Text variant="large-strong">{title}</Text>
        {description ? (
          <Text variant="small" color="tertiary">
            {description}
          </Text>
        ) : null}
      </div>
      {actions ? <div className="mt-1 flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
