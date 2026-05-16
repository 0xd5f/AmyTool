import { SaveSettings } from '../wailsjs/go/main/App'
import type { Settings, FilterGroup } from './types'
import { DEFAULT_SETTINGS } from './types'

export function loadSettings(): Settings {
  try {
    const s = localStorage.getItem('cleaner-settings')
    if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) }
  } catch {}
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(s: Settings) {
  const data = JSON.stringify(s)
  localStorage.setItem('cleaner-settings', data)
  SaveSettings(data).catch(() => {})
}

export function getHistory(): string[] {
  try {
    const h = localStorage.getItem('cleaner-history')
    if (h) return JSON.parse(h)
  } catch {}
  return []
}

export function pushHistory(path: string) {
  const h = [path, ...getHistory().filter(p => p !== path)].slice(0, 10)
  localStorage.setItem('cleaner-history', JSON.stringify(h))
}

export function formatSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`
  return bytes > 0 ? `${bytes} B` : '—'
}

export function getGroup(type: string): FilterGroup {
  if (type.startsWith('node/') || ['next.js/cache', 'nuxt/cache', 'svelte/cache', 'turbo/cache', 'parcel/cache'].includes(type)) return 'js'
  if (type.startsWith('rust/')) return 'rust'
  if (type.startsWith('python/')) return 'python'
  if (type.startsWith('java/')) return 'java'
  if (type.startsWith('go/')) return 'go'
  return 'all'
}

export const TYPE_META: Record<string, { color: string; label: string }> = {
  'node/modules':      { color: 'green',  label: 'node_modules'  },
  'node/dist':         { color: 'teal',   label: 'dist'          },
  'node/build':        { color: 'teal',   label: 'build'         },
  'node/coverage':     { color: 'cyan',   label: 'coverage'      },
  'rust/target':       { color: 'orange', label: 'target'        },
  'python/venv':       { color: 'blue',   label: '.venv'         },
  'python/cache':      { color: 'indigo', label: '__pycache__'   },
  'python/test-cache': { color: 'violet', label: '.pytest_cache' },
  'python/mypy-cache': { color: 'grape',  label: '.mypy_cache'   },
  'python/ruff-cache': { color: 'grape',  label: '.ruff_cache'   },
  'python/tox':        { color: 'violet', label: '.tox'          },
  'java/target':       { color: 'yellow', label: 'target'        },
  'java/build':        { color: 'yellow', label: 'build'         },
  'java/gradle':       { color: 'lime',   label: '.gradle'       },
  'go/vendor':         { color: 'cyan',   label: 'vendor'        },
  'next.js/cache':     { color: 'gray',   label: '.next'         },
  'nuxt/cache':        { color: 'green',  label: '.nuxt'         },
  'svelte/cache':      { color: 'red',    label: '.svelte-kit'   },
  'turbo/cache':       { color: 'red',    label: '.turbo'        },
  'parcel/cache':      { color: 'pink',   label: '.parcel-cache' },
}

export const ALL_TYPES = Object.keys(TYPE_META)

export function typeMeta(type: string) {
  return TYPE_META[type] ?? { color: 'gray', label: type }
}
