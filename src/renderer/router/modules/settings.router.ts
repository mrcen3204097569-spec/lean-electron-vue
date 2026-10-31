import type { RouteRecordRaw } from 'vue-router'
import SettingsView from '@/views/settings/SettingsView.vue'

export default <RouteRecordRaw>{
  path: '/settings',
  name: 'settings-view',
  component: SettingsView,
  meta: {
    title: '系统设置'
  }
}
