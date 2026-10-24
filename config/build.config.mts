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
      productName: 'lean-electron-vue',
      appId: 'com.example.lean-electron-vue',
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
        shortcutName: 'lean-electron-vue' // 图标名称
      },
      // 生产环境的更新地址必须是 HTTPS。latest*.yml 和安装包走明文 HTTP 时，
      // 中间人可以替换更新说明和安装包。这里的 http://127.0.0.1 只是本机调试占位。
      publish: [{ provider: 'generic', url: 'http://127.0.0.1:3000/static/electron/' }]
    },
    project: process.cwd()
  } as CliOptions,
  // 自定义更新说明，打包后按 YAML 双引号标量追加到 latest*.yml。弹窗按纯文本展示，不渲染 HTML。
  updateMsg: {
    title: '测试更新',
    subTitle: '更新副标题',
    content: '更新内容'
  }
}
