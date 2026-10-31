<div align="center">

# lean-electron-vue

开箱即用的 **Vite + Electron + Vue 3 + TypeScript** 桌面应用开发模板

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Electron](https://img.shields.io/badge/Electron-45-47848F?logo=electron&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) ![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

简体中文 | [English](./README.en.md)

</div>

## 简介

一个不依赖 `electron-vite`、`vite-plugin-electron` 等第三方集成方案的现代化企业级 Electron 模板：通过两个很薄的自定义 Vite 插件把 Vite 和 Electron 串起来，整个构建流程只有几十行代码，**看得懂、改得动**。同时具备媲美 VS Code / Obsidian 的**高扩展性插件生态系统**与包含 **50+ 丰富实用特性的全功能开发/生产力工作台**。

- `pnpm dev`：启动 Vite 开发服务器，用 esbuild 编译主进程后自动拉起 Electron，开发服务器地址通过环境变量 `VITE_DEV_SERVER_URL` 传入。渲染进程支持 HMR
- `pnpm build`：构建渲染进程并编译主进程，产出可运行的 `dist/`，不调用 electron-builder
- `pnpm dist`：在 `pnpm build` 的基础上调用 electron-builder 生成安装包
- `pnpm test`：用 Vitest 跑全套单元测试（覆盖 IPC、窗口策略、工具箱算法、插件治理、生命周期等 12 个套件 41 项单测）

## 🌟 50+ 核心特性与功能矩阵

### 🛠️ 1. 开发者全能工具箱矩阵 (Developer Toolbox Suite - 15+ 项)
- **Diff 文本差异比对**：逐行/字符级精准比对、增删改高亮标注、行数差异实时统计
- **Regex 正则演练场**：实时正则匹配、多模式切换、捕获组提取、内置常用预设（邮箱、手机号、IP、URL、身份证、中文字符）
- **哈希散列计算中心**：MD5、SHA-1、SHA-256、SHA-512 高速散列计算、大写切换与目标哈希一致性比对
- **安全密码与随机密钥生成器**：自定义字符集、避免混淆字符、密码强度实时评分条、批量生成 5 条一键复制
- **UUID / NanoID 生成器**：标准 UUID v4 生成、大写/去横杠/引号包裹定制、批量生成导出
- **JWT 令牌离线剖析器**：无第三方依赖离线解码 Header 与 Payload，过期时效自动校验与算法识别
- **URL 与 Query 参数双向解析器**：URL 编解码、Query 参数表格化提取与双向反向同步编辑
- **JSON 格式化与压缩器**：结构化着色、语法容错校验、一键美化与紧凑压缩
- **时间戳与日期双向转换**：当前微秒时钟展示、毫秒戳转自然日期、日期选择器生成戳
- **Base64 文本与二进制编解码**：纯离线 UTF-8 安全 Base64 编码与解码
- **多格式色彩转换器**：HEX、RGB、RGBA、HSL、HSLA 多色彩模型实时互转与色卡预览
- **代码命名风格批量转换**：camelCase、PascalCase、kebab-case、snake_case、CONSTANT_CASE 自由互转与词频字数统计
- **CSS 渐变与阴影可视化生成器**：线性/径向渐变可视化拖拽调色、Box-Shadow 阴影参数调节与 CSS 代码一键拷贝
- **HTML 实体编解码器**：富文本实体字符安全转义与反转义
- **即时草稿便签纸 (Scratchpad)**：无感本地自动持久化保存、一键导出为 `.txt` 文件

### 🖥️ 2. 桌面视窗与原生 Shell 深度操控套件 (12+ 项)
- **视窗置顶锁定图钉 (Always-on-Top)**：标题栏置顶图钉按钮、底部状态栏指示、状态实时同步
- **视窗平滑透明度调节 (Window Opacity)**：50% ~ 100% 平滑滑动调节，适合对照参考与多任务并存
- **视窗截屏快照至剪贴板 (Window Screenshot Capture)**：主进程调用原生 `capturePage` 产生快照并直接存入系统剪贴板
- **视窗一键重置居中 (Window Re-center)**：将主窗口迅速移至屏幕正中央
- **预设分辨率快速切换 (Preset Window Dimensions)**：支持 1024x768、1280x800、1440x900 等标准视窗比例
- **视窗全局视图缩放 (Zoom Factor)**：支持 Ctrl+加号 / Ctrl+减号 / Ctrl+0 在 80% ~ 150% 间动态无级缩放
- **网络延迟 Ping 测速指示挂件**：底部状态栏每 5 秒高频测速往返 RTT，毫秒级网络状态指示灯
- **主进程与系统内存动态监控挂件**：底部状态栏实时显示当前 Node / Electron 主进程与系统 RAM 占用
- **系统高精度数字时钟挂件**：状态栏实时走动的本地数字时钟
- **缓存与本地持久化诊断清理中心**：统计 LocalStorage 键数量及字节大小，提供一键深度清空与重载
- **开机自动启动配置 (Auto Launch)**：主进程与设置面板支持配置应用随系统启动
- **跨会话窗口记忆与跨屏自愈**：持久化记录窗口尺寸与坐标，支持拔插显示器或多屏越界时智能居中自愈

### 🧩 3. 插件化架构与治理中心 (Plugin Engine Suite - 10+ 项)
- **极简插件生命周期**：声明式 `setup` / `teardown` 机制，支持动态卸载清理
- **插件数据全量备份 (Export JSON)**：一键将所有插件的隔离状态、持久化存储导出为单个 JSON 存档
- **插件数据一键恢复 (Import JSON)**：选择备份文件自动校验并还原所有插件数据
- **批量控制中心**：支持一键「批量启用全部」与「批量停用全部」插件，进入安全纯净模式
- **插件市场多维排序**：支持按「默认推荐」、「最多星标 ⭐」、「最多下载 📥」、「插件名称 A-Z」动态排序
- **插件市场分类过滤**：涵盖效率、开发利器、实用工具等专业分类
- **Obsidian 风格独立配置面板**：插件可声明专属配置组件，支持在插件中心一键弹出弹窗定制
- **动态扩展点挂载**：页面路由、顶部导航按钮、侧边导航栏、底部状态栏左右挂载槽位
- **全局事件总线 (EventBus)**：插件与核心系统间解耦的事件发布与订阅通道
- **安全沙箱隔离存储**：插件默认使用独立的命名空间存储，避免数据污染

### 🚀 4. 精选生产力与生活工作流插件生态 (已内置 10 款插件)
- 📝 **Markdown 实时笔记本 (`markdown-notebook`)**：双栏即时渲染排版、快捷语法注入、字数行数统计、导出 Markdown 文件
- 🔐 **代码片段金库 (`snippet-vault`)**：多语言代码片段集中收藏、按语言过滤、关键词搜索、一键复制代码
- 💰 **极简日常记账 (`expense-tracker`)**：收支流水记录、分类汇总、净结余自动计算与 JSON 报表导出
- 📅 **习惯打卡追踪 (`habit-tracker`)**：自律习惯打卡、连续坚持天数 (Streak) 统计、打卡热力方块矩阵
- 🎨 **草图白板涂鸦 (`canvas-sketch`)**：轻量 HTML5 Canvas 自由画板、画笔粗细颜色调节、橡皮擦与导出 PNG
- ⏱️ **高精度秒表与计次 (`stopwatch-timer`)**：毫秒级秒表计时、支持分段计次 (Lap) 对比与耗时分析
- 🍅 **番茄专注时钟 (`pomodoro-timer`)**：科学番茄工作法、专注/休息倒计时、原生完成弹窗与累计时长统计
- 📋 **剪贴板历史卫士 (`clipboard-history`)**：自动追踪与持久化剪贴板文本记录、模糊搜索与一键回写
- 🎨 **设计调色盘与对比度 (`color-palette`)**：Apple、Tailwind、Nord 精品现代色卡与 WCAG 可访问性对比度检测
- 🌐 **REST API 接口调试器 (`api-client`)**：轻量极速的 HTTP / REST 接口演练场、请求头与响应体实时解析

### 💎 5. 现代化桌面交互与系统体验 (8+ 项)
- **Raycast 风格全局命令面板 (`Ctrl+K`)**：毫秒级模糊检索、全应用页面直达、系统级快捷功能触发
- **全软件快捷键速查清单 (`Ctrl+/`)**：内置现代化 Cheat Sheet 面板，清晰展示视窗与各插件快捷键
- **多标签页工作台 (TabBar)**：类 IDE 顶部多标签栏、路由访问历史追踪、Pin 固定首页、右键快捷批量关闭
- **纯程序化微交互音效系统 (Web Audio)**：零资源依赖纯代码合成高品质触觉提示音（微点击、切换声、成功与警示）
- **全套暗黑/明亮主题**：支持浅色模式、深色模式与跟随系统自动切换，Element Plus 全局深度适配
- **系统级全局快捷键**：默认注册 `CommandOrControl+Shift+Space` 一键呼出/隐藏前台窗口
- **系统托盘 (Tray)**：常驻系统托盘图标、右键菜单、单击唤醒与退出时最小化到托盘保护
- **无边框窗口 + 自定义标题栏**：最小化 / 最大化 / 还原 / 关闭，双击标题栏缩放，主进程未捕获异常全局安全兜底保护

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
│   ├── devPlugin.mts          # 开发：监听主进程、启动 / 重启 Electron
│   ├── devElectron.mts        # 开发：Electron 子进程的启动、重启和退出
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
       └─ devPlugin: esbuild watch 编译 src/main → dist/
            └─ 启动 electron dist/mainEntry.js
                 └─ 环境变量 VITE_DEV_SERVER_URL=http://127.0.0.1:5173
                      └─ 未打包时 loadURL 并打开开发者工具
                      └─ 主进程变更：重新编译并重启 Electron
                      └─ preload 变更：重新编译并刷新窗口
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

### 插件系统开发指南

本模板内置轻量级纯 TypeScript 插件引擎，支持声明式与编程式两种扩展方式：

```ts
import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import MyWidget from './MyWidget.vue'
import MyPageView from './MyPageView.vue'
import MySettingsView from './MySettingsView.vue'

export const myCustomPlugin = definePlugin({
  metadata: {
    id: 'my-custom-plugin',
    name: '自定义演示插件',
    version: '1.0.0',
    description: '演示如何在模板中注册独立扩展',
    author: 'Developer'
  },
  // 1. 专属配置组件 (Obsidian 风格)
  settingsComponent: markRaw(MySettingsView),

  // 2. 声明式扩展点
  extensions: {
    views: [
      {
        id: 'my-view',
        path: '/plugins/my-page',
        title: '插件独立页面',
        component: markRaw(MyPageView),
        inNavigation: true // 自动注入侧边栏
      }
    ],
    statusBarItems: [
      {
        id: 'my-status-item',
        alignment: 'left',
        component: markRaw(MyWidget) // 自动挂载至底部状态栏
      }
    ],
    headerActions: [
      {
        id: 'my-action',
        title: '快捷功能',
        action: () => alert('点击了插件快捷按钮')
      }
    ],
    commands: [
      {
        id: 'my-command.action',
        title: '快速执行插件任务',
        category: '演示插件',
        shortcut: 'Ctrl+Shift+M',
        action: () => console.log('执行插件指令')
      }
    ]
  },
  // 3. 编程式生命周期
  setup(ctx) {
    // 插件独立隔离存储
    ctx.storage.set('installedAt', Date.now())
    // 跨插件事件订阅与广播
    ctx.on('custom-event', (data) => console.log('收到事件:', data))
  },
  teardown(ctx) {
    console.log('插件停用清理')
  }
})
```

在 `src/renderer/plugins/builtin/index.ts` 中通过 `pluginManager.register(myCustomPlugin)` 注册即可，用户可在「插件扩展中心」热启用或停用。

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
  modal: true, // 父窗口是发起 window.open 的那个窗口
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

在 `config/build.config.mts` 中修改 `productName`、`appId`、`nsis` 等配置。当前示例目标是 Windows `nsis`、macOS `dmg`、Linux `AppImage`。图标可参考 [electron-builder 文档](https://www.electron.build/icons) 放到 `build/` 目录，或在配置中单独指定。应用持有单实例锁，第二次启动会把已有窗口还原到前台。

## 常见问题

**修改主进程代码后没有生效？** `pnpm dev` 会监听 `src/main`。入口及其依赖变更后会重新编译并重启 Electron；`*.preload.ts` 变更后会重新编译并刷新窗口。如果进程没起来，看终端里的 esbuild 报错。

**首次 `pnpm dev` 卡住很久？** 多半是在下载 Electron 二进制，参考上面的镜像配置。

**ESLint 报 `ref` / `computed` 等未定义？** 这些 API 由 `unplugin-auto-import` 自动导入，对应的 `.eslintrc-auto-import.json` 会在运行 `pnpm dev` 后自动生成或更新。

## 开源协议

[MIT](./LICENSE) © 2023-present 桥头的小屁孩
