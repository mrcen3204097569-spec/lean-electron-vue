/**
 * Pure navigation and child-window policy shared by the main process and unit tests.
 * Nothing in this file may import Electron.
 */

export type NavigationDecision = 'allow' | 'external' | 'deny'

export interface SanitizedWindowOptions {
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  x?: number
  y?: number
  opacity?: number
  center?: boolean
  resizable?: boolean
  minimizable?: boolean
  maximizable?: boolean
  closable?: boolean
  movable?: boolean
  fullscreenable?: boolean
  show?: boolean
  skipTaskbar?: boolean
  autoHideMenuBar?: boolean
  modal?: boolean
  title?: string
  backgroundColor?: string
}

export interface SanitizedWindowFeatures {
  /** Only a literal `true` opts the child window into the privileged preload. */
  preloadMain: boolean
  options: SanitizedWindowOptions
}

const DIMENSION_KEYS = [
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight'
] as const

const POSITION_KEYS = ['x', 'y'] as const

const BOOLEAN_KEYS = [
  'center',
  'resizable',
  'minimizable',
  'maximizable',
  'closable',
  'movable',
  'fullscreenable',
  'show',
  'skipTaskbar',
  'autoHideMenuBar',
  'modal'
] as const

/**
 * Accept a dev-server URL from the environment or the dev plugin.
 * Credentials and non-http(s) schemes are rejected so they cannot be loaded
 * with the privileged preload.
 */
export function parseDevServerUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    if (url.username || url.password) return undefined
    return url.href
  } catch {
    return undefined
  }
}

export function isAllowedNavigationUrl(target: string, devServerUrl?: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(target)
  } catch {
    return false
  }

  if (parsed.protocol === 'app:') return true
  if (!devServerUrl) return false

  let devServer: URL
  try {
    devServer = new URL(devServerUrl)
  } catch {
    return false
  }

  return (
    (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
    parsed.origin === devServer.origin
  )
}

/** http(s) URLs that should be handed to the system browser, never a BrowserWindow. */
export function isExternalWebUrl(target: string): boolean {
  try {
    const url = new URL(target)
    if (url.username || url.password) return false
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function decideNavigation(target: string, devServerUrl?: string): NavigationDecision {
  if (isAllowedNavigationUrl(target, devServerUrl)) return 'allow'
  if (isExternalWebUrl(target)) return 'external'
  return 'deny'
}

function readDimension(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  if (value < 0 || value > 16384) return undefined
  return value
}

function readPosition(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  if (value < -32768 || value > 32768) return undefined
  return value
}

function readOpacity(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  if (value < 0 || value > 1) return undefined
  return value
}

function readShortString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined
  let text = ''
  for (const char of value) {
    const code = char.charCodeAt(0)
    if (code > 0x1f && code !== 0x7f) text += char
  }
  text = text.trim()
  if (!text) return undefined
  return text.slice(0, maxLength)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const MAX_FEATURE_LENGTH = 16_384

function parseFeatureValue(flagOnly: boolean, rawValue: string): string | number | boolean {
  if (flagOnly || rawValue === 'yes' || rawValue === 'true') return true
  if (rawValue === 'no' || rawValue === 'false') return false
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(rawValue)) {
    const numeric = Number(rawValue)
    if (Number.isFinite(numeric)) return numeric
  }
  return rawValue
}

/** `width=800,height=600,left=10,top=20` and bare flags such as `popup`. */
function parseCommaSeparatedFeatures(features: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const part of features.split(',')) {
    const separator = part.indexOf('=')
    const rawKey = (separator === -1 ? part : part.slice(0, separator)).trim()
    const rawValue = separator === -1 ? '' : part.slice(separator + 1).trim()
    if (!rawKey) continue
    const key = rawKey === 'left' ? 'x' : rawKey === 'top' ? 'y' : rawKey
    result[key] = parseFeatureValue(separator === -1, rawValue)
  }
  return result
}

/**
 * `window.open` features are either a JSON object (this template's createDialog)
 * or the standard comma-separated feature string. Invalid input yields `{}`
 * instead of throwing.
 */
export function parseWindowFeatures(features: string): unknown {
  if (typeof features !== 'string') return {}
  const trimmed = features.trim()
  if (!trimmed || trimmed.length > MAX_FEATURE_LENGTH) return {}
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as unknown
    } catch {
      return {}
    }
  }
  return parseCommaSeparatedFeatures(trimmed)
}

/**
 * Keep only window options the renderer is allowed to request.
 * `webPreferences` is never copied; `preloadMain: true` is the only preload switch.
 */
export function sanitizeWindowFeatures(input: unknown): SanitizedWindowFeatures {
  const source = asRecord(input)
  const options: SanitizedWindowOptions = {}

  if (!source) return { preloadMain: false, options }

  for (const key of DIMENSION_KEYS) {
    const value = readDimension(source[key])
    if (value !== undefined) options[key] = value
  }
  for (const key of POSITION_KEYS) {
    const value = readPosition(source[key])
    if (value !== undefined) options[key] = value
  }
  for (const key of BOOLEAN_KEYS) {
    if (typeof source[key] === 'boolean') options[key] = source[key]
  }

  const opacity = readOpacity(source.opacity)
  if (opacity !== undefined) options.opacity = opacity

  const title = readShortString(source.title, 200)
  if (title !== undefined) options.title = title

  const backgroundColor = readShortString(source.backgroundColor, 64)
  if (backgroundColor !== undefined) options.backgroundColor = backgroundColor

  const webPreferences = asRecord(source.webPreferences)
  const preloadMain = webPreferences?.preloadMain === true

  return { preloadMain, options }
}
