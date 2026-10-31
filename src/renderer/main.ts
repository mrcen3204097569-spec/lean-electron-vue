import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from '@/router'
import { pluginManager } from '@/plugin/pluginManager'
import { registerBuiltinPlugins } from '@/plugins/builtin'
import { initMarketplacePlugins } from '@/plugins/marketplace/installer'
import { initTheme } from '@/common/theme'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'animate.css'

initTheme()
pluginManager.setRouter(router)
registerBuiltinPlugins()
initMarketplacePlugins()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
