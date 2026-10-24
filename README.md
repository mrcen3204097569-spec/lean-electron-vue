<div align="center">

# lean-electron-vue

开箱即用的 **Vite + Electron + Vue 3 + TypeScript** 桌面应用开发模板

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Electron](https://img.shields.io/badge/Electron-45-47848F?logo=electron&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) ![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

简体中文 | [English](./README.en.md)

</div>

## 简介

一个不依赖 `electron-vite`、`vite-plugin-electron` 等第三方集成方案的 Electron 模板：通过两个很薄的自定义 Vite 插件把 Vite 和 Electron 串起来，整个构建流程只有几十行代码，**看得懂、改得动**。

- `pnpm dev`：启动 Vite 开发服务器，用 esbuild 编译主进程后自动拉起 Electron，开发服务器地址通过环境变量 `VITE_DEV_SERVER_URL` 传入。渲染进程支持 HMR
- `pnpm build`：构建渲染进程并编译主进程，产出可运行的 `dist/`，不调用 electron-builder
- `pnpm dist`：在 `pnpm build` 的基础上调用 electron-builder 生成安装包
- `pnpm test`：用 Vitest 跑纯逻辑单测（`app://` 路径校验、更新说明 YAML、窗口策略、CSP）

## 特性

- ⚡️ **Vite 8 + Vue 3.5 + TypeScript**，`<script setup>` 写法
- 🖥️ **Electron 45**，默认开启上下文隔离和 sandbox，渲染进程关闭 Node 集成和 `<webview>`，所有能力通过 `preload` 暴露。页面带有 CSP；只有开发环境会关掉 Electron 的安全警告
- 🪟 **无边框窗口 + 自定义标题栏**：最小化 / 最大化 / 还原 / 关闭，以及窗口最大化状态同步
- 🔄 **自动更新**：基于 `electron-updater`，内置更新弹窗（检查 → 下载进度 → 安装），更新文案可在打包时配置
- 🧩 **多窗口 / 子窗口**：`window.open` 由主进程接管。渲染进程只能改白名单里的窗口选项，并用 `preloadMain` 选择是否注入 preload；外链交给系统浏览器
- 📦 **自定义 `app://` 协议**：生产环境下通过自定义协议加载页面，支持 `history` 路由模式
- 🎨 **Element Plus** 按需自动导入，`vue` / `vue-router` / `pinia` API 自动导入
- 🗂️ **约定式模块**：`router/modules/*.router.ts`、`api/modules/*.ts` 自动注册
- 🌐 **Axios 封装**：统一拦截、错误提示、断网检测
- 🧹 **ESLint 9+ (flat config) + Prettier**，`vue-tsc` 类型检查

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 桌面框架 | [Electron](https://www.electronjs.org/) · [electron-builder](https://www.electron.build/) · [electron-updater](https://www.electron.build/auto-update) |
| 构建工具 | [Vite](https://vite.dev/) · [esbuild](https://esbuild.github.io/)（编译主进程） |
| 前端框架 | [Vue 3](https://vuejs.org/) · [Vue Router](https://router.vuejs.org/) · [Pinia](https://pinia.vuejs.org/) |
| UI | [Element Plus](https://element-plus.org/) · [animate.css](https://animate.style/) · Sass |
| 工程化 | TypeScript · ESLint · Prettier · unplugin-auto-import · unplugin-vue-components |

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`（推荐 22 LTS 及以上）
- pnpm 10（推荐通过 `corepack enable` 启用）

### 安装与运行

```bash
git clone https://github.com/mrcen3204097569-spec/lean-electron-vue.git
cd lean-electron-vue

pnpm install

# 开发模式
pnpm dev

# 构建应用（dist/，不打安装包）
pnpm build

# 打包安装包（输出到 release/）
pnpm dist

# 单元测试
pnpm test
```

> [!TIP]
> **国内网络加速**：Electron 45 起会在首次运行时才下载 Electron 二进制，electron-builder 打包时也需要下载相关工具。网络不佳时可先设置镜像：
>
> ```bash
> # macOS / Linux
> export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
> export ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
>
> # Windows PowerShell
> $env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
> $env:ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
> ```

### 常用命令

| 命令                          | 说明                            |
| ----------------------------- | ------------------------------- |
| `pnpm dev`                    | 启动开发环境（Vite + Electron） |
| `pnpm build`                  | 构建应用，不打安装包            |
| `pnpm dist`                   | 构建并打包安装包到 `release/`   |
| `pnpm test`                   | 运行 Vitest 单元测试            |
| `pnpm typecheck`              | 使用 `vue-tsc` 做类型检查       |
| `pnpm lint` / `pnpm lint:fix` | ESLint 检查 / 自动修复          |
| `pnpm format`                 | Prettier 格式化                 |

GitHub Actions 在 push 和 pull request 上运行 `pnpm lint`、`pnpm typecheck`、`pnpm test` 和 `pnpm build`。Windows / macOS / Linux 安装包矩阵只在手动触发或推送 `v*` tag 时运行。

## 目录结构

```text
├── config/
│   └── build.config.mts       # electron-builder 打包配置 & 更新文案
├── plugins/
│   ├── devPlugin.mts          # 开发：编译主进程并启动 Electron
│   ├── buildPlugin.mts        # 构建：编译主进程、生成 package.json、调用 electron-builder
│   └── mainProcess.mts        # esbuild 编译主进程 / preload 的公共逻辑
├── tests/                     # Vitest 纯逻辑单测
├── .github/                   # CI 与 Dependabot
├── public/                    # 静态资源
├── src/
│   ├── main/                  # 主进程
│   │   ├── mainEntry.ts       # 主进程入口
│   │   ├── preload/           # 预加载脚本（*.preload.ts 会被自动编译）
│   │   └── use/
│   │       ├── CustomScheme.ts   # app:// 自定义协议
│   │       ├── Updater.ts        # 自动更新
│   │       ├── WindowManage.ts   # 窗口控制 & 子窗口创建
│   │       └── LogManage.ts      # 主进程日志转发到渲染进程控制台
│   └── renderer/              # 渲染进程（Vue 应用）
│       ├── api/               # axios 封装，modules/ 下的文件自动注册
│       ├── common/            # 常量、子窗口工具函数
│       ├── components/system/ # 标题栏、更新弹窗、窗口显示控制
│       ├── router/            # 路由，modules/*.router.ts 自动注册
│       ├── store/             # Pinia
│       ├── types/             # 类型声明（含 preload 暴露的 window API）
│       └── views/             # 页面
├── eslint.config.mjs
├── vite.config.mts
└── package.json
```

## 工作原理

```text
pnpm dev
  └─ vite dev server 启动
       └─ devPlugin: esbuild 编译 src/main → dist/mainEntry.js
            └─ 启动 electron dist/mainEntry.js
                 └─ 环境变量 VITE_DEV_SERVER_URL=http://127.0.0.1:5173
                      └─ 未打包时 loadURL 并打开开发者工具
                      └─ 已打包时忽略该变量和额外命令行参数，加载 app://index.html

pnpm build
  └─ vite build（渲染进程 → dist/）
       └─ buildPlugin（closeBundle 钩子）
            ├─ esbuild 编译主进程 → dist/mainEntry.js
            └─ 生成精简的 dist/package.json

pnpm dist
  └─ 同上，并设置 ELECTRON_PACKAGE=1
       ├─ electron-builder 打包 → release/
       └─ 把更新文案按 YAML 双引号标量追加写入 release/latest*.yml
```

所有依赖都放在 `devDependencies` 中：渲染进程代码由 Vite 打包，主进程代码（包括 `electron-updater`）由 esbuild 打包进 `mainEntry.js`，因此安装包里不需要 `node_modules`，体积更小。

## 使用指南

### 主进程与渲染进程通信

渲染进程无法直接访问 Node / Electron API，需要在 `src/main/preload/main.preload.ts` 中通过 `contextBridge` 暴露：

```ts
// src/main/preload/main.preload.ts
contextBridge.exposeInMainWorld('electronWindowApi', {
  maximizeWindow: () => ipcRenderer.invoke('maximize-window')
})

// src/main/use/WindowManage.ts
ipcMain.handle('maximize-window', () => win.maximize())

// 渲染进程中调用
window.electronWindowApi.maximizeWindow()
```

监听类 API 不把 `IpcRendererEvent` 传给渲染进程，并返回取消订阅函数，在 `onUnmounted` 里调用。通道名和接口定义在 `src/shared/electronApi.ts`，`src/renderer/types/electronRender.d.ts` 引用同一份类型。新增 API 时改这一处，并在 preload 里实现对应接口。

### 自动更新

1. 修改 `config/build.config.mts` 中的 `publish.url` 为你的更新服务器地址。生产环境必须使用 **HTTPS**：`latest*.yml` 和安装包走明文 HTTP 时，中间人可以替换更新说明和安装包。配置里的 `http://127.0.0.1` 只用于本机调试。`updateMsg` 是纯文本（保留换行），弹窗不会把它当 HTML 渲染
2. 提升 `package.json` 中的 `version`，执行 `pnpm dist`
3. 把 `release/` 目录下的安装包、`.blockmap` 和 `latest*.yml` 上传到更新服务器
4. 旧版本应用启动时会自动检查更新，并弹出 `SystemAppUpdate` 更新弹窗

> 开发环境下应用未打包，`electron-updater` 会跳过更新检查，这是正常现象。

### 打开子窗口

```ts
import { createDialog, dialogReady } from '@/common/dialog'

// 父窗口
const win = await createDialog('/test', {
  width: 800,
  height: 600,
  modal: true, // 模态窗口会自动把主窗口设为 parent
  webPreferences: { preloadMain: true } as any // 是否注入主窗口的 preload
})

// 子窗口页面加载完成后通知父窗口
dialogReady()
```

安全约束：

- 渲染进程不能自定义 `webPreferences`（包括 `nodeIntegration`、`contextIsolation`、`sandbox`、`webviewTag` 和 preload 路径）。只有 `webPreferences.preloadMain === true` 会注入内置 preload；否则子窗口加载一份空 preload，避免继承主窗口的特权脚本
- 其它配置只接受白名单内的窗口选项（尺寸、位置、`modal`、标题等）。`modal: true` 时，父窗口固定为发起 `window.open` 的那个窗口
- 只允许打开 `app://` 以及当前开发服务器同源地址。`http` / `https` 外链用系统浏览器打开，其它协议直接拒绝
- 主窗口和子窗口都会拦截 `will-navigate` 和 `will-redirect`，页面不能再跳到不受信任的地址
- 标题栏的显示、最小化、最大化、还原和关闭都作用在发出 IPC 的那个窗口上。没有注入 preload 的页面不会调用这些 API，因此不会因为 `window.electronWindowApi` 不存在而抛错
- `window.open(url)`、`<a target="_blank">` 以及逗号形式的 features（例如 `width=800,height=600`）不会再让主进程 `JSON.parse` 抛错。`left` / `top` 按 `x` / `y` 处理，无法识别的字段会被忽略

### 新增页面 / 接口

- **页面**：在 `src/renderer/router/modules/` 下新建 `xxx.router.ts` 并默认导出路由配置，会被自动注册
- **接口**：在 `src/renderer/api/modules/` 下新建 `xxx.ts` 并默认导出接口对象，通过 `api.xxx` 调用

### 应用信息与图标

在 `config/build.config.mts` 中修改 `productName`、`appId`、`nsis` 等配置。图标可参考 [electron-builder 文档](https://www.electron.build/icons) 放到 `build/` 目录，或在配置中单独指定。

## 常见问题

**修改主进程代码后没有生效？** 主进程只在启动 `pnpm dev` 时编译一次，修改 `src/main` 下的代码后需要重新运行 `pnpm dev`。

**首次 `pnpm dev` 卡住很久？** 多半是在下载 Electron 二进制，参考上面的镜像配置。

**ESLint 报 `ref` / `computed` 等未定义？** 这些 API 由 `unplugin-auto-import` 自动导入，对应的 `.eslintrc-auto-import.json` 会在运行 `pnpm dev` 后自动生成或更新。

## 开源协议

[MIT](./LICENSE) © 2023-present 桥头的小屁孩
