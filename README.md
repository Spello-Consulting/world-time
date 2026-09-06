# World Time

A macOS desktop app for tracking time across cities and planning meetings across time zones.
Built with Electron + React + Tailwind. This is a standalone build with **no Glaze dependency**.

## Requirements

- macOS
- Node.js 20+ (you have 26)
- Xcode + Xcode Command Line Tools (for signing/packaging; `xcode-select --install`)

## Develop

```bash
npm install
npm run dev
```

`npm run dev` launches the app with hot reload (the renderer runs on a Vite dev server; the main
and preload processes rebuild on change).

## Type-check / build

```bash
npm run type-check   # tsc for both the Node (main/preload) and web (renderer) sources
npm run build        # type-check + electron-vite build → out/
```

## Package

Two targets are configured in `electron-builder.yml`:

```bash
npm run package:dmg   # local, distributable .dmg (for testing outside the store) → dist/
npm run package:mas   # Mac App Store .pkg → dist/
npm run package:dir   # unpacked .app only (fastest; for a quick local run) → dist/mac*/
```

- **App id:** `com.spelloconsulting.worldtime`
- **Category:** Productivity
- **Icon:** `build/icon.icns`

A `--dir` or unsigned `dmg` build works with no Apple account, for local testing.

## Submitting to the Mac App Store

The Electron app is submitted the same way any Mac App Store binary is — with your Apple
Developer identity. Xcode's toolchain provides the signing certificates and the upload tool.

### 1. One-time Apple setup

1. Join the **Apple Developer Program** and open **Xcode ▸ Settings ▸ Accounts**, add your Apple ID,
   and let Xcode create/download the signing certificates:
   - *Apple Distribution* (or the older *3rd Party Mac Developer Application*)
   - *Mac Installer Distribution* (or *3rd Party Mac Developer Installer*)
2. In the [Apple Developer portal](https://developer.apple.com/account/resources):
   - Register an **App ID** with bundle id `com.spelloconsulting.worldtime`.
   - Create a [**Mac App Store** provisioning profile](https://developer.apple.com/account/resources/profiles/list) for that App ID and download it to
     `build/embedded.provisionprofile` (the path `electron-builder.yml` expects).
3. In [App Store Connect](https://appstoreconnect.apple.com), create a new **macOS app** record and
   set its bundle id to `com.spelloconsulting.worldtime`.

### 2. Build the signed `.pkg`

```bash
npm run package:mas
```

electron-builder signs the app with your keychain certificates and the provisioning profile and
writes a `.pkg` to `dist/`. (If you have multiple identities, set
`CSC_NAME="Apple Distribution: Your Name (TEAMID)"` before the command.)

### 3. Upload

Use Apple's Transporter (part of the Xcode toolchain / free on the Mac App Store), or the Xcode
command-line uploader:

```bash
# Option A — Transporter.app: drag the .pkg in and Deliver.

# Option B — command line (uses an App Store Connect API key or app-specific password):
xcrun altool --upload-app -f "dist/World Time-1.0.0.pkg" -t macos \
  --apple-id YOUR_APPLE_ID --password "APP_SPECIFIC_PASSWORD"
# or, with an API key:
xcrun altool --upload-app -f "dist/World Time-1.0.0.pkg" -t macos \
  --apiKey KEY_ID --apiIssuer ISSUER_ID
```

Then finish the listing (screenshots, description, privacy) in App Store Connect and submit for review.

> Note: because this is an Electron app, submission goes through **Transporter / `altool`** rather
> than Xcode's Organizer "Distribute App" flow (which archives Xcode-native targets). Everything else
> — certificates, provisioning, App Store Connect — is the standard Apple path, and the certs are the
> ones Xcode manages for you.

### Notarizing the DMG (optional, for distribution outside the store)

```bash
npm run package:dmg
xcrun notarytool submit "dist/World Time-1.0.0.dmg" \
  --apple-id YOUR_APPLE_ID --password "APP_SPECIFIC_PASSWORD" --team-id TEAMID --wait
xcrun stapler staple "dist/World Time-1.0.0.dmg"
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
```

## What changed from the Glaze original

- Glaze's native runtime (`@glaze/core/backend` / `@glaze/core/preload`) → a real Electron
  main process + a minimal `window.api` preload bridge.
- Glaze's component library + theme (`@glaze/core/components`) → the clean-room `src/renderer/ui/`
  library and the tokens in `styles.css` (no Glaze code is bundled).
- Glaze's build CLI (`glaze-node.sh`, `glaze.ts`) → electron-vite + electron-builder.

The app's business logic (city database, timezone math, city/settings stores) is unchanged.
