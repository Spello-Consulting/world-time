import { join } from "node:path";
import { BrowserWindow, shell } from "electron";

const isDev = !!process.env["ELECTRON_RENDERER_URL"];

/** Resolve a renderer window URL: dev server in development, built file in production. */
function windowUrl(htmlFileName: string): { url?: string; file?: string } {
  if (isDev) {
    return { url: `${process.env["ELECTRON_RENDERER_URL"]}/${htmlFileName}` };
  }
  return { file: join(__dirname, "../renderer", htmlFileName) };
}

function loadWindow(win: BrowserWindow, htmlFileName: string): Promise<void> {
  const target = windowUrl(htmlFileName);
  return target.url ? win.loadURL(target.url) : win.loadFile(target.file!);
}

const preloadPath = join(__dirname, "../preload/index.mjs");

const sharedWebPreferences = {
  preload: preloadPath,
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: false,
};

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export async function createMainWindow(): Promise<BrowserWindow> {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 920,
    height: 680,
    minWidth: 480,
    minHeight: 500,
    title: "World Time",
    show: false,
    titleBarStyle: "hiddenInset",
    vibrancy: "sidebar",
    visualEffectState: "active",
    backgroundColor: "#00000000",
    webPreferences: sharedWebPreferences,
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Open external links (if any are ever added) in the default browser, not a new window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  await loadWindow(mainWindow, "main-window.html");
  return mainWindow;
}

export async function openSettingsWindow(): Promise<void> {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 300,
    minWidth: 400,
    minHeight: 200,
    title: "Settings",
    show: false,
    center: true,
    titleBarStyle: "hiddenInset",
    vibrancy: "sidebar",
    visualEffectState: "active",
    backgroundColor: "#00000000",
    webPreferences: sharedWebPreferences,
  });

  settingsWindow.once("ready-to-show", () => settingsWindow?.show());
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });

  await loadWindow(settingsWindow, "settings-window.html");
}

export function closeSettingsWindow(): void {
  settingsWindow?.close();
}
