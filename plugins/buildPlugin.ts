import * as path from 'path'
import * as fs from 'fs'
import * as fsExtra from 'fs-extra'
import { buildConfig } from '../config/build.config'

class BuildObj {
  // 编译主进程代码
  buildMain() {
    // 编译入口文件
    require('esbuild').buildSync({
      entryPoints: ['./src/main/mainEntry.ts', './src/main/preload/*.preload.ts'],
      bundle: true,
      platform: 'node',
      outdir: './dist/',
      external: ['electron']
    })
  }

  // 为生产环境准备package.json
  preparePackageJson() {
    const pkgJsonPath = path.join(process.cwd(), 'package.json')
    const localPkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
    const electronConfig = localPkgJson.devDependencies.electron.replace('^', '')
    localPkgJson.main = 'mainEntry.js'
    delete localPkgJson.scripts
    delete localPkgJson.devDependencies
    localPkgJson.devDependencies = { electron: electronConfig }
    const tarJsonPath = path.join(process.cwd(), 'dist', 'package.json')
    fs.writeFileSync(tarJsonPath, JSON.stringify(localPkgJson))
    fs.mkdirSync(path.join(process.cwd(), 'dist/node_modules'))
  }

  // 使用electron-builder制成安装包
  async buildInstaller() {
    // 先删除目标文件夹
    await this.deleteFolder(path.join(process.cwd(), 'release'))

    // 打包实例
    const builder = require('electron-builder')

    // 开始打包
    await builder.build(buildConfig.electronBuildConfig)

    // 将更新信息写入 latest.yml
    fs.readFile('./release/latest.yml', 'utf8', (err, data) => {
      if (err) throw err

      data += `updateTitle: ${buildConfig.updateMsg.title}\n`
      data += `updateSubTitle: ${buildConfig.updateMsg.subTitle}\n`
      data += `updateContent: ${buildConfig.updateMsg.content}\n`

      fs.writeFile('./release/latest.yml', data, (err) => {
        if (err) throw err
        console.log('latest.yml写入更新信息成功！')
      })
    })

    console.log('打包完成')
  }

  deleteFolder(folderPath) {
    try {
      fsExtra.removeSync(folderPath)
      console.log('文件夹删除成功！')
    } catch (err) {
      console.error('删除文件夹出错：', err)
    }
  }
}

export const buildPlugin = (): any => {
  return {
    name: 'build-plugin',
    closeBundle: () => {
      console.log('closeBundle钩子调用')
      const buildObj = new BuildObj()
      buildObj.buildMain()
      buildObj.preparePackageJson()
      buildObj.buildInstaller()
    }
  }
}
