import * as React from "react";
import { Switch as RadixSwitch } from "radix-ui";
import { cn } from "../lib/cn";

export type SwitchProps = React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>;

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <RadixSwitch.Root
      ref={ref}
      className={cn(
        "region-no-drag peer inline-flex h-[26px] w-[42px] shrink-0 cursor-pointer items-center rounded-full",
        "border border-transparent transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40",
        "data-[state=unchecked]:bg-control-active data-[state=checked]:bg-accent",
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          "pointer-events-none block size-[22px] rounded-full bg-white shadow-sm transition-transform",
          "data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[18px]",
        )}
      />
    </RadixSwitch.Root>
  );
});
