import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from '@/router'
import 'element-plus/theme-chalk/src/index.scss'
import 'animate.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
