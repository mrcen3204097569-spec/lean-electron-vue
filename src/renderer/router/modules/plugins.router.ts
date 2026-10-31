import type { RouteRecordRaw } from 'vue-router'
import PluginsView from '@/views/plugins/PluginsView.vue'

export default <RouteRecordRaw>{
  path: '/plugins',
  name: 'plugins-view',
  component: PluginsView,
  meta: {
    title: '插件管理中心'
  }
}
