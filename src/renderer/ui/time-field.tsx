import { cn } from "../lib/cn";

export interface TimeFieldProps {
  /** Value in "HH:MM" (24-hour) form. */
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}

/**
 * A time input backed by the native `<input type="time">`, which reads and
 * writes "HH:MM" strings — matching the app's value contract while giving a
 * locale-aware editor and keyboard stepping for free.
 */
export function TimeField({ value, onValueChange, className, ...props }: TimeFieldProps) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "region-no-drag h-9 rounded-[9px] bg-input px-3 text-[13px] tabular-nums text-primary",
        "border border-separator outline-none transition-colors",
        "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      )}
      {...props}
    />
  );
}
