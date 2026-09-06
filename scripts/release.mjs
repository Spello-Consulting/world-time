#!/usr/bin/env node
/**
 * Packaging wrapper that stamps the app's version and build number, then runs
 * electron-builder for the requested target.
 *
 *   node scripts/release.mjs <mas|dmg|dir>
 *
 * - Marketing version (CFBundleShortVersionString) comes from the most recent
 *   git tag reachable from HEAD, with a leading "v" stripped (e.g. v1.2.3 → 1.2.3).
 *   Falls back to package.json's version when no tag exists yet.
 * - Build number (CFBundleVersion) is a monotonic counter in build/build-number.txt
 *   that increments on every run, so each upload — including a re-upload of the same
 *   marketing version — gets a unique, higher build number automatically.
 *
 * Overrides (mostly for CI or one-off re-uploads):
 *   APP_VERSION=1.2.3        use this marketing version instead of the git tag
 *   BUILD_NUMBER=42          use this build number and DON'T touch the counter
 *   RELEASE_PRINT_ONLY=1     print the computed version/build and exit (no build, no write)
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const buildNumberFile = join(root, "build", "build-number.txt");

const TARGETS = {
  mas: ["--mac", "mas"],
  dmg: ["--mac", "dmg"],
  dir: ["--dir"],
};

const target = process.argv[2] ?? "mas";
const targetArgs = TARGETS[target];
if (!targetArgs) {
  console.error(`[release] Unknown target "${target}". Use one of: ${Object.keys(TARGETS).join(", ")}`);
  process.exit(1);
}

/** Most recent git tag reachable from HEAD, with a leading "v" stripped. */
function marketingVersion() {
  try {
    const tag = execFileSync("git", ["describe", "--tags", "--abbrev=0"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (tag) return tag.replace(/^v/, "");
  } catch {
    // No tags yet — fall through to package.json.
  }
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  console.warn(`[release] No git tag found — using package.json version ${pkg.version}`);
  return pkg.version;
}

/** Next build number. Increments and persists the counter unless `write` is false. */
function nextBuildNumber(write) {
  const current = existsSync(buildNumberFile)
    ? parseInt(readFileSync(buildNumberFile, "utf8").trim(), 10) || 0
    : 0;
  const next = current + 1;
  if (write) writeFileSync(buildNumberFile, `${next}\n`);
  return next;
}

const printOnly = process.env.RELEASE_PRINT_ONLY === "1";
const version = process.env.APP_VERSION || marketingVersion();
const build = process.env.BUILD_NUMBER || String(nextBuildNumber(!printOnly));

console.log(`[release] target=${target} version=${version} build=${build}`);

if (printOnly) process.exit(0);

execFileSync(
  join(root, "node_modules", ".bin", "electron-builder"),
  [...targetArgs, `-c.extraMetadata.version=${version}`, `-c.buildVersion=${build}`],
  { cwd: root, stdio: "inherit" },
);
