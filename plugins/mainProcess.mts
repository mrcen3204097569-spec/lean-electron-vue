import { buildSync } from 'esbuild'

/**
 * 使用 esbuild 编译主进程 & 预加载脚本到 dist 目录
 */
export const buildMainProcess = () => {
  buildSync({
    entryPoints: ['./src/main/mainEntry.ts', './src/main/preload/*.preload.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node22',
    outdir: './dist/',
    external: ['electron']
  })
}
