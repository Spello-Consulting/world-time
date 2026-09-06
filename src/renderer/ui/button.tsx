import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "region-no-drag inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium select-none transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-control hover:bg-control-active text-primary",
        accent: "bg-accent hover:bg-accent/90 text-white",
        transparent: "bg-transparent hover:bg-control-subtle text-primary",
      },
      size: {
        default: "h-8 px-3.5 text-[13px] rounded-[9px]",
        small: "h-7 px-2.5 text-[12px] rounded-[8px]",
      },
      iconOnly: {
        true: "px-0 aspect-square",
      },
    },
    compoundVariants: [
      { size: "default", iconOnly: true, className: "w-8" },
      { size: "small", iconOnly: true, className: "w-7" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, iconOnly, asChild = false, type, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, iconOnly }), className)}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  );
});
