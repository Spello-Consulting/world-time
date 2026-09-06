import { useEffect, useRef, useState } from "react";

/**
 * Returns a Date that updates on an interval. Defaults to 1-second ticks.
 * When `intervalMs` is null, the date is frozen (no timer).
 */
export function useNow(intervalMs: number | null = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  const savedRef = useRef(intervalMs);
  savedRef.current = intervalMs;

  useEffect(() => {
    if (intervalMs === null) return;
    setNow(new Date());
    const id = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
