import type { Lang } from './locales'

export type ColorScheme = 'dark' | 'light'
export type FilterGroup = 'all' | 'js' | 'rust' | 'python' | 'java' | 'go'
export type SortKey = 'type' | 'size' | 'projectName' | 'path'

export interface FolderItem {
  path: string
  type: string
  projectName: string
  size: number
  sizeFmt: string
}

export interface CacheTarget {
  name: string
  path: string
  size: number
  sizeFmt: string
  exists: boolean
}

export interface TweakOption {
  label: string
  value: string
}

export interface Tweak {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  requiresRestart: boolean
  kind: 'toggle' | 'select'
  options?: TweakOption[]
  currentValue?: string
}

export interface DiskInfo {
  letter: string
  used: number
  total: number
}

export interface SystemStats {
  cpuPercent: number
  ramUsed: number
  ramTotal: number
  disks: DiskInfo[]
  uptimeSec: number
}

export interface PCInfo {
  hostname: string
  osVersion: string
  cpu: string
  gpu: string
  ramTotal: string
  bios: string
  nic: string
}

export interface SortCategory { name: string; count: number; size: number; exts: string[] }

export interface Settings {
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

export const DEFAULT_SETTINGS: Settings = {
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
