import * as React from "react";
import { Tabs as RadixTabs } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

export const TabsRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Root>
>(function TabsRoot({ className, ...props }, ref) {
  return <RadixTabs.Root ref={ref} className={cn(className)} {...props} />;
});

const tabsListVariants = cva("region-no-drag inline-flex items-center gap-0.5", {
  variants: {
    variant: {
      default: "rounded-[10px] bg-control-subtle p-0.5",
      glass: "rounded-full bg-control-subtle p-0.5",
    },
    size: {
      default: "h-8",
      large: "h-9",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof RadixTabs.List>,
    VariantProps<typeof tabsListVariants> {}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { className, variant, size, ...props },
  ref,
) {
  return (
    <RadixTabs.List
      ref={ref}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    />
  );
});

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <RadixTabs.Trigger
      ref={ref}
      className={cn(
        "inline-flex h-full items-center gap-1.5 rounded-full px-3 text-[13px] font-medium whitespace-nowrap",
        "text-secondary transition-colors outline-none",
        "hover:text-primary focus-visible:ring-2 focus-visible:ring-accent/50",
        "data-[state=active]:bg-control data-[state=active]:text-primary data-[state=active]:shadow-sm",
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <RadixTabs.Content ref={ref} className={cn("outline-none", className)} {...props} />
  );
});
