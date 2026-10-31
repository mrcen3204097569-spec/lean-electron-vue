import { pluginManager } from '@/plugin/pluginManager'
import { systemMonitorPlugin } from './systemMonitor'
import { quickNotesPlugin } from './quickNotes'
import { devToolboxPlugin } from './devToolbox'

export function registerBuiltinPlugins() {
  pluginManager.register(systemMonitorPlugin)
  pluginManager.register(quickNotesPlugin)
  pluginManager.register(devToolboxPlugin)
}
