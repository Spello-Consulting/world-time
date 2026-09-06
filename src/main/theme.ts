import { BrowserWindow, ipcMain, nativeTheme } from "electron";

export type ThemeSource = "system" | "light" | "dark";

export interface NativeThemeInfo {
  themeSource: ThemeSource;
  shouldUseDarkColors: boolean;
}

function getInfo(): NativeThemeInfo {
  return {
    themeSource: nativeTheme.themeSource,
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
  };
}

/**
 * Wire the renderer-facing nativeTheme bridge and broadcast changes to every
 * window so the main and settings windows keep their `.dark` class in sync.
 */
export function registerThemeHandlers(): void {
  ipcMain.handle("nativeTheme:getInfo", () => getInfo());

  ipcMain.handle("nativeTheme:setThemeSource", (_event, source: ThemeSource) => {
    nativeTheme.themeSource = source;
    return getInfo();
  });

  nativeTheme.on("updated", () => {
    const info = getInfo();
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send("nativeTheme:updated", info);
    }
  });
}
