import { buildSync, context, type BuildOptions, type Plugin } from 'esbuild'

const sharedOptions = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  outdir: './dist/',
  external: ['electron']
} satisfies BuildOptions

/**
 * 使用 esbuild 编译主进程 & 预加载脚本到 dist 目录
 */
export const buildMainProcess = () => {
  buildSync({
    ...sharedOptions,
    entryPoints: ['./src/main/mainEntry.ts', './src/main/preload/*.preload.ts']
  })
}

function rebuildPlugin(onRebuild: () => void): Plugin {
  let initialBuild = true
  return {
    name: 'dev-rebuild',
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length > 0) return
        if (initialBuild) {
          initialBuild = false
          return
        }
        onRebuild()
      })
    }
  }
}

/**
 * 分别监听主进程和 preload。第一次构建完成后 resolve。
 * 之后主进程变更走 onMainRebuilt，preload 变更走 onPreloadRebuilt。
 */
export async function watchMainProcess(handlers: {
  onMainRebuilt: () => void
  onPreloadRebuilt: () => void
}): Promise<() => Promise<void>> {
  const mainContext = await context({
    ...sharedOptions,
    entryPoints: ['./src/main/mainEntry.ts'],
    sourcemap: 'inline',
    plugins: [rebuildPlugin(handlers.onMainRebuilt)]
  })
  const preloadContext = await context({
    ...sharedOptions,
    entryPoints: ['./src/main/preload/*.preload.ts'],
    sourcemap: 'inline',
    plugins: [rebuildPlugin(handlers.onPreloadRebuilt)]
  })

  await mainContext.watch()
  await preloadContext.watch()

  return async () => {
    await mainContext.dispose()
    await preloadContext.dispose()
  }
}
