import * as path from 'node:path'
import * as fs from 'node:fs'
import { createRequire } from 'node:module'
import type { Plugin } from 'vite'
import { buildConfig } from '../config/build.config.mts'
import { buildMainProcess } from './mainProcess.mts'
import { formatUpdateNotesYaml } from './updateNotes.mts'

const require = createRequire(import.meta.url)

class BuildObj {
  // 为生产环境准备package.json
  preparePackageJson() {
    const pkgJsonPath = path.join(process.cwd(), 'package.json')
    const localPkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
    // electron-builder 需要确切的 electron 版本号，直接读取已安装的版本
    const electronVersion = require('electron/package.json').version
    localPkgJson.main = 'mainEntry.js'
    delete localPkgJson.scripts
    delete localPkgJson.devDependencies
    delete localPkgJson.packageManager
    localPkgJson.devDependencies = { electron: electronVersion }
    const tarJsonPath = path.join(process.cwd(), 'dist', 'package.json')
    fs.writeFileSync(tarJsonPath, JSON.stringify(localPkgJson))
    fs.mkdirSync(path.join(process.cwd(), 'dist/node_modules'), { recursive: true })
  }

  // 使用electron-builder制成安装包
  async buildInstaller() {
    const releaseDir = path.join(process.cwd(), 'release')

    // 先删除目标文件夹
    fs.rmSync(releaseDir, { recursive: true, force: true })

    // 开始打包
    const { build } = await import('electron-builder')
    await build(buildConfig.electronBuildConfig)

    // 将更新信息写入 latest.yml（不同平台分别为 latest.yml / latest-mac.yml / latest-linux.yml）
    const { title, subTitle, content } = buildConfig.updateMsg
    for (const file of fs.readdirSync(releaseDir)) {
      if (!/^latest.*\.yml$/.test(file)) continue
      fs.appendFileSync(
        path.join(releaseDir, file),
        formatUpdateNotesYaml({ title, subTitle, content })
      )
      console.log(`${file} 写入更新信息成功！`)
    }

    console.log('打包完成')
  }
}

export const buildPlugin = (): Plugin => {
  return {
    name: 'build-plugin',
    apply: 'build',
    closeBundle: async () => {
      const buildObj = new BuildObj()
      buildMainProcess()
      buildObj.preparePackageJson()
      if (process.env.ELECTRON_PACKAGE === '1') {
        await buildObj.buildInstaller()
      } else {
        console.log('已跳过 electron-builder。生成安装包请运行 pnpm dist')
      }
    }
  }
}
