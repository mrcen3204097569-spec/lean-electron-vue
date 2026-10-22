import type { CliOptions } from 'electron-builder'
import path from 'node:path'

export const buildConfig = {
  electronBuildConfig: {
    config: {
      directories: {
        output: path.join(process.cwd(), 'release'),
        app: path.join(process.cwd(), 'dist')
      },
      files: ['**'],
      extends: null,
      productName: 'vite-electron-template',
      appId: 'com.example.vite-electron-template',
      asar: true,
      nsis: {
        oneClick: false, // 是否一键安装
        allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
        allowToChangeInstallationDirectory: true, // 允许修改安装目录
        // installerIcon: './build/icons/aaa.ico', // 安装图标路径
        // uninstallerIcon: './build/icons/bbb.ico', // 卸载图标
        // installerHeaderIcon: './build/icons/aaa.ico', // 安装时头部图标
        createDesktopShortcut: true, // 创建桌面图标
        createStartMenuShortcut: true, // 创建开始菜单图标
        shortcutName: 'vite-electron-template' // 图标名称
      },
      // 自动更新地址：把 release 目录下的安装包和 latest*.yml 上传到这个地址即可
      publish: [{ provider: 'generic', url: 'http://127.0.0.1:3000/static/electron/' }]
    },
    project: process.cwd()
  } as CliOptions,
  // 自定义更新信息，打包后会追加写入 latest*.yml，渲染进程更新弹窗会展示这些内容
  updateMsg: {
    title: '测试更新',
    subTitle: '更新副标题',
    content: '更新内容'
  }
}
