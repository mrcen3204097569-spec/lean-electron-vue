import TestView from '@/views/test/TestView.vue'
import { RouteRecordRaw } from 'vue-router'

export default <RouteRecordRaw>{
  path: '/test',
  name: 'test-view',
  component: TestView
}
