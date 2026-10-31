<template>
  <div class="system-monitor-settings">
    <el-form label-position="top">
      <el-form-item label="数据刷新间隔">
        <el-select v-model="settings.refreshInterval" placeholder="请选择刷新频率">
          <el-option label="极速 (1 秒)" :value="1000" />
          <el-option label="标准 (3 秒)" :value="3000" />
          <el-option label="节能 (5 秒)" :value="5000" />
          <el-option label="低频 (10 秒)" :value="10000" />
        </el-select>
        <span class="setting-hint">控制系统看板与状态栏硬件指标的轮询周期</span>
      </el-form-item>

      <el-form-item label="内存报警阈值 (%)">
        <el-slider v-model="settings.memoryAlertThreshold" :min="50" :max="95" show-input />
        <span class="setting-hint">当内存占用超过此比例时，触发状态栏高亮与桌面告警</span>
      </el-form-item>

      <el-form-item label="显示 CPU 架构与平台信息">
        <el-switch v-model="settings.showPlatformInfo" active-text="开启" inactive-text="关闭" />
        <span class="setting-hint">在状态栏挂件中一并展示系统架构标识</span>
      </el-form-item>

      <div class="settings-actions">
        <el-button type="primary" @click="save">保存设置</el-button>
        <el-button @click="reset">恢复默认</el-button>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup name="SystemMonitorSettings">
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { pluginManager } from '@/plugin/pluginManager'

const props = withDefaults(
  defineProps<{
    pluginId?: string
  }>(),
  {
    pluginId: 'system-monitor'
  }
)

const storage = pluginManager.getPluginStorage(props.pluginId)

interface MonitorConfig {
  refreshInterval: number
  memoryAlertThreshold: number
  showPlatformInfo: boolean
}

const DEFAULT_CONFIG: MonitorConfig = {
  refreshInterval: 3000,
  memoryAlertThreshold: 85,
  showPlatformInfo: true
}

const settings = reactive<MonitorConfig>({ ...DEFAULT_CONFIG })

onMounted(() => {
  const saved = storage.get<MonitorConfig>('config')
  if (saved) {
    Object.assign(settings, saved)
  }
})

const save = () => {
  storage.set('config', { ...settings })
  ElMessage.success('系统监控配置已保存并生效')
}

const reset = () => {
  Object.assign(settings, DEFAULT_CONFIG)
  storage.set('config', { ...DEFAULT_CONFIG })
  ElMessage.info('已恢复默认配置')
}
</script>

<style scoped lang="scss">
.system-monitor-settings {
  padding: 10px 4px;

  .setting-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
    display: block;
  }

  .settings-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
