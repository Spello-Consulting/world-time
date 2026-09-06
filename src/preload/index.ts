import { contextBridge, ipcRenderer } from "electron";

export type ThemeSource = "system" | "light" | "dark";

export interface NativeThemeInfo {
  themeSource: ThemeSource;
  shouldUseDarkColors: boolean;
}

/**
 * The full native surface this app needs. Exposed on `window.api` in an
 * isolated world — no direct ipcRenderer access reaches page scripts.
 */
const api = {
  nativeTheme: {
    getInfo: (): Promise<NativeThemeInfo> => ipcRenderer.invoke("nativeTheme:getInfo"),
    setThemeSource: (source: ThemeSource): Promise<NativeThemeInfo> =>
      ipcRenderer.invoke("nativeTheme:setThemeSource", source),
    /** Subscribe to OS/theme-source changes. Returns an unsubscribe function. */
    onUpdated: (callback: (info: NativeThemeInfo) => void): (() => void) => {
      const listener = (_event: unknown, info: NativeThemeInfo) => callback(info);
      ipcRenderer.on("nativeTheme:updated", listener);
      return () => ipcRenderer.removeListener("nativeTheme:updated", listener);
    },
  },
  windows: {
    openSettings: (): Promise<void> => ipcRenderer.invoke("window:openSettings"),
    closeSettings: (): Promise<void> => ipcRenderer.invoke("window:closeSettings"),
  },
};

contextBridge.exposeInMainWorld("api", api);

export type AppApi = typeof api;
