import * as React from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./button";
import { Text } from "./text";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: "default" | "large";
  showCloseButton?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void;
  children?: React.ReactNode;
}

const SIZES: Record<NonNullable<DialogProps["size"]>, string> = {
  default: "max-w-md",
  large: "max-w-xl",
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  size = "default",
  showCloseButton = false,
  confirmLabel,
  onConfirm,
  children,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <RadixDialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-4rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
            "rounded-[20px] border border-separator bg-white/90 shadow-2xl backdrop-blur-2xl outline-none",
            "dark:bg-[#232325]/92",
            SIZES[size],
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
            <div className="flex flex-col gap-1">
              <RadixDialog.Title asChild>
                <Text variant="large-strong">{title}</Text>
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description asChild>
                  <Text variant="small" color="tertiary">
                    {description}
                  </Text>
                </RadixDialog.Description>
              ) : null}
            </div>
            {showCloseButton ? (
              <RadixDialog.Close asChild>
                <Button iconOnly variant="transparent" size="small" aria-label="Close">
                  <X className="size-4" />
                </Button>
              </RadixDialog.Close>
            ) : null}
          </div>

          {children}

          {confirmLabel ? (
            <div className="flex justify-end gap-2 px-6 pt-3 pb-5">
              <Button variant="accent" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string;
}

export function DialogBody({ className, maxHeight, style, ...props }: DialogBodyProps) {
  return (
    <div
      className={cn("overflow-y-auto px-6", className)}
      style={{ maxHeight, ...style }}
      {...props}
    />
  );
}
