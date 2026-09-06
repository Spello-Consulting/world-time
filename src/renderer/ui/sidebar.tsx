import * as React from "react";
import { cn } from "../lib/cn";
import { Input } from "./input";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export function Sidebar({
  searchable,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  actions,
  className,
  children,
  ...props
}: SidebarProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)} {...props}>
      {/* Top strip aligns under the traffic lights and is draggable. */}
      <div className="region-drag h-13 shrink-0" />
      {searchable ? (
        <div className="region-no-drag flex items-center gap-2 px-3 pb-2">
          <Input
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8"
          />
          {actions}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export function SidebarList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-0.5 px-2 pb-2", className)} {...props} />;
}

export interface SidebarListItemProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  accessory?: React.ReactNode;
  className?: string;
}

export function SidebarListItem({
  icon,
  title,
  subtitle,
  accessory,
  className,
}: SidebarListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 transition-colors hover:bg-list-hover",
        className,
      )}
    >
      {icon ? <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] text-primary">{title}</span>
        {subtitle ? <span className="truncate text-[11px] text-tertiary">{subtitle}</span> : null}
      </div>
      {accessory ? (
        <span className="shrink-0 text-[12px] tabular-nums text-secondary">{accessory}</span>
      ) : null}
    </div>
  );
}
