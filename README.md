# World Time

A macOS desktop app for tracking time across cities and planning meetings across time zones.
Built with Electron + React + Tailwind. This is a standalone build with **no Glaze dependency**.

## Requirements

- macOS
- Node.js 20+
- Xcode + Xcode Command Line Tools (for signing/packaging; `xcode-select --install`)

## Develop

```bash
npm install
npm run dev
```

`npm run dev` launches the app with hot reload (the renderer runs on a Vite dev server; the main
and preload processes rebuild on change).

### The Electron binary install

A clean `npm install` has to download and unpack the ~100 MB Electron binary, and two things about
that are worth knowing:

- **Dependency install scripts need approval (npm 11+).** npm no longer runs dependencies' install
  scripts automatically. The ones this project needs are pre-approved in the `allowScripts` block of
  `package.json`, so a normal install just works. If you bump a dependency and npm reports
  *"packages have install scripts not yet covered by allowScripts"*, review and approve them with
  `npm install-scripts ls` / `npm install-scripts approve <pkg>` (that writes the approval back into
  `package.json` — commit it).
- **Self-healing extract.** Electron's own postinstall occasionally unpacks the binary only
  part-way (a known `extract-zip` flake), which leaves a truncated `Electron.app` and makes
  `npm run dev` fail with `Error: Electron uninstall`. A `postinstall` hook,
  [`scripts/ensure-electron.mjs`](scripts/ensure-electron.mjs), runs after every install, checks the
  binary, and re-extracts it with the OS-native unzipper (`ditto` on macOS) if it's broken — using
  the already-downloaded zip from Electron's cache, so the repair is offline and fast. It's a no-op
  when the install is healthy.

If `npm run dev` ever fails with `Error: Electron uninstall`, re-run `npm install` (the hook will
repair it). Set `ELECTRON_SKIP_BINARY_DOWNLOAD=1` to skip the check entirely.

## Type-check / build

```bash
npm run type-check   # tsc for both the Node (main/preload) and web (renderer) sources
npm run build        # type-check + electron-vite build → out/
```

## Package

Three targets are configured in `electron-builder.yml`; each runs `npm run build` first and stamps
the version/build number via [`scripts/release.mjs`](scripts/release.mjs):

```bash
npm run package:mas   # Mac App Store .pkg      → dist/mas-arm64/
npm run package:dmg   # distributable .dmg      → dist/        (local/testing, outside the store)
npm run package:dir   # unpacked .app only      → dist/mac-arm64/  (fastest; quick local run)
```

- **App id:** `com.spelloconsulting.worldtime` · **Category:** Productivity · **Icon:** `build/icon.icns`
- Builds are **arm64-only** (Apple silicon), allowed by `minimumSystemVersion: 12.0`. They won't run
  on Intel Macs — raise the config to a universal build if you need that.
- A `package:dir` or unsigned `package:dmg` build needs no Apple account, so it's handy for a quick
  local check. `package:mas` needs the signing setup below.

### Versioning & build numbers

`scripts/release.mjs` stamps every build automatically:

- **Marketing version** (`CFBundleShortVersionString`) = the most recent git tag reachable from HEAD,
  with a leading `v` stripped (`v1.2.3` → `1.2.3`). Falls back to `package.json`'s version if there
  are no tags.
- **Build number** (`CFBundleVersion`) = a monotonic counter in `build/build-number.txt`, bumped on
  every successful build so each upload — even a re-upload of the same version — gets a unique,
  higher number. **Commit this file** so the counter stays monotonic across machines.

Preview what would be stamped without building: `npm run release:info`. Overrides for CI/one-offs:
`APP_VERSION=1.2.3` forces the version; `BUILD_NUMBER=42` forces the build number without touching
the counter.

```bash
# Release a new version:
git tag v1.2.0          # tag the release commit (the version comes from this)
npm run package:mas     # → version 1.2.0, next build number, signed .pkg
git add build/build-number.txt && git commit -m "Build 1.2.0"   # persist the counter
git push && git push --tags
```

## Deploy to the Mac App Store

An Electron app is submitted like any other Mac App Store binary: electron-builder signs it with your
Apple Distribution identity and a Mac App Store provisioning profile, and you upload the resulting
`.pkg` to App Store Connect. Submission goes through **Transporter** (or `xcrun altool`), not Xcode's
Organizer — everything else (certificates, provisioning, App Store Connect) is the standard path.

### 1. One-time setup

1. **Certificates** (Xcode ▸ Settings ▸ Accounts ▸ your Apple ID ▸ *Manage Certificates…* ▸ ➕).
   You need two, both installed into your login keychain:
   - **Apple Distribution** — signs the app.
   - **Mac Installer Distribution** (a.k.a. *3rd Party Mac Developer Installer*) — signs the `.pkg`.
2. **App ID** `com.spelloconsulting.worldtime`, registered in the
   [Developer portal](https://developer.apple.com/account/resources/identifiers/list).
3. **App record** in [App Store Connect](https://appstoreconnect.apple.com) with that bundle id.
4. **Provisioning profile** — see the next section (it's not stored in git).

### 2. Recreating files that aren't in git

Code-signing material is deliberately git-ignored (see `.gitignore`), so a fresh checkout — or a new
Mac — needs these put back before `package:mas` will work:

| What | Where it lives | How to recreate |
| --- | --- | --- |
| Signing certificates **+ their private keys** | login keychain | Xcode ▸ Settings ▸ Accounts ▸ *Manage Certificates* (create), or import a `.p12` backup. A certificate without its private key can't sign. |
| Mac App Store provisioning profile | `build/embedded.provisionprofile` | [Developer portal ▸ Profiles](https://developer.apple.com/account/resources/profiles/list) → the **World Time** *Mac App Store* profile → **Download**, save to that exact path. |

> **The profile must embed the same Apple Distribution certificate you sign with.** A Mac App Store
> profile pins one specific certificate. If you regenerate or replace your Apple Distribution cert
> (so the keychain has a *newer* one than the profile was built with), signing still succeeds locally
> but App Store Connect rejects the upload with **error 90284 “Invalid Code Signing.”** Fix it in the
> portal: open the profile, **Edit**, tick the certificate that matches your keychain one (the
> profile's *Expires* date shifts to match that cert), **Save**, **Download**, and overwrite
> `build/embedded.provisionprofile`. Just clicking *Download* without editing re-downloads the old,
> mismatched profile.
>
> `npm run verify:mas` compares the signer against the profile and catches this in seconds — and
> `package:mas` runs it automatically, so a mismatched build fails before you ever open Transporter.

### 3. Build, verify, upload

```bash
npm run package:mas
```

This builds, signs, and — via [`scripts/check-signing.mjs`](scripts/check-signing.mjs) — verifies the
signature matches the provisioning profile (certificate, expiry, bundle id) before declaring success.
On a mismatch it stops with the reason and does **not** burn a build number. The signed installer
lands at `dist/mas-arm64/World Time-<version>-arm64.pkg`.

If you only changed the provisioning profile (no code change), re-check without a full rebuild:

```bash
npm run verify:mas
```

Then upload the `.pkg`:

- **Transporter.app** (free on the Mac App Store) — drag the `.pkg` in and **Deliver**. Simplest.
- **Command line** — validate first, then upload (both accept an App Store Connect API key or an
  app-specific password; keep credentials out of the repo, e.g. via 1Password):

  ```bash
  PKG=$(ls -t dist/mas-arm64/*.pkg | head -1)
  xcrun altool --validate-app -t macos -f "$PKG" --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
  xcrun altool --upload-app   -t macos -f "$PKG" --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
  # (or --username "$APPLE_ID" --password "$APPLE_APP_PASSWORD" instead of the --apiKey pair)
  ```

Finish the listing (screenshots, description, privacy) in App Store Connect and submit for review.

### Notarizing a DMG (optional — for distribution outside the store)

```bash
npm run package:dmg
DMG=$(ls -t dist/*.dmg | head -1)
xcrun notarytool submit "$DMG" --apple-id "$APPLE_ID" --password "$APPLE_APP_PASSWORD" --team-id 68HM5882RN --wait
xcrun stapler staple "$DMG"
```

## Project layout

```
src/
  main/       Electron main process (windows, menu, theme, IPC)
  preload/    context-isolated bridge → window.api
  renderer/
    app/        main window (world clock + meeting planner)
    settings/   settings window (theme, 24-hour time)
    components/ feature components (clock card, add-city dialog, planner)
    ui/         clean-room component library (Radix + Tailwind)
    lib/        city database, timezone math, stores (localStorage)
    hooks/      useTheme
    styles.css  Tailwind + design tokens
build/        icons + entitlements
scripts/      release stamping (release.mjs), signing preflight (check-signing.mjs), electron repair
```

## What changed from the Glaze original

- Glaze's native runtime (`@glaze/core/backend` / `@glaze/core/preload`) → a real Electron
  main process + a minimal `window.api` preload bridge.
- Glaze's component library + theme (`@glaze/core/components`) → the clean-room `src/renderer/ui/`
  library and the tokens in `styles.css` (no Glaze code is bundled).
- Glaze's build CLI (`glaze-node.sh`, `glaze.ts`) → electron-vite + electron-builder.

The app's business logic (city database, timezone math, city/settings stores) is unchanged.
