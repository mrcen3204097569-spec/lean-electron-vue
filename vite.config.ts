import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { devPlugin } from './plugins/devPlugin'
import { buildPlugin } from './plugins/buildPlugin'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    devPlugin(),
    buildPlugin(),
    AutoImport({
      // 可以自定义文件生成的位置，默认是根目录下，使用ts的建议放src目录下
      dts: 'src/renderer/auto-imports.d.ts',
      imports: ['vue', 'vue-router'],
      resolvers: [ElementPlusResolver()],
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.', 'src/renderer')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/style/global.scss" as *;`
      }
    }
  },
  server: {
    host: '127.0.0.1'
  }
})
