# World Time — Standalone (De‑Glaze) Port Plan

Goal: produce a **self‑contained macOS app** in `/Users/nick/dev/world-time`, cloned from the Glaze
source at `/Users/nick/dev/Glaze/World Time/sources`, with **all Glaze dependencies removed**, so it
runs on its own and can be packaged for the **Mac App Store**.

Decisions locked in with you:

- **Target:** Mac App Store, via **real Electron** (faithful to the current macOS‑style desktop UI).
- **Design system:** **clean‑room rebuild** — I author the ~22 components the app uses on top of
  Radix UI + Tailwind (already the app's own dependencies) and a small theme that reproduces the
  token *names* the app references. No Glaze component or CSS source is copied into the project.

---

## 1. What actually depends on Glaze

The app's **business logic is already Glaze‑free** and will be copied verbatim:

- `renderer/lib/cities.ts` — city DB + timezone math (pure `Intl`).
- `renderer/lib/city-store.ts`, `settings-store.ts` — React hooks over `localStorage`.
- `renderer/lib/use-now.ts` — interval clock hook.

Glaze coupling is concentrated in four places:

| Layer | Glaze import | Replacement |
|---|---|---|
| Native shell | `@glaze/core/backend` (`app`, `BrowserWindow`, `Menu`, `ipcMain`, `logger`, `initDevToolsButtonState`) | Real **Electron** main process |
| Preload bridge | `@glaze/core/preload` (`ipcRenderer`, `contextBridge`, `createWebUtilsAPI`, `installDisplayMediaCompat`) | Small Electron preload exposing a minimal typed `window.api` |
| Design system | `@glaze/core/components` (22 components) + ~7,000‑line proprietary theme | **Clean‑room `src/renderer/ui/`** + `theme.css` |
| Glue | `@glaze/core/hooks` (`useTheme`, `useConnection`, `useEnvironment`), `@glaze/core/utils` (`cn`, `initLogging`), `@glaze/core/ipc` (types) | Local `hooks/`, `lib/cn.ts`, local types |
| Build/CLI | `glaze-node.sh`, `glaze.ts`, `@glaze/core/build` | **electron‑vite** + **electron‑builder** |

The **native surface is tiny**. The only real IPC the renderer needs:

- `nativeTheme.getInfo()` / `nativeTheme.setThemeSource('system'|'light'|'dark')` (Settings theme picker)
- open Settings window (app menu) / close Settings window (Esc key in settings)

There is **no backend business logic** — the `app:getInfo` handler is a template stub and unused; all
state lives in the renderer via `localStorage`. So no data-layer porting is required.

---

## 2. Target project structure

```
world-time/
├─ package.json                 # electron + electron-vite + electron-builder; app deps
├─ electron.vite.config.ts      # main / preload / renderer (2 HTML entries)
├─ electron-builder.yml         # mas + dmg targets, category, entitlements
├─ tsconfig.json / tsconfig.node.json
├─ design/plan.md               # this file
├─ build/
│   ├─ icon.icns                # from sources/app-icon.icns
│   ├─ entitlements.mas.plist
│   ├─ entitlements.mas.inherit.plist
│   └─ entitlements.mac.plist   # for dev/dmg (hardened runtime)
└─ src/
   ├─ main/
   │   ├─ index.ts              # app lifecycle, main window
   │   ├─ windows.ts            # main + settings BrowserWindow factory, window paths
   │   ├─ menu.ts               # native app menu (Settings…, standard roles)
   │   ├─ theme.ts              # nativeTheme IPC + broadcast on change
   │   └─ ipc.ts                # window:openSettings / window:closeSettings
   ├─ preload/
   │   └─ index.ts              # contextBridge → window.api (nativeTheme, windows)
   └─ renderer/
       ├─ main-window.html
       ├─ settings-window.html
       ├─ styles.css            # @import tailwind + ./theme.css + app chrome (.drag-region)
       ├─ theme.css             # clean-room design tokens (only what the app uses)
       ├─ env.d.ts              # window.api typing, vite client types
       ├─ lib/                  # cities.ts, city-store.ts, settings-store.ts, use-now.ts, cn.ts, logging.ts
       ├─ hooks/                # use-theme.ts
       ├─ ui/                   # clean-room component library (see §4) + index.ts
       ├─ components/           # clock-card, add-city-dialog, meeting-planner (imports rewired)
       ├─ app/                  # index.tsx, root-view.tsx, router.tsx, home-view.tsx  (was renderer/main)
       └─ settings/             # index.tsx, settings-view.tsx  (imports rewired)
```

Build outputs to `out/` (electron‑vite convention); packaged apps to `dist/`.

---

## 3. Native shell (Electron)

- **`src/main/index.ts`** — mirrors the current `main/index.ts`: create a 920×680 main
  `BrowserWindow` (min 480×500), `titleBarStyle: 'hiddenInset'`, `vibrancy: 'sidebar'`,
  `backgroundColor` transparent-ish to keep the frosted look; `webPreferences.preload` → built
  preload; `contextIsolation: true`, `nodeIntegration: false` (App Store requires this).
  Standard macOS lifecycle (`window-all-closed` no‑quit, `activate` re‑create).
- **`src/main/menu.ts`** — rebuild the existing menu with Electron roles (`about`, `services`,
  `hide`, `quit`, `fileMenu`, `editMenu`, `viewMenu`, `windowMenu`) plus a **Settings… (⌘,)** item
  that opens the settings window. (Drop Glaze's SF‑Symbol `icon` fields and `initDevToolsButtonState`.)
- **`src/main/windows.ts`** — settings window (520×300) factory, dev‑server‑vs‑file URL resolution
  (electron‑vite provides `process.env['ELECTRON_RENDERER_URL']` in dev; load the built HTML in prod).
- **`src/main/theme.ts`** — back `nativeTheme.getInfo/setThemeSource` with Electron's
  `nativeTheme.themeSource` + `shouldUseDarkColors`; on `nativeTheme.on('updated')` broadcast to all
  windows so both the main and settings windows re‑sync their `.dark` class.
- **`src/preload/index.ts`** — expose a minimal, typed bridge:
  `window.api = { nativeTheme: { getInfo, setThemeSource, onUpdated }, windows: { openSettings, closeSettings } }`.
  No `glazeAPI`, no `webUtils`, no `installDisplayMediaCompat` (unused by this app).

Renderer call‑sites updated: `settings-view.tsx` (`window.glazeAPI…` → `window.api…`) and
`root-view.tsx` (drop the `ipc.disconnect()` cleanup — no persistent socket in Electron).

---

## 4. Clean‑room UI library (`src/renderer/ui/`)

Authored by us on Radix primitives + Tailwind + `class-variance-authority` (all already app deps).
Each file is small; grouped here by the exact API the app consumes.

- **text.tsx** — `Text` with `variant` (`heading1`, `large`, `large-strong`, `regular`, `small`,
  `small-strong`, `mini`), `color` (`primary|secondary|tertiary|quaternary|accent`), `truncate`.
- **button.tsx** — `Button` with `variant` (`default|accent|transparent`), `size` (`default|small`),
  `iconOnly`, `asChild` (Radix Slot), `disabled`.
- **badge.tsx** — `Badge` with `color` (`secondary|yellow|blue`), `size` (`small`).
- **input.tsx**, **label.tsx** — styled `<input>` / `<label>`.
- **switch.tsx** — Radix Switch. **radio-group.tsx** — Radix RadioGroup (`RadioGroup`, `RadioGroupItem`).
- **field.tsx** — `Field`, `FieldContent`, `FieldGroup`, `FieldLabel`, `FieldSet` (layout wrappers).
- **tabs.tsx** — Radix Tabs (`TabsRoot`, `Tabs` list, `TabsTrigger`, `TabsContent`); `variant="glass"`,
  `size="large"` styling.
- **dropdown-menu.tsx** — Radix DropdownMenu; `DropdownMenuItem` supports `icon` (map the string
  names `arrow_up`/`arrow_down`/`trash` → lucide icons) and `color="red"`; plus `Separator`.
- **dialog.tsx** — Radix Dialog with the app's convenience API: `title`, `description`, `size`,
  `showCloseButton`, `confirmLabel`, `onConfirm`, and `DialogBody` (`maxHeight`).
- **segmented-control.tsx** — `SegmentedControl` + `SegmentedControlItem` (Radix ToggleGroup, single).
- **time-field.tsx** — `TimeField` backed by `<input type="time">` (emits/accepts `"HH:MM"`, matching
  the app's `value`/`onValueChange` contract).
- **empty-state.tsx** — `EmptyState` (`placement`, `title`, `description`, `actions`).
- **status.tsx** — `Status` (`variant="error"`), used only behind `import.meta.env.DEV`.
- **toolbar.tsx** — `Toolbar`, `ToolbarContent`, `ToolbarTitle`, `ToolbarActions`.
- **scroll-area.tsx** — `ScrollArea` with an optional `toolbar` slot (sticky header + scroll body).
- **sidebar.tsx** — `Sidebar` (searchable header + actions), `SidebarList`, `SidebarListItem`
  (`icon`, `title`, `subtitle`, `accessory`).
- **split-view.tsx** — `SplitView`: resizable sidebar + content, width persisted by `storageKey`
  to `localStorage`; renders the `sidebar` prop when provided, else just children.
- **tooltip.tsx** — `TooltipProvider` (Radix Tooltip provider; the app only needs the provider).
- **toast.tsx** — re‑export from **`sonner`** (added as a direct dep): `Toaster`, `toast`.
- **error-boundary-view.tsx** — a React error boundary fallback for the router.
- **index.ts** — barrel re‑exporting everything above, so app imports become `from "../ui"`.

**`theme.css`** defines only the tokens the app references, as Tailwind v4 `@theme`/CSS variables:
color roles `text-{secondary,tertiary,quaternary,accent}`, surfaces
`control`, `control-subtle`, `list-hover`, `list-selection`, `accent`, borders `separator`/`accent`,
support colors `support-{green,yellow,blue}`, `rounded-card`, and the `Text` size/weight scale.
Light + dark (`.dark`) values. Plus app chrome: `.drag-region { -webkit-app-region: drag }` and the
frosted `body` background from the current HTML.

> Fidelity note: visuals will read as the same macOS‑style app and match the token system closely,
> but will not be pixel‑identical to Glaze's private components. That's the trade for owning 100% of
> the code with no Glaze IP in the submission.

---

## 5. Build & packaging

- **electron‑vite** builds `main`, `preload`, and the `renderer` (two HTML inputs via
  `build.rollupOptions.input`). Tailwind v4 via `@tailwindcss/vite`. React via `@vitejs/plugin-react`.
- **Scripts:** `dev` (electron‑vite dev with HMR), `build` (type‑check + electron‑vite build),
  `start` (preview), `package:mas` / `package:dmg` (electron‑builder).
- **electron‑builder.yml:** `appId` (e.g. `com.nickjones.worldtime` — you choose), `productName`
  "World Time", `category` `public.app-category.productivity`, `icon` `build/icon.icns`, `mas` target
  with the entitlement plists, `hardenedRuntime`, and `mac` `dmg` for local distribution/testing.
- **Entitlements:** app‑sandbox (required by MAS) + inherit plist for child processes; no extra
  entitlements needed (app makes no network calls, no file access, no location — despite the Glaze
  template preload, this app uses none of it).

**Dependencies removed:** everything `@glaze/*`, `glaze-node.sh`, `glaze.ts`, `.glaze*`, the Glaze
`glaze` block in package.json, Glaze `.claude`/`.agents`/AGENTS.md/CLAUDE.md bootstraps, rolldown/oxfmt
Glaze toolchain bits. **Added:** `electron`, `electron-vite`, `electron-builder`, `sonner`,
`@tailwindcss/vite`, `@vitejs/plugin-react` (keep the existing `react`, `radix-ui`, `@radix-ui/colors`,
`lucide-react`, `cva`, `clsx`, `tailwind-merge`, `@tanstack/*`).

---

## 6. What you'll still need to do (I can't)

Mac App Store submission needs your Apple developer identity and secrets:

1. Apple Developer Program membership; create an **App ID** + **Mac App Store provisioning profile**.
2. **Certificates** (3rd Party Mac Developer Application/Installer, or the newer Apple Distribution)
   in your keychain.
3. Create the app record in **App Store Connect**; set the bundle id to match `electron-builder.yml`.
4. Run `npm run package:mas`, then upload the `.pkg` via **Transporter** / `xcrun altool`.

I'll wire the config and document these steps in a `README`, but signing/upload happens on your machine
with your account.

---

## 7. Proposed execution order

1. Scaffold project config (package.json, electron.vite, tsconfig, electron‑builder, entitlements, icon).
2. Electron main + preload + theme/ipc; get an empty window launching.
3. Copy `lib/` business logic + `cn`/logging; add `theme.css`.
4. Build the `ui/` component library.
5. Port renderer app files (`app/`, `settings/`, `components/`) with imports rewired to `../ui`.
6. `npm run dev` — verify world clock, add‑city dialog, meeting planner, settings + theme switching.
7. `npm run build` + a local `dmg` package to confirm it runs outside the dev server.
8. Write `README.md` with run/build/submit instructions.

Open choices for you to confirm at review time: **bundle id** (default `com.nickjones.worldtime`) and
whether you want the local **DMG** target too (recommended for testing outside the store).
