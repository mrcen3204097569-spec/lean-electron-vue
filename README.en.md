<div align="center">

# lean-electron-vue

An out-of-the-box desktop app template built with **Vite + Electron + Vue 3 + TypeScript**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Electron](https://img.shields.io/badge/Electron-45-47848F?logo=electron&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) ![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

[简体中文](./README.md) | English

</div>

## Introduction

This template doesn't use a third-party integration such as `electron-vite` or `vite-plugin-electron`. Two small custom Vite plugins connect Vite and Electron, so the whole build pipeline is a few dozen lines of code that you can read and change.

- `pnpm dev`: starts the Vite dev server, compiles the main process with esbuild, then launches Electron. The dev server URL is passed in `VITE_DEV_SERVER_URL`. The renderer supports HMR.
- `pnpm build`: builds the renderer and the main process into a runnable `dist/`. It does not run electron-builder.
- `pnpm dist`: runs that build and then electron-builder.
- `pnpm test`: runs Vitest unit tests for the `app://` path guard, update-note YAML, window policy, and CSP.

## Features

- ⚡️ **Vite 8 + Vue 3.5 + TypeScript** with `<script setup>`
- 🖥️ **Electron 45** with context isolation and the sandbox on, and with Node integration and `<webview>` off. Native capabilities are exposed through `preload`. Documents get a CSP. Electron's security warnings are silenced only in development.
- 🪟 **Frameless window + custom title bar**: minimize, maximize, restore and close, with the maximized state synced to the UI
- 🔄 **Auto update** via `electron-updater`, with a built-in update dialog (check → download progress → install). The update notes are set at build time.
- 🧩 **Multi-window support**: the main process handles every `window.open`. The renderer may only set a whitelist of window options and chooses the built-in preload with `preloadMain`. External links open in the system browser.
- 📦 **Custom `app://` protocol** for loading pages in production, with `history` router mode supported
- 🎨 **Element Plus** imported on demand, plus auto-imported `vue` / `vue-router` / `pinia` APIs
- 🗂️ **Convention-based modules**: files in `router/modules/*.router.ts` and `api/modules/*.ts` are registered automatically
- 🌐 **Axios wrapper** with request and response interceptors, error messages and offline detection
- 🧹 **ESLint 9+ (flat config) + Prettier**, plus `vue-tsc` type checking

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

## Auto Update

1. Set `publish.url` in `config/build.config.mts` to your update server. Production feeds must use **HTTPS**. An HTTP feed lets a network attacker replace `latest*.yml` and the installer. The bundled `http://127.0.0.1` value is only a local placeholder. `updateMsg` is plain text (newlines are kept) and is not rendered as HTML.
2. Bump `version` in `package.json` and run `pnpm dist`.
3. Upload the installer, its `.blockmap` and `latest*.yml` from `release/` to the server.
4. On startup, older versions check for updates and show the update dialog.

> In development the app isn't packaged, so `electron-updater` skips the update check. This is expected.

## Child Windows

`createDialog()` still JSON-stringifies a `BrowserWindow` options object into `window.open` features. The main process keeps only safe window options. `webPreferences` is ignored except `preloadMain: true`, which loads the built-in preload. Otherwise the child gets an empty preload so it does not inherit the main window's privileged bridge.

Only `app://` and the current dev-server origin may open inside the app. Other `http` / `https` URLs are passed to `shell.openExternal`, and every other scheme is denied. `will-navigate` and `will-redirect` use the same rule.

Title-bar actions (show, minimize, maximize, restore, close) run on the window that sent the IPC, so a child window does not control the main window. Pages without the preload skip those calls instead of throwing.

`window.open(url)`, `target="_blank"`, and comma-separated features such as `width=800,height=600` are parsed without throwing. `left` / `top` map to `x` / `y`. Unrecognized fields are ignored.

## FAQ

**My main-process changes don't take effect.** `pnpm dev` watches `src/main`. A main-process change rebuilds and restarts Electron. A `*.preload.ts` change rebuilds and reloads the window. If nothing restarts, check the esbuild error in the terminal.

**ESLint says `ref` / `computed` is undefined.** These are auto-imported. Run `pnpm dev` once to generate `.eslintrc-auto-import.json`.

## License

[MIT](./LICENSE) © 2023-present 桥头的小屁孩
