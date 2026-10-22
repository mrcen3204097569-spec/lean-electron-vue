import { CliOptions } from 'electron-builder'
import path from 'path'

export const buildConfig = {
  electronBuildConfig: <CliOptions>{
    config: {
      directories: {
        output: path.join(process.cwd(), 'release'),
        app: path.join(process.cwd(), 'dist')
      },
      files: ['**'],
      extends: null,
      productName: 'mrcen',
      appId: 'com.mrcen.desktop',
      asar: true,
      // nsis: {
      //   oneClick: true,
      //   perMachine: true,
      //   allowToChangeInstallationDirectory: false,
      //   createDesktopShortcut: true,
      //   createStartMenuShortcut: true,
      //   shortcutName: 'juejinDesktop'
      // },
      nsis: {
        oneClick: false, // 是否一键安装
        allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
        allowToChangeInstallationDirectory: true, // 允许修改安装目录
        // installerIcon: './build/icons/aaa.ico', // 安装图标路径
        // uninstallerIcon: './build/icons/bbb.ico', // 卸载图标
        // installerHeaderIcon: './build/icons/aaa.ico', // 安装时头部图标
        createDesktopShortcut: true, // 创建桌面图标
        createStartMenuShortcut: true, // 创建开始菜单图标
        shortcutName: 'vite-vue-electron' // 图标名称
      },
      publish: [{ provider: 'generic', url: 'http://127.0.0.1:3000/static/electron/' }]
    },
    project: process.cwd()
  },
  updateMsg: {
    title: '测试更新',
    subTitle: '更新副标题',
    content: '更新内容'
  }
}
