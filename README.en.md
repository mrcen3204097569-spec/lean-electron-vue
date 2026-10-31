<div align="center">

# lean-electron-vue

An out-of-the-box desktop app template built with **Vite + Electron + Vue 3 + TypeScript**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Electron](https://img.shields.io/badge/Electron-45-47848F?logo=electron&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) ![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

[简体中文](./README.md) | English

</div>

## Introduction

An enterprise-ready modern desktop application template that avoids complex third-party wrappers like `electron-vite` or `vite-plugin-electron`. Two clean, minimal custom Vite plugins connect Vite and Electron in just dozens of lines of code. It features a complete **extensible Plugin Engine** and a **productivity suite boasting 50+ rich built-in features**.

- `pnpm dev`: starts the Vite dev server, compiles the main process with esbuild, then launches Electron with HMR.
- `pnpm build`: builds the renderer and compiles the main process into runnable `dist/`.
- `pnpm dist`: packages the application using electron-builder.
- `pnpm test`: runs the full Vitest suite (12 test suites, 41 unit tests covering IPC, window policies, dev utilities, and plugin governance).

## 🌟 50+ Core Features Matrix

### 🛠️ 1. Developer Toolbox Matrix (15+ Tools)
- **Diff Checker**: side-by-side / unified line-level difference highlighting with added/removed stats
- **Regex Playground**: real-time regex matching, flags switching, capture groups extractor, and built-in presets (Email, Phone, IP, URL, Chinese characters)
- **Hash & Checksum Studio**: instant calculation of MD5, SHA-1, SHA-256, and SHA-512 with uppercase toggle and integrity matching
- **Password & Secret Generator**: customizable character sets, ambiguous character exclusion, real-time strength meter, and batch generation
- **UUID / NanoID Generator**: UUID v4 generation, customizable casing, hyphen removal, and bulk generation
- **JWT Token Decoder**: offline inspection of Header & Payload, expiration verification, and signing algorithm display
- **URL & Query Parser**: URL encoding/decoding, query parameter breakdown table, and bi-directional editing
- **JSON Formatter & Minifier**: structural formatting, syntax error detection, and compact compression
- **Timestamp & Date Converter**: real-time microsecond timestamp, converter to readable date strings, and datetime picker
- **Base64 Encoder/Decoder**: offline UTF-8 safe Base64 conversion
- **Multi-Format Color Converter**: mutual conversions among HEX, RGB, RGBA, HSL, and HSLA models with color previews
- **Case & Naming Style Converter**: camelCase, PascalCase, kebab-case, snake_case, CONSTANT_CASE, plus word and character counts
- **CSS Visualizer**: interactive Linear/Radial Gradient generator & Box-Shadow visualizer with one-click CSS copy
- **HTML Entities Tool**: bidirectional HTML entity encoding and decoding
- **Quick Scratchpad**: automatic persistent local autosave with one-click `.txt` file export

### 🖥️ 2. Desktop Shell & Native Window Controls (12+ Features)
- **Always-on-Top Toggle**: title bar pin icon, status bar indicator, and real-time state synchronization
- **Smooth Window Opacity**: 50% ~ 100% opacity slider for multi-tasking reference
- **Window Screenshot to Clipboard**: captures native window rendering via `win.capturePage()` and writes directly to system clipboard
- **Window Re-center Action**: immediately repositions the window to the center of the active monitor
- **Preset Resolution Switching**: quick switches between 1024x768, 1280x800, and 1440x900 standard display resolutions
- **Global View Zoom**: zoom in, zoom out, and reset zoom (Ctrl++, Ctrl+-, Ctrl+0) from 80% to 150%
- **Network Latency Ping Monitor**: measures round-trip time every 5s with colored latency badge in the status bar
- **Main Process & System Memory Widget**: monitors private working set memory usage of Node/Electron processes in real-time
- **High-Precision System Clock**: real-time digital clock displayed in the bottom status bar
- **Cache & Local Storage Cleaner**: visual metrics for LocalStorage keys/sizes with one-click cache purge and app reload
- **Auto Launch at Login**: configurable startup behavior on system boot
- **Multi-Screen Healing**: saves window bounds and repairs out-of-screen window positioning gracefully

### 🧩 3. Plugin Engine & Governance Suite (10+ Features)
- **Plugin Lifecycle Hooks**: declarative `setup` and `teardown` support
- **Full Plugin Data Backup**: exports all plugin states and persistent storage into a single JSON backup file
- **One-Click Data Restore**: imports and validates JSON backup files to restore plugin state across installations
- **Batch Enable & Disable**: bulk-toggle all installed plugins with a single click
- **Multi-Dimensional Marketplace Sorting**: sort community plugins by Recommended, Most Stars ⭐, Most Downloads 📥, or Alphabetical (A-Z)
- **Marketplace Category Filtering**: filter by Productivity, DevTools, or Utilities
- **Obsidian-Style Custom Settings**: plugins can declare dedicated configuration components accessible via the plugin center
- **Dynamic Extension Injection**: inject components into routes, header actions, sidebar menus, and bottom status bar slots
- **Global Event Bus**: decoupled pub/sub communication bridge across plugins and host applications
- **Isolated Storage Namespaces**: plugins default to separate storage keys preventing collision

### 🚀 4. Rich Built-in Productivity Plugins (10 Installed Plugins)
- 📝 **Markdown Notebook (`markdown-notebook`)**: split-screen live preview, syntax insertion bar, word count, and `.md` file export
- 🔐 **Snippet Vault (`snippet-vault`)**: multi-language code snippet manager with language filtering, search, and one-click copy
- 💰 **Expense Tracker (`expense-tracker`)**: income and expense logging, category breakdown, net balance, and JSON export
- 📅 **Habit Tracker (`habit-tracker`)**: daily goal check-ins, continuous streak calculation, and 7-day heatmap matrix
- 🎨 **Canvas Sketchpad (`canvas-sketch`)**: lightweight HTML5 Canvas drawing, adjustable brush sizes/colors, eraser, and PNG export
- ⏱️ **Precision Stopwatch (`stopwatch-timer`)**: millisecond-level timer with split-time Lap tracking and lap history table
- 🍅 **Pomodoro Timer (`pomodoro-timer`)**: focus/break countdown intervals, native completion notifications, and cumulative time logs
- 📋 **Clipboard History (`clipboard-history`)**: background clipboard tracking, fuzzy search, and one-click clipboard restoration
- 🎨 **Color Palette (`color-palette`)**: Apple, Tailwind, and Nord modern palettes with WCAG accessibility contrast tester
- 🌐 **REST API Client (`api-client`)**: lightweight HTTP playground with parameter configuration and JSON response parser

### 💎 5. Modern Desktop UX & System Architecture (8+ Features)
- **Raycast-style Command Palette (`Ctrl+K`)**: instant fuzzy search, route jumping, and command execution
- **Shortcuts Cheat Sheet (`Ctrl+/`)**: interactive overlay listing all system and plugin hotkeys
- **Multi-Tab Workspace (TabBar)**: IDE-style top tabs with pin and context menu batch actions
- **Synthetic Web Audio System**: zero-asset synthetic audio feedback for micro-interactions (clicks, toggles, alerts)
- **Theme Engine**: Light, Dark, and System Auto modes with Element Plus deep styling
- **Global Shortcut**: default `CommandOrControl+Shift+Space` to summon/hide window
- **System Tray (Tray)**: tray icon, custom menu, background running, and close-to-tray protection
- **Frameless Window with Uncaught Exception Guard**: crash prevention and error logging for main process exceptions

## Getting Started

### Requirements

- Node.js `^20.19.0` or `>=22.12.0` (22 LTS or later recommended)
- pnpm 10 (`corepack enable` is recommended)

### Install & Run

```bash
git clone https://github.com/mrcen3204097569-spec/lean-electron-vue.git
cd lean-electron-vue

pnpm install

# development
pnpm dev

# build the app (dist/, no installer)
pnpm build

# package the installer (output: release/)
pnpm dist

# unit tests
pnpm test
```

> [!NOTE]
> Since Electron 45, the Electron binary is downloaded the first time you run the app instead of at install time. Set `ELECTRON_MIRROR` if your network to GitHub is slow.

### Scripts

| Command                       | Description                                 |
| ----------------------------- | ------------------------------------------- |
| `pnpm dev`                    | Start the dev environment (Vite + Electron) |
| `pnpm build`                  | Build the app without packaging             |
| `pnpm dist`                   | Build and package an installer into `release/` |
| `pnpm test`                   | Run the Vitest unit tests                   |
| `pnpm typecheck`              | Type-check with `vue-tsc`                   |
| `pnpm lint` / `pnpm lint:fix` | Lint / auto-fix with ESLint                 |
| `pnpm format`                 | Format with Prettier                        |

GitHub Actions runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` on pushes and pull requests. The Windows / macOS / Linux packaging matrix runs only on manual dispatch or a `v*` tag.

## Project Structure

```text
├── config/build.config.mts    # electron-builder options & update notes
├── plugins/
│   ├── devPlugin.mts          # dev: watch the main process and launch Electron
│   ├── devElectron.mts        # dev: start, restart, and stop the Electron child
│   ├── buildPlugin.mts        # build: compile main, write package.json, run electron-builder
│   └── mainProcess.mts        # shared esbuild step for main / preload
├── src/
│   ├── main/                  # main process (entry, preload, protocol, updater, windows, logging)
│   └── renderer/              # renderer process (Vue app)
├── eslint.config.mjs
└── vite.config.mts
```

## How It Works

```text
pnpm dev
  └─ vite dev server
       └─ devPlugin: esbuild watch of src/main → dist/
            └─ electron dist/mainEntry.js
                 └─ VITE_DEV_SERVER_URL=http://127.0.0.1:5173
                      └─ unpackaged: loadURL and open DevTools
                      └─ main process change: rebuild and restart Electron
                      └─ preload change: rebuild and reload the window
                      └─ packaged: ignore the variable and any extra CLI args, load app://index.html

pnpm build
  └─ vite build (renderer → dist/)
       └─ buildPlugin (closeBundle hook)
            ├─ esbuild main process → dist/mainEntry.js
            └─ write a minimal dist/package.json

pnpm dist
  └─ the same build with ELECTRON_PACKAGE=1
       ├─ electron-builder → release/
       └─ append update notes to release/latest*.yml as YAML double-quoted scalars
```

Every dependency lives in `devDependencies`. Vite bundles the renderer, and esbuild bundles the main process (including `electron-updater`) into `mainEntry.js`. The installer therefore ships without `node_modules`.

## Main / renderer IPC

The preload bridge in `src/main/preload/main.preload.ts` does not forward `IpcRendererEvent`. Subscription methods return an unsubscribe function; call it from `onUnmounted`. Channel names and the API interfaces live in `src/shared/electronApi.ts` and are reused by the main process, the preload, and `src/renderer/types/electronRender.d.ts`.

## Packaging

`config/build.config.mts` sets the installer targets explicitly: NSIS on Windows, dmg on macOS, and AppImage on Linux. The app takes a single-instance lock. A second launch focuses the window that is already open instead of starting another process.

## Auto Update

1. Set `publish.url` in `config/build.config.mts` to your update server. Production feeds must use **HTTPS**. An HTTP feed lets a network attacker replace `latest*.yml` and the installer. The bundled `http://127.0.0.1` value is only a local placeholder. `updateMsg` is plain text (newlines are kept) and is not rendered as HTML.
2. Bump `version` in `package.json` and run `pnpm dist`.
3. Upload the installer, its `.blockmap` and `latest*.yml` from `release/` to the server.
4. On startup, older versions check for updates and show the update dialog.

> In development the app isn't packaged, so `electron-updater` skips the update check. This is expected.

## Child Windows

`createDialog()` still JSON-stringifies a `BrowserWindow` options object into `window.open` features. The main process keeps only safe window options. `webPreferences` is ignored except `preloadMain: true`, which loads the built-in preload. Otherwise the child gets an empty preload so it does not inherit the main window's privileged bridge. `modal: true` parents the child to the window that called `window.open`.

Only `app://` and the current dev-server origin may open inside the app. Other `http` / `https` URLs are passed to `shell.openExternal`, and every other scheme is denied. `will-navigate` and `will-redirect` use the same rule.

Title-bar actions (show, minimize, maximize, restore, close) run on the window that sent the IPC, so a child window does not control the main window. Pages without the preload skip those calls instead of throwing.

`window.open(url)`, `target="_blank"`, and comma-separated features such as `width=800,height=600` are parsed without throwing. `left` / `top` map to `x` / `y`. Unrecognized fields are ignored.

## FAQ

**My main-process changes don't take effect.** `pnpm dev` watches `src/main`. A main-process change rebuilds and restarts Electron. A `*.preload.ts` change rebuilds and reloads the window. If nothing restarts, check the esbuild error in the terminal.

**ESLint says `ref` / `computed` is undefined.** These are auto-imported. Run `pnpm dev` once to generate `.eslintrc-auto-import.json`.

## License

[MIT](./LICENSE) © 2023-present 桥头的小屁孩
