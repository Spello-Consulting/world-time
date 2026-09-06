import * as React from "react";
import { ToggleGroup as RadixToggleGroup } from "radix-ui";
import { cn } from "../lib/cn";

export interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

export function SegmentedControl({
  value,
  onValueChange,
  className,
  children,
  ...props
}: SegmentedControlProps) {
  return (
    <RadixToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => {
        // Radix emits "" when the active item is toggled off; ignore to keep a value selected.
        if (v) onValueChange(v);
      }}
      className={cn(
        "region-no-drag inline-flex h-9 items-center gap-0.5 rounded-[10px] bg-control-subtle p-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </RadixToggleGroup.Root>
  );
}

export const SegmentedControlItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixToggleGroup.Item>
>(function SegmentedControlItem({ className, ...props }, ref) {
  return (
    <RadixToggleGroup.Item
      ref={ref}
      className={cn(
        "inline-flex h-full min-w-9 items-center justify-center rounded-[8px] px-3 text-[12px] font-medium",
        "text-secondary transition-colors outline-none",
        "hover:text-primary focus-visible:ring-2 focus-visible:ring-accent/50",
        "data-[state=on]:bg-control data-[state=on]:text-primary data-[state=on]:shadow-sm",
        className,
      )}
      {...props}
    />
  );
});
