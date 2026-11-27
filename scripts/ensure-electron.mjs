#!/usr/bin/env node
/**
 * Postinstall self-heal for the Electron binary.
 *
 * electron's own postinstall downloads a (valid) platform zip and unpacks it
 * with extract-zip, then writes node_modules/electron/path.txt pointing at the
 * executable. On some machines extract-zip fails PART-WAY THROUGH yet still
 * exits 0, leaving a truncated Electron.app and no path.txt — after which
 * electron-vite aborts `npm run dev` with "Error: Electron uninstall".
 *
 * This script runs after `npm install` (a root lifecycle script always runs; it
 * is not subject to npm 11's dependency-script approval gate the way a
 * dependency's own install scripts are). It verifies the Electron install and,
 * when it's broken, re-extracts the platform zip — downloading it first only if
 * it isn't already in @electron/get's cache — with the OS-native unzipper
 * (`ditto` on macOS, `tar` on Windows, `unzip` elsewhere), which unpacks the
 * .app bundle's symlinks reliably where extract-zip fell over.
 *
 * It is idempotent and cheap when the install is healthy (one stat check, then
 * exit). It never aborts `npm install`: if it can't repair, it prints the manual
 * remedy and exits 0.
 *
 * Opt out with ELECTRON_SKIP_BINARY_DOWNLOAD=1 (the same flag electron honours).
 */

import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const electronDir = join(root, "node_modules", "electron");

const log = (msg) => console.log(`[ensure-electron] ${msg}`);

// Nothing to do if electron isn't installed (e.g. a production `npm ci --omit=dev`)
// or if the caller explicitly opted out of fetching the binary.
if (!existsSync(electronDir) || process.env.ELECTRON_SKIP_BINARY_DOWNLOAD) {
  process.exit(0);
}

/** The executable's path inside dist/, matching electron's own getPlatformPath(). */
function execRelPath() {
  switch (process.platform) {
    case "darwin":
      return "Electron.app/Contents/MacOS/Electron";
    case "win32":
      return "electron.exe";
    default:
      return "electron";
  }
}

const rel = execRelPath();
const distDir = join(electronDir, "dist");
const pathTxt = join(electronDir, "path.txt");
const execPath = join(distDir, rel);
const version = JSON.parse(readFileSync(join(electronDir, "package.json"), "utf8")).version;

/**
 * True when the install is complete and usable: path.txt points at the
 * executable, the executable exists, and — on macOS — the bulk of the bundle
 * (the framework) is present, which is what a truncated extract-zip run drops.
 */
function isHealthy() {
  try {
    if (readFileSync(pathTxt, "utf8").trim() !== rel) return false;
    if (!existsSync(execPath)) return false;
    if (
      process.platform === "darwin" &&
      !existsSync(join(distDir, "Electron.app/Contents/Frameworks/Electron Framework.framework"))
    ) {
      return false;
    }
  } catch {
    return false; // path.txt missing
  }
  return true;
}

/** Unpack a zip with the platform's native tool (robust with .app symlinks). */
function extractZip(zip, dest) {
  if (process.platform === "darwin") {
    execFileSync("ditto", ["-x", "-k", zip, dest], { stdio: "inherit" });
  } else if (process.platform === "win32") {
    // tar ships with Windows 10+ (bsdtar) and reads .zip natively.
    execFileSync("tar", ["-xf", zip, "-C", dest], { stdio: "inherit" });
  } else {
    execFileSync("unzip", ["-oq", zip, "-d", dest], { stdio: "inherit" });
  }
}

if (isHealthy()) process.exit(0);

log(`Electron ${version} looks incomplete — repairing the binary…`);

try {
  // Resolve @electron/get from electron's own dependency tree. downloadArtifact
  // returns the cached zip (downloading only if absent), so a healthy cache makes
  // this an offline, fast operation.
  const require = createRequire(join(electronDir, "package.json"));
  const { downloadArtifact } = require("@electron/get");

  const zipPath = await downloadArtifact({
    version,
    artifactName: "electron",
    platform: process.platform,
    arch: process.arch,
  });

  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });
  extractZip(zipPath, distDir);

  // electron's installer hoists dist/electron.d.ts up to the package root.
  const srcDts = join(distDir, "electron.d.ts");
  if (existsSync(srcDts)) renameSync(srcDts, join(electronDir, "electron.d.ts"));

  if (!existsSync(execPath)) {
    throw new Error(`extraction did not produce ${rel}`);
  }

  writeFileSync(pathTxt, rel);
  log(`Repaired Electron ${version} → dist/${rel}`);
} catch (err) {
  log(`Could not repair Electron automatically: ${err.message}`);
  log("Fix it manually with: rm -rf node_modules/electron && npm install");
  // Don't fail `npm install` over this — surface the problem and move on.
  process.exit(0);
}
