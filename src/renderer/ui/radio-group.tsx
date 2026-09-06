import * as React from "react";
import { RadioGroup as RadixRadioGroup } from "radix-ui";
import { cn } from "../lib/cn";

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Root> {}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { className, ...props },
  ref,
) {
  return (
    <RadixRadioGroup.Root
      ref={ref}
      className={cn(
        "flex gap-4 data-[orientation=vertical]:flex-col data-[orientation=horizontal]:flex-row",
        className,
      )}
      {...props}
    />
  );
});

export const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>
>(function RadioGroupItem({ className, ...props }, ref) {
  return (
    <RadixRadioGroup.Item
      ref={ref}
      className={cn(
        "region-no-drag size-[18px] shrink-0 rounded-full border border-field bg-input outline-none transition-colors",
        "border-separator data-[state=checked]:border-accent data-[state=checked]:bg-accent",
        "focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <RadixRadioGroup.Indicator className="flex size-full items-center justify-center">
        <span className="size-1.5 rounded-full bg-white" />
      </RadixRadioGroup.Indicator>
    </RadixRadioGroup.Item>
  );
});
