<div align="center">

# lean-electron-vue

An out-of-the-box desktop app template built with **Vite + Electron + Vue 3 + TypeScript**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Electron](https://img.shields.io/badge/Electron-45-47848F?logo=electron&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) ![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

[简体中文](./README.md) | English

</div>

## Introduction

This template doesn't use a third-party integration such as `electron-vite` or `vite-plugin-electron`. Two small custom Vite plugins connect Vite and Electron, so the whole build pipeline is a few dozen lines of code that you can read and change.

- `pnpm dev`: starts the Vite dev server, compiles the main process with esbuild, then launches Electron. The renderer supports HMR.
- `pnpm build`: builds the renderer, compiles the main process and runs electron-builder to produce an installer, all in one command.

## Features

- ⚡️ **Vite 8 + Vue 3.5 + TypeScript** with `<script setup>`
- 🖥️ **Electron 45** with context isolation on and Node integration off in the renderer. All native capabilities are exposed through `preload`.
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

# build the installer (output: release/)
pnpm build
```

> [!NOTE]
> Since Electron 45, the Electron binary is downloaded the first time you run the app instead of at install time. Set `ELECTRON_MIRROR` if your network to GitHub is slow.

### Scripts

| Command                       | Description                                 |
| ----------------------------- | ------------------------------------------- |
| `pnpm dev`                    | Start the dev environment (Vite + Electron) |
| `pnpm build`                  | Build and package the installer             |
| `pnpm typecheck`              | Type-check with `vue-tsc`                   |
| `pnpm lint` / `pnpm lint:fix` | Lint / auto-fix with ESLint                 |
| `pnpm format`                 | Format with Prettier                        |

## Project Structure

```text
├── config/build.config.mts    # electron-builder options & update notes
├── plugins/
│   ├── devPlugin.mts          # dev: compile main process & launch Electron
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
       └─ devPlugin: esbuild src/main → dist/mainEntry.js
            └─ electron dist/mainEntry.js http://127.0.0.1:5173

pnpm build
  └─ vite build (renderer → dist/)
       └─ buildPlugin (closeBundle hook)
            ├─ esbuild main process → dist/mainEntry.js
            ├─ write a minimal dist/package.json
            ├─ electron-builder → release/
            └─ append update notes to release/latest*.yml
```

Every dependency lives in `devDependencies`. Vite bundles the renderer, and esbuild bundles the main process (including `electron-updater`) into `mainEntry.js`. The installer therefore ships without `node_modules`.

## Auto Update

1. Set `publish.url` in `config/build.config.mts` to your update server, and edit `updateMsg` (HTML is supported).
2. Bump `version` in `package.json` and run `pnpm build`.
3. Upload the installer, its `.blockmap` and `latest*.yml` from `release/` to the server.
4. On startup, older versions check for updates and show the update dialog.

> In development the app isn't packaged, so `electron-updater` skips the update check. This is expected.

## Child Windows

`createDialog()` still JSON-stringifies a `BrowserWindow` options object into `window.open` features. The main process keeps only safe window options. `webPreferences` is ignored except `preloadMain: true`, which loads the built-in preload. Otherwise the child gets an empty preload so it does not inherit the main window's privileged bridge.

Only `app://` and the current dev-server origin may open inside the app. Other `http` / `https` URLs are passed to `shell.openExternal`, and every other scheme is denied. `will-navigate` and `will-redirect` use the same rule.

## FAQ

**My main-process changes don't take effect.** The main process is compiled only once, when `pnpm dev` starts. Restart `pnpm dev` after editing `src/main`.

**ESLint says `ref` / `computed` is undefined.** These are auto-imported. Run `pnpm dev` once to generate `.eslintrc-auto-import.json`.

## License

[MIT](./LICENSE) © 2023-present 桥头的小屁孩
