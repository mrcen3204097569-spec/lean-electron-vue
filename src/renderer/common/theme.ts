export type ThemeMode = 'auto' | 'light' | 'dark'

const THEME_STORAGE_KEY = 'lean_app_theme_mode'

export const currentTheme = ref<ThemeMode>('auto')

function applyDarkClass(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function handleSystemThemeChange(e: MediaQueryListEvent) {
  if (currentTheme.value === 'auto') {
    applyDarkClass(e.matches)
  }
}

export function initTheme() {
  const saved = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'auto'
  currentTheme.value = saved

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', handleSystemThemeChange)

  if (saved === 'auto') {
    applyDarkClass(media.matches)
  } else {
    applyDarkClass(saved === 'dark')
  }
}

export function setTheme(mode: ThemeMode) {
  currentTheme.value = mode
  localStorage.setItem(THEME_STORAGE_KEY, mode)

  if (mode === 'auto') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyDarkClass(isDark)
  } else {
    applyDarkClass(mode === 'dark')
  }
}
