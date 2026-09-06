import { app, BrowserWindow } from "electron";
import { createMainWindow } from "./windows.js";
import { setupApplicationMenu } from "./menu.js";
import { registerThemeHandlers } from "./theme.js";
import { registerWindowHandlers } from "./ipc.js";

app.whenReady().then(() => {
  registerThemeHandlers();
  registerWindowHandlers();
  setupApplicationMenu();

  void createMainWindow();

  app.on("activate", () => {
    // On macOS re-create the window when the dock icon is clicked and none are open.
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // On macOS apps typically stay active until the user quits explicitly.
  if (process.platform !== "darwin") {
    app.quit();
  }
});
