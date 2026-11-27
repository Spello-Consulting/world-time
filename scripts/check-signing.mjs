#!/usr/bin/env node
/**
 * Pre-upload signing check for the Mac App Store build.
 *
 *   node scripts/check-signing.mjs [path/to/App.app]
 *
 * Catches — locally, in seconds — the mistakes App Store Connect would otherwise
 * reject minutes into a Transporter upload:
 *
 * - **Error 90284 "Invalid Code Signing".** The app must be signed with a
 *   certificate that is embedded in the provisioning profile. When you have more
 *   than one "Apple Distribution" certificate (e.g. after regenerating one), the
 *   signer and the profile can drift apart. This compares the leaf certificate the
 *   app was actually signed with against the certificates inside
 *   `build/embedded.provisionprofile` and fails if they don't match.
 * - **Expired provisioning profile.**
 * - **Bundle-id mismatch** between the profile and the app.
 *
 * Exit code 0 = safe to upload; non-zero = do not upload, with the reason printed.
 * If no app path is given it picks the newest `World Time.app` under `dist/mas*`.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const profilePath = join(root, "build", "embedded.provisionprofile");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function fail(msg) {
  console.error(`${RED}❌ ${msg}${RESET}`);
  process.exit(1);
}

function sha1(buf) {
  return createHash("sha1").update(buf).digest("hex").toUpperCase();
}

/** Newest `<name>.app` under dist/mas* (electron-builder writes dist/mas-arm64/). */
function findDefaultApp() {
  const dist = join(root, "dist");
  if (!existsSync(dist)) return null;
  const candidates = [];
  for (const entry of readdirSync(dist)) {
    if (!entry.startsWith("mas")) continue;
    const dir = join(dist, entry);
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".app")) candidates.push(join(dir, f));
    }
  }
  candidates.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return candidates[0] ?? null;
}

const appPath = process.argv[2] || findDefaultApp();
if (!appPath) fail("No .app found under dist/mas* — run `npm run package:mas` first (or pass a path).");
if (!existsSync(appPath)) fail(`App not found: ${appPath}`);
if (!existsSync(profilePath)) {
  fail(
    `Missing ${profilePath}\n` +
      "   Download the Mac App Store provisioning profile from the Apple Developer\n" +
      "   portal and save it there (see README → Recreating git-excluded files).",
  );
}

// --- Decode the provisioning profile (CMS-signed) into a plist. ---
// It contains a <date>, which `plutil -convert json` rejects, so pull the
// individual fields we need with targeted extracts instead of whole-plist JSON.
const tmp = mkdtempSync(join(tmpdir(), "wt-signing-"));
const plistFile = join(tmp, "profile.plist");
try {
  writeFileSync(plistFile, execFileSync("security", ["cms", "-D", "-i", profilePath]));
} catch (err) {
  fail(`Could not read ${profilePath}: ${err.message}`);
}

/** `plutil -extract <keypath> raw` → trimmed string, or "" if the key is absent. */
function extractRaw(keypath) {
  try {
    return execFileSync("plutil", ["-extract", keypath, "raw", "-o", "-", plistFile], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}
/** `plutil -extract <keypath> xml1` → the isolated XML fragment, or "" if absent. */
function extractXml(keypath) {
  try {
    return execFileSync("plutil", ["-extract", keypath, "xml1", "-o", "-", plistFile], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

const appIdMatch = extractXml("Entitlements").match(
  /<key>application-identifier<\/key>\s*<string>([^<]*)<\/string>/,
);
const profile = {
  Name: extractRaw("Name"),
  ExpirationDate: (extractXml("ExpirationDate").match(/<date>([^<]+)<\/date>/) ?? [])[1] ?? "",
  Entitlements: { "application-identifier": appIdMatch ? appIdMatch[1] : "" },
  // Isolate the certificate array before scraping <data>, so we never pick up a
  // data value from some other key in the profile.
  DeveloperCertificates: [...extractXml("DeveloperCertificates").matchAll(/<data>([\s\S]*?)<\/data>/g)].map(
    (m) => m[1].replace(/\s+/g, ""),
  ),
};

// --- Leaf certificate the app was actually signed with. ---
const certPrefix = join(tmp, "appcert");
try {
  // Writes appcert0 (leaf), appcert1, … as DER.
  execFileSync("codesign", ["-d", `--extract-certificates=${certPrefix}`, appPath], {
    stdio: ["ignore", "ignore", "pipe"],
  });
} catch (err) {
  fail(`Could not read the app's signature (is it signed?): ${err.message}`);
}
const leafFile = `${certPrefix}0`;
if (!existsSync(leafFile)) fail(`${appPath} does not appear to be code-signed.`);
const signerSha1 = sha1(readFileSync(leafFile));

// --- Certificates embedded in the profile (base64 DER in the JSON plist). ---
const profileCerts = (profile.DeveloperCertificates ?? []).map((b64) =>
  sha1(Buffer.from(b64, "base64")),
);

function certLabel(derBuf) {
  try {
    const out = execFileSync("openssl", ["x509", "-inform", "DER", "-noout", "-subject"], {
      input: derBuf,
      encoding: "utf8",
    });
    const m = out.match(/CN\s*=\s*([^,/\n]+)/);
    return m ? m[1].trim() : "(unknown)";
  } catch {
    return "(unknown)";
  }
}
const signerLabel = certLabel(readFileSync(leafFile));

console.log(`App:     ${appPath}`);
console.log(`Profile: ${profilePath} (${profile.Name ?? "unnamed"})`);
console.log(`Signed by: ${signerLabel}  [${signerSha1}]`);

let ok = true;

// 1) Signer must be one of the profile's embedded certificates.
if (!profileCerts.includes(signerSha1)) {
  ok = false;
  console.error(
    `\n${RED}Signing certificate is NOT in the provisioning profile.${RESET}\n` +
      `  App is signed with : ${signerSha1} (${signerLabel})\n` +
      `  Profile allows     : ${profileCerts.join(", ") || "(none)"}\n` +
      `  → App Store Connect will reject this with error 90284.\n` +
      `    Regenerate the Mac App Store profile so it includes the certificate above,\n` +
      `    or sign with a certificate the profile already contains.`,
  );
}

// 2) Profile expiry.
if (profile.ExpirationDate) {
  const exp = new Date(profile.ExpirationDate);
  if (exp.getTime() < Date.now()) {
    ok = false;
    console.error(`\n${RED}Provisioning profile expired ${exp.toISOString()}.${RESET}`);
  } else {
    const days = Math.round((exp.getTime() - Date.now()) / 86_400_000);
    if (days < 30) console.warn(`${YELLOW}⚠ Profile expires in ${days} days (${exp.toISOString()}).${RESET}`);
  }
}

// 3) Bundle-id match (profile application-identifier is <TEAM>.<bundleid>).
const appId = profile.Entitlements?.["application-identifier"] ?? "";
const profileBundleId = appId.replace(/^[^.]+\./, "");
let plistBundleId = "";
try {
  plistBundleId = execFileSync(
    "/usr/libexec/PlistBuddy",
    ["-c", "Print :CFBundleIdentifier", join(appPath, "Contents", "Info.plist")],
    { encoding: "utf8" },
  ).trim();
} catch {
  /* ignore */
}
if (profileBundleId && plistBundleId && profileBundleId !== plistBundleId) {
  ok = false;
  console.error(
    `\n${RED}Bundle-id mismatch:${RESET} app is ${plistBundleId}, profile is for ${profileBundleId}.`,
  );
}

if (!ok) {
  console.error(`\n${RED}✗ Not safe to upload.${RESET}`);
  process.exit(1);
}
console.log(`\n${GREEN}✓ Signing checks passed — safe to upload to App Store Connect.${RESET}`);
