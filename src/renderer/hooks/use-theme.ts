import { useEffect } from "react";

/**
 * Keeps the document's `.dark` class in sync with the native theme.
 *
 * On mount it reads the current native theme info and applies it, then
 * subscribes to updates broadcast by the main process (which fire when the
 * user changes the theme in Settings or the OS appearance changes).
 */
export function useTheme(): void {
  useEffect(() => {
    // The bridge is absent when the renderer runs outside Electron; the
    // prefers-color-scheme class set in the HTML remains the fallback.
    if (!window.api?.nativeTheme) return;

    let active = true;

    const apply = (shouldUseDarkColors: boolean) => {
      document.documentElement.classList.toggle("dark", shouldUseDarkColors);
    };

    window.api.nativeTheme
      .getInfo()
      .then((info) => {
        if (active) apply(info.shouldUseDarkColors);
      })
      .catch(() => {
        // Fall back to the prefers-color-scheme class already set in the HTML.
      });

    const unsubscribe = window.api.nativeTheme.onUpdated((info) => {
      apply(info.shouldUseDarkColors);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
}
