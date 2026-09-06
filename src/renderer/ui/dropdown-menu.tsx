import * as React from "react";
import { DropdownMenu as RadixDropdownMenu } from "radix-ui";
import { ArrowUp, ArrowDown, Trash2, type LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

/** Named icons the app references on menu items. */
const ICONS: Record<string, LucideIcon> = {
  arrow_up: ArrowUp,
  arrow_down: ArrowDown,
  trash: Trash2,
};

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, align = "end", ...props }, ref) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-[180px] rounded-[12px] border border-separator bg-white/85 p-1 shadow-lg backdrop-blur-xl",
          "dark:bg-[#2a2a2c]/90",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className,
        )}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
});

export interface DropdownMenuItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item>, "color"> {
  icon?: string;
  color?: "default" | "red";
}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem({ className, icon, color = "default", children, ...props }, ref) {
    const Icon = icon ? ICONS[icon] : undefined;
    return (
      <RadixDropdownMenu.Item
        ref={ref}
        className={cn(
          "flex cursor-default items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] outline-none select-none",
          "data-[highlighted]:bg-list-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
          color === "red"
            ? "text-support-red data-[highlighted]:bg-support-red/10"
            : "text-primary",
          className,
        )}
        {...props}
      >
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        {children}
      </RadixDropdownMenu.Item>
    );
  },
);

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <RadixDropdownMenu.Separator className={cn("my-1 h-px bg-separator", className)} />;
}
