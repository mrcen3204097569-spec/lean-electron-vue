import { createRouter, createWebHistory, RouteRecordRaw, RouterOptions } from 'vue-router'
import HomeView from '@/views/home/HomeView.vue'

const routerModules: Record<any, any> = import.meta.glob('./modules/*.router.ts', {
  eager: true
})

const routes: RouteRecordRaw[] = [
  <RouteRecordRaw>{
    path: '/',
    name: 'home-view',
    component: HomeView
  }
]

// 模块自动导入
for (const routerModulesKey in routerModules) {
  routes.push(routerModules[routerModulesKey].default)
}

// 创建路由
export const router = createRouter(<RouterOptions>{
  routes,
  history: createWebHistory()
})
