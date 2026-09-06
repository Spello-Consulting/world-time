/**
 * Lightweight logging init. Replaces Glaze's initLogging; kept as a hook point
 * in case structured logging is added later. Currently a no-op that leaves the
 * console untouched.
 */
export function initLogging(): void {
  // Intentionally empty.
}
