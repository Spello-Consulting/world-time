import { ipcMain } from "electron";
import { closeSettingsWindow, openSettingsWindow } from "./windows.js";

/** Register window-management IPC used by the renderer (menu + settings Esc-to-close). */
export function registerWindowHandlers(): void {
  ipcMain.handle("window:openSettings", async () => {
    await openSettingsWindow();
  });

  ipcMain.handle("window:closeSettings", () => {
    closeSettingsWindow();
  });
}
