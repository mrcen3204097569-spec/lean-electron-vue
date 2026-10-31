import { ref } from 'vue'
import { pluginManager } from '@/plugin/pluginManager'
import { marketplaceCatalog } from './catalog'

const STORAGE_KEY = 'lean_marketplace_installed_plugins_v1'

export const installedMarketplaceIds = ref<string[]>([])

export function loadInstalledMarketplaceIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveInstalledMarketplaceIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  installedMarketplaceIds.value = ids
}

export function isPluginInstalled(id: string): boolean {
  return pluginManager.hasPlugin(id)
}

export async function installMarketplacePlugin(id: string): Promise<boolean> {
  const item = marketplaceCatalog.find((p) => p.id === id)
  if (!item) return false

  pluginManager.register(item.definition)
  const current = loadInstalledMarketplaceIds()
  if (!current.includes(id)) {
    current.push(id)
    saveInstalledMarketplaceIds(current)
  }
  return true
}

export async function uninstallMarketplacePlugin(id: string): Promise<boolean> {
  await pluginManager.unregister(id)
  const current = loadInstalledMarketplaceIds().filter((item) => item !== id)
  saveInstalledMarketplaceIds(current)
  return true
}

export function initMarketplacePlugins() {
  const ids = loadInstalledMarketplaceIds()
  installedMarketplaceIds.value = ids
  for (const id of ids) {
    const item = marketplaceCatalog.find((p) => p.id === id)
    if (item && !pluginManager.hasPlugin(id)) {
      pluginManager.register(item.definition)
    }
  }
}
