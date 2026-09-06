import { Text } from "./text";
import { Button } from "./button";

export interface ErrorBoundaryViewProps {
  error: Error;
  reset?: () => void;
}

/** Fallback shown by the router when a route throws. */
export function ErrorBoundaryView({ error, reset }: ErrorBoundaryViewProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="region-drag fixed top-0 right-0 left-0 h-13" />
      <Text variant="large-strong">Something went wrong</Text>
      <Text variant="small" color="tertiary" className="max-w-md">
        {error?.message ?? "An unexpected error occurred."}
      </Text>
      {reset ? (
        <Button variant="accent" onClick={reset} className="mt-1">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
