import { buildSync, context, type BuildContext, type BuildOptions, type Plugin } from 'esbuild'

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

function watchEntry(options: BuildOptions, onRebuild: () => void): Promise<BuildContext> {
  return new Promise((resolve, reject) => {
    let settled = false
    let ctx: BuildContext | undefined

    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      if (error) reject(error)
      else if (ctx) resolve(ctx)
      else reject(new Error('esbuild context was not created'))
    }

    const plugin: Plugin = {
      name: 'dev-rebuild',
      setup(build) {
        build.onEnd((result) => {
          if (!settled) {
            if (result.errors.length > 0) {
              finish(new Error(result.errors.map((error) => error.text).join('\n')))
            } else {
              finish()
            }
            return
          }
          if (result.errors.length === 0) onRebuild()
        })
      }
    }

    context({ ...options, plugins: [plugin] })
      .then(async (created) => {
        ctx = created
        await created.watch()
      })
      .catch((error: unknown) => {
        finish(error instanceof Error ? error : new Error(String(error)))
      })
  })
}

/**
 * 分别监听主进程和 preload。第一次构建失败时 reject，不会拉起 Electron。
 * 之后主进程变更走 onMainRebuilt，preload 变更走 onPreloadRebuilt。
 */
export async function watchMainProcess(handlers: {
  onMainRebuilt: () => void
  onPreloadRebuilt: () => void
}): Promise<() => Promise<void>> {
  const mainContext = await watchEntry(
    {
      ...sharedOptions,
      entryPoints: ['./src/main/mainEntry.ts'],
      sourcemap: 'inline'
    },
    handlers.onMainRebuilt
  )
  const preloadContext = await watchEntry(
    {
      ...sharedOptions,
      entryPoints: ['./src/main/preload/*.preload.ts'],
      sourcemap: 'inline'
    },
    handlers.onPreloadRebuilt
  )

  return async () => {
    await mainContext.dispose()
    await preloadContext.dispose()
  }
}
