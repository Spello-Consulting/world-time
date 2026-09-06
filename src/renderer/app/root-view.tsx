import { Outlet } from "@tanstack/react-router";
import { SplitView } from "../ui";
import { useTheme } from "../hooks/use-theme";

export function RootView() {
  useTheme();

  // Each view supplies its own draggable top strip (the Toolbar and the
  // sidebar header are `region-drag`), so no global overlay is needed here —
  // a full-width fixed strip would sit above the toolbar and swallow clicks.
  return (
    <div className="relative h-full">
      <SplitView className="h-full">
        <Outlet />
      </SplitView>
    </div>
  );
}
