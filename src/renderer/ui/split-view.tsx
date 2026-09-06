import * as React from "react";
import { cn } from "../lib/cn";

export interface SplitViewProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  /** localStorage key used to persist the sidebar width. */
  storageKey?: string;
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 260;

function loadWidth(storageKey?: string): number {
  if (!storageKey) return DEFAULT_WIDTH;
  try {
    const raw = localStorage.getItem(`splitview:${storageKey}`);
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n)) return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n));
  } catch {
    // ignore
  }
  return DEFAULT_WIDTH;
}

export function SplitView({
  sidebar,
  storageKey,
  className,
  children,
  ...props
}: SplitViewProps) {
  const [width, setWidth] = React.useState(() => loadWidth(storageKey));
  const draggingRef = React.useRef(false);

  // When there's no sidebar this is just a plain full-height container.
  if (!sidebar) {
    return (
      <div className={cn("h-full min-h-0", className)} {...props}>
        {children}
      </div>
    );
  }

  const persist = (w: number) => {
    if (!storageKey) return;
    try {
      localStorage.setItem(`splitview:${storageKey}`, String(w));
    } catch {
      // ignore
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    const startX = e.clientX;
    const startWidth = width;

    const onMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + (ev.clientX - startX)));
      setWidth(next);
    };
    const onUp = () => {
      draggingRef.current = false;
      persist(width);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className={cn("flex h-full min-h-0", className)} {...props}>
      <aside
        className="h-full min-h-0 shrink-0 border-r border-separator"
        style={{ width }}
      >
        {sidebar}
      </aside>
      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={onPointerDown}
        className="region-no-drag w-1 shrink-0 cursor-col-resize hover:bg-accent/30"
      />
      <main className="h-full min-h-0 min-w-0 flex-1">{children}</main>
    </div>
  );
}
