import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from '@/router'
import { pluginManager } from '@/plugin/pluginManager'
import { registerBuiltinPlugins } from '@/plugins/builtin'
import 'element-plus/dist/index.css'
import 'animate.css'

pluginManager.setRouter(router)
registerBuiltinPlugins()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
