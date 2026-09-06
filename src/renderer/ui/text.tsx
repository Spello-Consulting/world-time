import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const textVariants = cva("", {
  variants: {
    variant: {
      heading1: "text-[26px] font-semibold leading-tight tracking-tight",
      "extra-large": "text-[18px] leading-snug",
      large: "text-[15px] leading-snug",
      "large-strong": "text-[15px] font-semibold leading-snug",
      regular: "text-[13px] leading-normal",
      strong: "text-[13px] font-semibold leading-normal",
      small: "text-[12px] leading-normal",
      "small-strong": "text-[12px] font-semibold leading-normal",
      mini: "text-[11px] leading-normal",
      "mini-strong": "text-[11px] font-semibold leading-normal",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      tertiary: "text-tertiary",
      quaternary: "text-quaternary",
      accent: "text-accent",
    },
    truncate: {
      true: "truncate min-w-0",
    },
  },
  defaultVariants: {
    variant: "regular",
    color: "primary",
  },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof textVariants> {
  asChild?: boolean;
}

export function Text({ variant, color, truncate, className, ...props }: TextProps) {
  return <span className={cn(textVariants({ variant, color, truncate }), className)} {...props} />;
}
