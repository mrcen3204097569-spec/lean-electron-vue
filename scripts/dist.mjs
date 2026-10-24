// 在应用构建之外再跑 electron-builder。pnpm build 不会进入这个分支。
process.env.ELECTRON_PACKAGE = '1'

const { build } = await import('vite')

await build()
