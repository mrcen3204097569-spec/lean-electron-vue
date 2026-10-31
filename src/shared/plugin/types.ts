import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author?: string
  icon?: string
  homepage?: string
  tags?: string[]
}

export interface PluginViewExtension {
  id: string
  path: string
  title: string
  icon?: string
  component: Component | (() => Promise<{ default: Component }>)
  inNavigation?: boolean
  order?: number
}

export interface PluginStatusBarExtension {
  id: string
  alignment: 'left' | 'right'
  order?: number
  component: Component
}

export interface PluginHeaderActionExtension {
  id: string
  title: string
  icon?: Component | string
  order?: number
  action: () => void
}

export interface PluginCommandExtension {
  id: string
  title: string
  category?: string
  shortcut?: string
  icon?: Component | string
  action: () => void | Promise<void>
}

export interface PluginExtension {
  views?: PluginViewExtension[]
  statusBarItems?: PluginStatusBarExtension[]
  headerActions?: PluginHeaderActionExtension[]
  commands?: PluginCommandExtension[]
}

export interface PluginStorage {
  get: <T = unknown>(key: string, defaultValue?: T) => T
  set: <T = unknown>(key: string, value: T) => void
  remove: (key: string) => void
  clear: () => void
}

export interface PluginContext {
  readonly metadata: Readonly<PluginMetadata>
  readonly storage: PluginStorage
  registerView: (view: PluginViewExtension) => void
  registerStatusBarItem: (item: PluginStatusBarExtension) => void
  registerHeaderAction: (action: PluginHeaderActionExtension) => void
  registerCommand: (command: PluginCommandExtension) => void
  emit: (event: string, payload?: unknown) => void
  on: (event: string, handler: (payload?: unknown) => void) => () => void
}

export interface PluginDefinition {
  metadata: PluginMetadata
  setup?: (ctx: PluginContext) => void | Promise<void>
  teardown?: (ctx: PluginContext) => void | Promise<void>
  extensions?: PluginExtension
}

export interface PluginRuntimeRecord {
  definition: PluginDefinition
  enabled: boolean
  activeExtensions: {
    views: PluginViewExtension[]
    statusBarItems: PluginStatusBarExtension[]
    headerActions: PluginHeaderActionExtension[]
    commands: PluginCommandExtension[]
  }
  removeRouteCallbacks: Map<string, () => void>
}
