import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from '@/router'
import 'element-plus/theme-chalk/src/index.scss'
import 'animate.css'

const app = createApp(App)

app.use(router)

app.mount('#app')

/**
 * 注册 electron 调试 log
 */
window.electronLogApi.log((event, text) => console.log(text))
