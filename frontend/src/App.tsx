import { useState, useMemo, useEffect } from 'react'
import { LOCALES, type Lang } from './locales'
import {
  ActionIcon,
  Alert,
  Anchor,
  Autocomplete,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Divider,
  Group,
  Loader,
  MantineProvider,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  Tooltip,
} from '@mantine/core'
import { main } from '../wailsjs/go/models'
import {
  FindFolders, DeleteFolders, SelectDirectory,
  GetWindowsCacheTargets, CleanCacheTargets,
  GetTweaks, ApplyTweak, ApplySelectTweak,
  LoadSettings, SaveSettings,
} from '../wailsjs/go/main/App'
import { WindowMinimise, WindowToggleMaximise, Quit } from '../wailsjs/runtime/runtime'

type FolderItem = main.FolderItem
type CacheTarget = main.CacheTarget
interface TweakOption { label: string; value: string }
interface Tweak {
  id: string; name: string; description: string; category: string
  enabled: boolean; requiresRestart: boolean
  kind: 'toggle' | 'select'
  options?: TweakOption[]
  currentValue?: string
}
type ColorScheme = 'dark' | 'light'
type FilterGroup = 'all' | 'js' | 'rust' | 'python' | 'java' | 'go'
type SortKey = 'type' | 'size' | 'projectName' | 'path'

interface Settings {
  colorScheme: ColorScheme
  autoSelectAll: boolean
  showSizes: boolean
  showProjectName: boolean
  confirmDelete: boolean
  maxDepth: number
  compactTable: boolean
  disabledTypes: string[]
  lang: Lang
}

const DEFAULT_SETTINGS: Settings = {
  colorScheme: 'dark',
  autoSelectAll: true,
  showSizes: true,
  showProjectName: true,
  confirmDelete: true,
  maxDepth: 0,
  compactTable: false,
  disabledTypes: [],
  lang: 'ru',
}

function loadSettings(): Settings {
  try {
    const s = localStorage.getItem('cleaner-settings')
    if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) }
  } catch {}
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(s: Settings) {
  const data = JSON.stringify(s)
  localStorage.setItem('cleaner-settings', data)
  SaveSettings(data).catch(() => {})
}

function getHistory(): string[] {
  try {
    const h = localStorage.getItem('cleaner-history')
    if (h) return JSON.parse(h)
  } catch {}
  return []
}

function pushHistory(path: string) {
  const h = [path, ...getHistory().filter(p => p !== path)].slice(0, 10)
  localStorage.setItem('cleaner-history', JSON.stringify(h))
}

function formatSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`
  return bytes > 0 ? `${bytes} B` : '—'
}

function getGroup(type: string): FilterGroup {
  if (type.startsWith('node/') || ['next.js/cache','nuxt/cache','svelte/cache','turbo/cache','parcel/cache'].includes(type)) return 'js'
  if (type.startsWith('rust/')) return 'rust'
  if (type.startsWith('python/')) return 'python'
  if (type.startsWith('java/')) return 'java'
  if (type.startsWith('go/')) return 'go'
  return 'all'
}

const TYPE_META: Record<string, { color: string; label: string }> = {
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

const ALL_TYPES = Object.keys(TYPE_META)

const GROUP_LABELS_RU: Record<FilterGroup, string> = {
  all: 'Все', js: 'JS / TS', rust: 'Rust', python: 'Python', java: 'Java', go: 'Go',
}

function typeMeta(type: string) { return TYPE_META[type] ?? { color: 'gray', label: type } }

// ── Icons ────────────────────────────────────────────────────────────────────
function IconMinus() { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="12" x2="20" y2="12"/></svg> }
function IconSquare() { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/></svg> }
function IconX() { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="5" y1="19" x2="19" y2="5"/></svg> }
function IconSettings() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function IconFolder() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> }
function IconCopy() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> }
function IconTrash() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> }
function IconChevron({ dir }: { dir: 'up' | 'down' }) { return dir === 'up' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg> }
function IconSearch() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function IconMoon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> }
function IconSun() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> }
function IconBroom() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3l7 7"/><path d="M3 21l9-9"/><path d="M12.5 7.5l-2 2L19 18l2-2-8.5-8.5z"/><path d="M3 21h5l-5-5v5z"/></svg> }
function IconToggle() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3"/></svg> }
function IconRefresh() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> }

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const L = LOCALES[settings.lang]
  const [activeTab, setActiveTab] = useState<string | null>('cleaner')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Cleaner state
  const [searchPath, setSearchPath] = useState('')
  const [history, setHistory] = useState<string[]>(getHistory)
  const [scanning, setScanning] = useState(false)
  const [items, setItems] = useState<FolderItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [deleteResult, setDeleteResult] = useState<{ deleted: number; errors: string[] } | null>(null)
  const [filterGroup, setFilterGroup] = useState<FilterGroup>('all')
  const [sortKey, setSortKey] = useState<SortKey>('type')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [copied, setCopied] = useState(false)

  // Cache state
  const [cacheTargets, setCacheTargets] = useState<CacheTarget[]>([])
  const [cacheSelected, setCacheSelected] = useState<Set<string>>(new Set())
  const [cacheLoading, setCacheLoading] = useState(false)
  const [cacheCleaning, setCacheCleaning] = useState(false)
  const [cacheResult, setCacheResult] = useState<{ cleaned: number; errors: number } | null>(null)

  // Tweaks state
  const [tweaks, setTweaks] = useState<Tweak[]>([])
  const [tweaksLoading, setTweaksLoading] = useState(false)
  const [tweakErrors, setTweakErrors] = useState<Record<string, string>>({})
  const [tweakSelectValues, setTweakSelectValues] = useState<Record<string, string>>({})

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      saveSettings(next)
      return next
    })
  }

  async function handleBrowse() {
    const dir = await SelectDirectory()
    if (dir) setSearchPath(dir)
  }

  async function handleScan() {
    const path = searchPath.trim()
    if (!path) return
    setScanning(true)
    setItems([])
    setSelected(new Set())
    setDeleteResult(null)
    setScanned(false)
    setFilterGroup('all')
    try {
      const data = await FindFolders(path, settings.maxDepth)
      const list = data ?? []
      setItems(list)
      if (settings.autoSelectAll) setSelected(new Set(list.map((i: FolderItem) => i.path)))
      setScanned(true)
      pushHistory(path)
      setHistory(getHistory())
    } finally {
      setScanning(false)
    }
  }

  async function doDelete() {
    const paths = Array.from(selected)
    if (!paths.length) return
    setConfirmOpen(false)
    setDeleting(true)
    try {
      const res = await DeleteFolders(paths)
      let deleted = 0
      const errors: string[] = []
      for (const [p, status] of Object.entries(res)) {
        if (status === 'ok') deleted++
        else errors.push(`${p}: ${status}`)
      }
      setDeleteResult({ deleted, errors })
      setItems(prev => prev.filter(i => res[i.path] !== 'ok'))
      setSelected(new Set())
    } finally {
      setDeleting(false)
    }
  }

  function handleDelete() {
    if (!selected.size) return
    if (settings.confirmDelete) setConfirmOpen(true)
    else doDelete()
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(visibleItems.map(i => i.path)) : new Set())
  }

  function toggleItem(path: string) {
    setSelected(prev => { const n = new Set(prev); n.has(path) ? n.delete(path) : n.add(path); return n })
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(visibleItems.map(i => i.path).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Cache handlers
  async function loadCacheTargets() {
    setCacheLoading(true)
    setCacheResult(null)
    try {
      const data = await GetWindowsCacheTargets()
      const targets = data ?? []
      setCacheTargets(targets)
      setCacheSelected(new Set(targets.filter((t: CacheTarget) => t.exists && t.size > 0).map((t: CacheTarget) => t.path)))
    } finally {
      setCacheLoading(false)
    }
  }

  function toggleCache(path: string) {
    setCacheSelected(prev => { const n = new Set(prev); n.has(path) ? n.delete(path) : n.add(path); return n })
  }

  async function doCleanCache() {
    const paths = Array.from(cacheSelected)
    if (!paths.length) return
    setCacheCleaning(true)
    try {
      const res = await CleanCacheTargets(paths)
      let cleaned = 0; let errors = 0
      for (const status of Object.values(res)) {
        if (status === 'ok') cleaned++; else errors++
      }
      setCacheResult({ cleaned, errors })
      await loadCacheTargets()
    } finally {
      setCacheCleaning(false)
    }
  }

  // Tweaks handlers
  async function loadTweaks() {
    setTweaksLoading(true)
    setTweakErrors({})
    try {
      const data = (await GetTweaks() ?? []) as Tweak[]
      setTweaks(data)
      const initVals: Record<string, string> = {}
      for (const t of data) {
        if (t.kind === 'select' && t.currentValue) initVals[t.id] = t.currentValue
      }
      setTweakSelectValues(initVals)
    } finally {
      setTweaksLoading(false)
    }
  }

  async function handleTweakToggle(id: string, enabled: boolean) {
    setTweaks(prev => prev.map(t => t.id === id ? { ...t, enabled } : t))
    setTweakErrors(prev => { const n = { ...prev }; delete n[id]; return n })
    const result = await ApplyTweak(id, enabled)
    if (result !== 'ok') {
      setTweaks(prev => prev.map(t => t.id === id ? { ...t, enabled: !enabled } : t))
      setTweakErrors(prev => ({ ...prev, [id]: result }))
    }
  }

  async function handleTweakSelect(id: string, value: string) {
    const prev = tweakSelectValues[id]
    setTweakSelectValues(p => ({ ...p, [id]: value }))
    setTweakErrors(p => { const n = { ...p }; delete n[id]; return n })
    const result = await ApplySelectTweak(id, value)
    if (result !== 'ok') {
      setTweakSelectValues(p => ({ ...p, [id]: prev ?? '' }))
      setTweakErrors(p => ({ ...p, [id]: result }))
    }
  }

  useEffect(() => {
    LoadSettings().then((raw: string) => {
      if (raw) {
        try {
          setSettings(prev => ({ ...prev, ...JSON.parse(raw) }))
        } catch {}
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (activeTab === 'cache' && cacheTargets.length === 0 && !cacheLoading) loadCacheTargets()
    if (activeTab === 'tweaks' && tweaks.length === 0 && !tweaksLoading) loadTweaks()
  }, [activeTab])

  // Memos
  const visibleItems = useMemo(() => {
    let list = items.filter(i => (filterGroup === 'all' || getGroup(i.type) === filterGroup) && !settings.disabledTypes.includes(i.type))
    list = [...list].sort((a, b) => {
      let v = 0
      if (sortKey === 'size') v = a.size - b.size
      else if (sortKey === 'type') v = a.type.localeCompare(b.type)
      else if (sortKey === 'projectName') v = a.projectName.localeCompare(b.projectName)
      else v = a.path.localeCompare(b.path)
      return sortDir === 'asc' ? v : -v
    })
    return list
  }, [items, filterGroup, sortKey, sortDir])

  const selectedSize = useMemo(
    () => visibleItems.filter(i => selected.has(i.path)).reduce((a, i) => a + i.size, 0),
    [visibleItems, selected]
  )
  const visibleSelected = visibleItems.filter(i => selected.has(i.path))
  const allChecked = visibleItems.length > 0 && visibleSelected.length === visibleItems.length
  const indeterminate = visibleSelected.length > 0 && visibleSelected.length < visibleItems.length

  const groupCounts = useMemo(() => {
    const c: Partial<Record<FilterGroup, number>> = {}
    for (const item of items) { const g = getGroup(item.type); c[g] = (c[g] ?? 0) + 1 }
    return c
  }, [items])

  const tweaksByCategory = useMemo(() => {
    const map = new Map<string, Tweak[]>()
    for (const t of tweaks) {
      if (!map.has(t.category)) map.set(t.category, [])
      map.get(t.category)!.push(t)
    }
    return map
  }, [tweaks])

  const cacheSelectedSize = cacheTargets.filter(t => cacheSelected.has(t.path)).reduce((a, t) => a + t.size, 0)

  const titleBarStyle = { '--wails-draggable': 'drag', userSelect: 'none' as const }
  const noDrag = { '--wails-draggable': 'no-drag' } as React.CSSProperties

  function SortTh({ k, label }: { k: SortKey; label: string }) {
    return (
      <Table.Th onClick={() => handleSort(k)} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <Group gap={4} wrap="nowrap">{label}{sortKey === k ? <IconChevron dir={sortDir === 'asc' ? 'up' : 'down'} /> : null}</Group>
      </Table.Th>
    )
  }

  return (
    <MantineProvider forceColorScheme={settings.colorScheme}>
      <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Title bar */}
        <Box h={40} px="sm" style={{
          ...titleBarStyle,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--mantine-color-default-border)',
          flexShrink: 0, background: 'var(--mantine-color-dark-8)',
        } as React.CSSProperties}>
          <Group gap="xs" style={noDrag}>
            <IconFolder />
            <Text size="sm" fw={600} c="dimmed">AmyTool</Text>
          </Group>
          <Group gap={2} style={noDrag}>
            <ActionIcon variant="subtle" size="sm" onClick={WindowMinimise}><IconMinus /></ActionIcon>
            <ActionIcon variant="subtle" size="sm" onClick={WindowToggleMaximise}><IconSquare /></ActionIcon>
            <ActionIcon variant="subtle" size="sm" color="red" onClick={Quit}><IconX /></ActionIcon>
          </Group>
        </Box>

        {/* Main area with tabs */}
        <Box style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Tabs.List px="md" pt="xs" style={{ flexShrink: 0 }}>
              <Tabs.Tab value="cleaner" leftSection={<IconFolder />}>{L.tabs.projects}</Tabs.Tab>
              <Tabs.Tab value="cache" leftSection={<IconBroom />}>{L.tabs.cache}</Tabs.Tab>
              <Tabs.Tab value="tweaks" leftSection={<IconToggle />}>{L.tabs.tweaks}</Tabs.Tab>
              <Tabs.Tab value="settings" leftSection={<IconSettings />}>{L.tabs.settings}</Tabs.Tab>
            </Tabs.List>

            {/* ── CLEANER TAB ─────────────────────────────────────────────── */}
            <Tabs.Panel value="cleaner" style={{ flex: 1, overflow: 'auto' }} p="md">
              <Stack gap="md" maw={1300} mx="auto">

                <Paper withBorder p="md">
                  <Group gap="xs" align="flex-end">
                    <Autocomplete
                      label={L.cleaner.scanLabel}
                      placeholder={L.cleaner.scanPlaceholder}
                      leftSection={<IconSearch />}
                      value={searchPath}
                      onChange={setSearchPath}
                      onKeyDown={e => e.key === 'Enter' && handleScan()}
                      data={history}
                      limit={8}
                      style={{ flex: 1 }}
                    />
                    <Tooltip label={L.cleaner.scanTooltip}>
                      <ActionIcon variant="default" size={36} onClick={() => setSettingsOpen(true)}><IconSettings /></ActionIcon>
                    </Tooltip>
                    <Button variant="default" leftSection={<IconFolder />} onClick={handleBrowse}>{L.cleaner.browse}</Button>
                    <Button leftSection={<IconSearch />} onClick={handleScan} loading={scanning} disabled={!searchPath.trim()}>{L.cleaner.scan}</Button>
                  </Group>
                </Paper>

                {scanning && <Center py="xl"><Stack align="center" gap="xs"><Loader size="lg" /><Text c="dimmed" size="sm">{L.cleaner.scanning}</Text></Stack></Center>}

                {deleteResult && (
                  <Alert color={deleteResult.errors.length ? 'yellow' : 'green'} title={`Удалено папок: ${deleteResult.deleted}`} withCloseButton onClose={() => setDeleteResult(null)}>
                    {deleteResult.errors.length > 0 && <Text size="xs" c="red" style={{ whiteSpace: 'pre' }}>{deleteResult.errors.join('\n')}</Text>}
                  </Alert>
                )}

                {scanned && !scanning && (
                  visibleItems.length === 0 && filterGroup === 'all'
                    ? <Text c="dimmed" ta="center" py="xl">{L.cleaner.notFound}</Text>
                    : <Stack gap="sm">
                        {items.length > 0 && (
                          <SegmentedControl
                            value={filterGroup}
                            onChange={v => setFilterGroup(v as FilterGroup)}
                            data={(['all','js','rust','python','java','go'] as FilterGroup[])
                              .filter(g => g === 'all' || groupCounts[g])
                              .map(g => ({
                                label: g === 'all' ? `${L.cleaner.groups[g]} (${items.length})` : `${L.cleaner.groups[g]} (${groupCounts[g] ?? 0})`,
                                value: g,
                              }))}
                            size="xs"
                          />
                        )}
                        <Group justify="space-between" align="center">
                          <Text size="sm" c="dimmed">
                            {L.cleaner.shown}: {visibleItems.length} · {L.cleaner.selected}: {visibleSelected.length}{settings.showSizes && selectedSize > 0 && ` · ${formatSize(selectedSize)}`}
                          </Text>
                          <Group gap="xs">
                            <Tooltip label={copied ? L.cleaner.copied : L.cleaner.copyPaths}>
                              <ActionIcon variant="default" onClick={handleCopy} disabled={visibleItems.length === 0}><IconCopy /></ActionIcon>
                            </Tooltip>
                            <Button color="red" variant="light" leftSection={<IconTrash />} onClick={handleDelete} loading={deleting} disabled={visibleSelected.length === 0}>
                              {L.cleaner.deleteBtn} ({visibleSelected.length})
                            </Button>
                          </Group>
                        </Group>

                        <Paper withBorder>
                          <ScrollArea h={400}>
                            <Table striped highlightOnHover stickyHeader verticalSpacing={settings.compactTable ? 4 : 'xs'}>
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th w={48}><Checkbox checked={allChecked} indeterminate={indeterminate} onChange={e => toggleAll(e.currentTarget.checked)} /></Table.Th>
                                  <SortTh k="type" label={L.cleaner.colType} />
                                  {settings.showProjectName && <SortTh k="projectName" label={L.cleaner.colProject} />}
                                  {settings.showSizes && <SortTh k="size" label={L.cleaner.colSize} />}
                                  <SortTh k="path" label={L.cleaner.colPath} />
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {visibleItems.map(item => {
                                  const meta = typeMeta(item.type)
                                  return (
                                    <Table.Tr key={item.path} style={{ cursor: 'pointer' }} onClick={() => toggleItem(item.path)}>
                                      <Table.Td onClick={e => e.stopPropagation()}><Checkbox checked={selected.has(item.path)} onChange={() => toggleItem(item.path)} /></Table.Td>
                                      <Table.Td><Badge color={meta.color} variant="light" size="sm">{meta.label}</Badge></Table.Td>
                                      {settings.showProjectName && <Table.Td><Text size="sm" fw={500}>{item.projectName}</Text></Table.Td>}
                                      {settings.showSizes && <Table.Td><Text size="sm" ff="monospace">{item.sizeFmt || '—'}</Text></Table.Td>}
                                      <Table.Td><Text size="xs" c="dimmed" ff="monospace" style={{ wordBreak: 'break-all' }}>{item.path}</Text></Table.Td>
                                    </Table.Tr>
                                  )
                                })}
                              </Table.Tbody>
                            </Table>
                          </ScrollArea>
                        </Paper>
                      </Stack>
                )}
              </Stack>
            </Tabs.Panel>

            {/* ── CACHE TAB ───────────────────────────────────────────────── */}
            <Tabs.Panel value="cache" style={{ flex: 1, overflow: 'auto' }} p="md">
              <Stack gap="md" maw={900} mx="auto">
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={600} size="lg">{L.cache.title}</Text>
                    <Text size="sm" c="dimmed">{L.cache.subtitle}</Text>
                  </div>
                  <Tooltip label={L.cache.refresh}>
                    <ActionIcon variant="default" onClick={loadCacheTargets} loading={cacheLoading}><IconRefresh /></ActionIcon>
                  </Tooltip>
                </Group>

                {cacheLoading ? (
                  <Center py="xl"><Stack align="center" gap="xs"><Loader /><Text size="sm" c="dimmed">{L.cache.counting}</Text></Stack></Center>
                ) : (
                  <>
                    <Stack gap="xs">
                      {cacheTargets.map(t => (
                        <Paper withBorder p="sm" key={t.path} style={{ opacity: t.exists ? 1 : 0.45 }}>
                          <Group justify="space-between" wrap="nowrap">
                            <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                              <Checkbox checked={cacheSelected.has(t.path)} onChange={() => toggleCache(t.path)} disabled={!t.exists} />
                              <div style={{ minWidth: 0 }}>
                                <Text size="sm" fw={500}>{t.name}</Text>
                                <Text size="xs" c="dimmed" ff="monospace" style={{ wordBreak: 'break-all' }}>{t.path}</Text>
                              </div>
                            </Group>
                            <Badge variant="light" color={!t.exists ? 'gray' : t.size > 1e6 ? 'orange' : t.size > 0 ? 'yellow' : 'green'} style={{ flexShrink: 0 }}>
                              {t.exists ? (t.sizeFmt || '0 B') : L.cache.notFound}
                            </Badge>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>

                    {cacheResult && (
                      <Alert color={cacheResult.errors > 0 ? 'yellow' : 'green'} withCloseButton onClose={() => setCacheResult(null)}>
                        {L.cache.cleaned}: {cacheResult.cleaned}{cacheResult.errors > 0 && `, ${L.cache.errors}: ${cacheResult.errors}`}
                      </Alert>
                    )}

                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">{L.cache.selected}: {cacheSelected.size} · {formatSize(cacheSelectedSize)}</Text>
                      <Button color="orange" leftSection={<IconBroom />} loading={cacheCleaning} disabled={cacheSelected.size === 0} onClick={doCleanCache}>
                        {L.cache.cleanBtn} ({cacheSelected.size})
                      </Button>
                    </Group>
                  </>
                )}
              </Stack>
            </Tabs.Panel>

            {/* ── TWEAKS TAB ──────────────────────────────────────────────── */}
            <Tabs.Panel value="tweaks" style={{ flex: 1, overflow: 'auto' }} p="md">
              <Stack gap="md" maw={800} mx="auto">
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={600} size="lg">{L.tweaks.title}</Text>
                    <Text size="sm" c="dimmed">{L.tweaks.subtitle}</Text>
                  </div>
                  <Tooltip label={L.tweaks.refresh}>
                    <ActionIcon variant="default" onClick={loadTweaks} loading={tweaksLoading}><IconRefresh /></ActionIcon>
                  </Tooltip>
                </Group>

                {tweaksLoading ? (
                  <Center py="xl"><Stack align="center" gap="xs"><Loader /><Text size="sm" c="dimmed">{L.tweaks.reading}</Text></Stack></Center>
                ) : tweaks.length === 0 ? (
                  <Center py="xl">
                    <Stack align="center" gap="sm">
                      <Text c="dimmed">{L.tweaks.notLoaded}</Text>
                      <Button variant="light" leftSection={<IconRefresh />} onClick={loadTweaks}>{L.tweaks.load}</Button>
                    </Stack>
                  </Center>
                ) : (
                  <Stack gap="lg">
                    {Array.from(tweaksByCategory.entries()).map(([cat, items]) => {
                      const catLabel = L.categories[cat] ?? cat
                      return (
                        <div key={cat}>
                          <Text fw={600} size="sm" c="dimmed" tt="uppercase" mb="xs" style={{ letterSpacing: 1 }}>{catLabel}</Text>
                          <Stack gap="xs">
                            {items.map(tweak => {
                              const tr = L.tweakTranslations[tweak.id]
                              return (
                                <Paper withBorder p="sm" key={tweak.id}>
                                  <Group justify="space-between" wrap="nowrap">
                                    <div style={{ flex: 1 }}>
                                      <Group gap="xs">
                                        <Text size="sm" fw={500}>{tr?.name ?? tweak.name}</Text>
                                        {tweak.requiresRestart && <Badge size="xs" color="orange">{L.tweaks.restart}</Badge>}
                                      </Group>
                                      <Text size="xs" c="dimmed">{tr?.desc ?? tweak.description}</Text>
                                      {tweakErrors[tweak.id] && <Text size="xs" c="red">{L.tweaks.error}: {tweakErrors[tweak.id]}</Text>}
                                    </div>
                                    {tweak.kind === 'select' ? (
                                      <Select
                                        size="xs"
                                        w={130}
                                        value={tweakSelectValues[tweak.id] ?? tweak.currentValue}
                                        onChange={v => v && handleTweakSelect(tweak.id, v)}
                                        data={(tweak.options ?? []).map(o => {
                                          const locOpts = L.tweakSelectOptions?.[tweak.id]
                                          return { value: o.value, label: locOpts?.[o.value] ?? o.label }
                                        })}
                                        allowDeselect={false}
                                      />
                                    ) : (
                                      <Switch
                                        checked={tweak.enabled}
                                        onChange={e => handleTweakToggle(tweak.id, e.currentTarget.checked)}
                                        color="blue"
                                      />
                                    )}
                                  </Group>
                                </Paper>
                              )
                            })}
                          </Stack>
                        </div>
                      )
                    })}
                  </Stack>
                )}
              </Stack>
            </Tabs.Panel>

            {/* ── SETTINGS TAB ────────────────────────────────────────────── */}
            <Tabs.Panel value="settings" style={{ flex: 1, overflow: 'auto' }} p="md">
              <Stack gap="lg" maw={600} mx="auto">
                <Text fw={600} size="lg">{L.settings.title}</Text>

                <Paper withBorder p="md">
                  <Stack gap="md">
                    <Text size="sm" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>{L.settings.appearance}</Text>
                    <div>
                      <Text size="sm" fw={500} mb={8}>{L.settings.themeLabel}</Text>
                      <Group gap="xs" grow>
                        <Button
                          variant={settings.colorScheme === 'dark' ? 'filled' : 'default'}
                          leftSection={<IconMoon />}
                          onClick={() => updateSetting('colorScheme', 'dark')}
                        >
                          {L.settings.dark}
                        </Button>
                        <Button
                          variant={settings.colorScheme === 'light' ? 'filled' : 'default'}
                          leftSection={<IconSun />}
                          onClick={() => updateSetting('colorScheme', 'light')}
                        >
                          {L.settings.light}
                        </Button>
                      </Group>
                    </div>
                    <Divider />
                    <Group justify="space-between" wrap="nowrap">
                      <div>
                        <Text size="sm">{L.settings.compact}</Text>
                        <Text size="xs" c="dimmed">{L.settings.compactDesc}</Text>
                      </div>
                      <Switch
                        checked={settings.compactTable}
                        onChange={e => updateSetting('compactTable', e.currentTarget.checked)}
                        color="blue"
                      />
                    </Group>
                  </Stack>
                </Paper>

                <Paper withBorder p="md">
                  <Stack gap="md">
                    <Text size="sm" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>{L.settings.language}</Text>
                    <Group gap="xs" grow>
                      <Button
                        variant={settings.lang === 'ru' ? 'filled' : 'default'}
                        onClick={() => updateSetting('lang', 'ru')}
                      >
                        Русский
                      </Button>
                      <Button
                        variant={settings.lang === 'en' ? 'filled' : 'default'}
                        onClick={() => updateSetting('lang', 'en')}
                      >
                        English
                      </Button>
                    </Group>
                  </Stack>
                </Paper>

                <Group justify="space-between" align="center">
                  <Anchor href="https://t.me/Oxd5f" target="_blank" size="sm" c="dimmed">Telegram: @Oxd5f</Anchor>
                  <Text size="xs" c="dimmed">v0.1.0</Text>
                </Group>

              </Stack>
            </Tabs.Panel>

          </Tabs>
        </Box>
      </Box>

      {/* Cleaner settings modal */}
      <Modal
        opened={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={L.settings.scanSettingsTitle}
        size="md"
        radius="md"
      >
        <Stack gap="lg">
          <Stack gap="sm">
            <Text size="sm" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>{L.settings.general}</Text>
            <NumberInput
              label={L.settings.depth}
              description={L.settings.depthDesc}
              value={settings.maxDepth}
              onChange={v => updateSetting('maxDepth', Number(v) || 0)}
              min={0} max={50} step={1}
            />
            <Switch label={L.settings.autoSelect} checked={settings.autoSelectAll} onChange={e => updateSetting('autoSelectAll', e.currentTarget.checked)} color="blue" />
            <Switch label={L.settings.showSizes} checked={settings.showSizes} onChange={e => updateSetting('showSizes', e.currentTarget.checked)} color="blue" />
            <Switch label={L.settings.showProject} checked={settings.showProjectName} onChange={e => updateSetting('showProjectName', e.currentTarget.checked)} color="blue" />
            <Switch label={L.settings.compact} checked={settings.compactTable} onChange={e => updateSetting('compactTable', e.currentTarget.checked)} color="blue" />
            <Switch label={L.settings.confirm} checked={settings.confirmDelete} onChange={e => updateSetting('confirmDelete', e.currentTarget.checked)} color="red" />
          </Stack>

          <Divider />

          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>{L.settings.types}</Text>
              <Group gap="xs">
                <Button size="xs" variant="subtle" onClick={() => updateSetting('disabledTypes', [])}>{L.settings.enableAll}</Button>
                <Button size="xs" variant="subtle" color="red" onClick={() => updateSetting('disabledTypes', ALL_TYPES)}>{L.settings.disableAll}</Button>
              </Group>
            </Group>
            {(['js', 'rust', 'python', 'java', 'go'] as const).map(group => {
              const groupTypes = Object.entries(TYPE_META).filter(([k]) => getGroup(k) === group)
              return (
                <div key={group}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={4} style={{ letterSpacing: 0.5 }}>{L.cleaner.groups[group]}</Text>
                  <Group gap="xs" wrap="wrap">
                    {groupTypes.map(([k, v]) => (
                      <Badge
                        key={k}
                        color={v.color}
                        variant={settings.disabledTypes.includes(k) ? 'outline' : 'light'}
                        style={{ cursor: 'pointer', opacity: settings.disabledTypes.includes(k) ? 0.4 : 1 }}
                        onClick={() => {
                          const isDisabled = settings.disabledTypes.includes(k)
                          updateSetting('disabledTypes', isDisabled ? settings.disabledTypes.filter(t => t !== k) : [...settings.disabledTypes, k])
                        }}
                      >
                        {v.label}
                      </Badge>
                    ))}
                  </Group>
                </div>
              )
            })}
          </Stack>

        </Stack>
      </Modal>

      {/* Confirm delete modal */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={L.confirm.title}
        size="sm"
        radius="lg"
        styles={{ content: { borderRadius: 16 }, header: { borderRadius: '16px 16px 0 0' } }}
      >
        <Stack gap="md">
          <Text size="sm">
            {L.confirm.text(selected.size)}
            {settings.showSizes && selectedSize > 0 && <>{L.confirm.textSize(formatSize(selectedSize))}</>}?
          </Text>
          <Text size="xs" c="dimmed">{L.confirm.irreversible}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>{L.confirm.cancel}</Button>
            <Button color="red" leftSection={<IconTrash />} onClick={doDelete} loading={deleting}>{L.confirm.deleteBtn}</Button>
          </Group>
        </Stack>
      </Modal>

    </MantineProvider>
  )
}
