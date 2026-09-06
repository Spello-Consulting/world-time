import * as React from "react";
import { cn } from "../lib/cn";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional sticky header (usually a Toolbar) rendered above the scroll body. */
  toolbar?: React.ReactNode;
}

/** A vertical scroll container with an optional non-scrolling toolbar header. */
export function ScrollArea({ toolbar, className, children, ...props }: ScrollAreaProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)} {...props}>
      {toolbar}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
