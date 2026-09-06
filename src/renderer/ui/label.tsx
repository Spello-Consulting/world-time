import * as React from "react";
import { Label as RadixLabel } from "radix-ui";
import { cn } from "../lib/cn";

export type LabelProps = React.ComponentPropsWithoutRef<typeof RadixLabel.Root>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, ...props },
  ref,
) {
  return (
    <RadixLabel.Root
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] text-primary select-none",
        className,
      )}
      {...props}
    />
  );
});
