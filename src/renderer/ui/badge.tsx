import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center font-medium rounded-full whitespace-nowrap tabular-nums",
  {
    variants: {
      color: {
        secondary: "bg-control text-secondary",
        yellow: "bg-support-yellow/15 text-support-yellow",
        blue: "bg-support-blue/15 text-support-blue",
      },
      size: {
        small: "h-[18px] px-1.5 text-[11px]",
        default: "h-5 px-2 text-[12px]",
      },
    },
    defaultVariants: {
      color: "secondary",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, color, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ color, size }), className)} {...props} />;
}
