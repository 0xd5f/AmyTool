import { useState, useEffect } from 'react'
import { Box, Button, Checkbox, Group, Menu, Paper, Stack, Switch, Text, TextInput } from '@mantine/core'
import type { SortCategory } from '../types'
import { GetSortPreview, RunSortSelected, SelectDirectory } from '../../wailsjs/go/main/App'

const HISTORY_KEY = 'sorter-recent-folders'
const HISTORY_MAX = 5

function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') } catch { return [] }
}

function saveHistory(dir: string) {
  const prev = loadHistory().filter(d => d !== dir)
  localStorage.setItem(HISTORY_KEY, JSON.stringify([dir, ...prev].slice(0, HISTORY_MAX)))
}

function fmtSize(bytes: number): string {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return bytes + ' B'
}

interface Props {
  L: {
    sorter: {
      title: string
      selectFolder: string
      preview: string
      sort: string
      noFolder: string
      noFiles: string
      files: string
      errTitle: string
      done: string
      selectAll: string
      deselectAll: string
      willMove: string
      moved: string
      others: string
      copyMode: string
      moveMode: string
      recentFolders: string
    }
  }
}

export function SorterPage({ L }: Props) {
  const S = L.sorter
  const [dir, setDir] = useState('')
  const [categories, setCategories] = useState<SortCategory[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string> | null>(null)
  const [movedCount, setMovedCount] = useState<number | null>(null)
  const [copyMode, setCopyMode] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => { setHistory(loadHistory()) }, [])

  const sortable = categories?.filter(c => c.name !== '_others') ?? []
  const others = categories?.find(c => c.name === '_others')
  const willMoveCount = sortable.filter(c => selected.has(c.name)).reduce((s, c) => s + c.count, 0)
  const willMoveSize = sortable.filter(c => selected.has(c.name)).reduce((s, c) => s + c.size, 0)

  function pickDir(d: string) {
    setDir(d)
    setCategories(null)
    setSelected(new Set())
    setErrors(null)
    setMovedCount(null)
    saveHistory(d)
    setHistory(loadHistory())
  }

  async function browse() {
    const d = await SelectDirectory()
    if (d) pickDir(d)
  }

  async function doPreview() {
    if (!dir) return
    setBusy(true)
    setErrors(null)
    setMovedCount(null)
    try {
      const p = await GetSortPreview(dir)
      const cats = p ?? []
      setCategories(cats)
      setSelected(new Set(cats.filter(c => c.name !== '_others').map(c => c.name)))
    } finally {
      setBusy(false)
    }
  }

  async function doSort() {
    if (!dir || selected.size === 0) return
    setBusy(true)
    try {
      const prev = categories?.filter(c => c.name !== '_others') ?? []
      const prevTotal = prev.filter(c => selected.has(c.name)).reduce((s, c) => s + c.count, 0)
      const errs = await RunSortSelected(dir, Array.from(selected), copyMode)
      const errCount = Object.keys(errs).length
      setErrors(errCount > 0 ? errs : null)
      setMovedCount(prevTotal - errCount)
      const p = await GetSortPreview(dir)
      setCategories(p ?? [])
      setSelected(new Set((p ?? []).filter(c => c.name !== '_others').map(c => c.name)))
    } finally {
      setBusy(false)
    }
  }

  function toggleAll(val: boolean) {
    if (val) setSelected(new Set(sortable.map(c => c.name)))
    else setSelected(new Set())
  }

  function toggle(name: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const errEntries = errors ? Object.entries(errors) : []
  const allChecked = sortable.length > 0 && sortable.every(c => selected.has(c.name))
  const someChecked = sortable.some(c => selected.has(c.name))

  return (
    <Box p="md" style={{ height: '100%', overflowY: 'auto' }}>
      <Text fw={600} size="lg" mb="md">{S.title}</Text>

      <Group mb="md" align="flex-end">
        <TextInput
          style={{ flex: 1 }}
          value={dir}
          onChange={e => setDir(e.currentTarget.value)}
          placeholder={S.noFolder}
          readOnly
        />
        <Button variant="default" onClick={browse}>{S.selectFolder}</Button>
        {history.length > 0 && (
          <Menu withinPortal>
            <Menu.Target>
              <Button variant="default" px="xs">▾</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{S.recentFolders}</Menu.Label>
              {history.map(h => (
                <Menu.Item key={h} onClick={() => pickDir(h)} style={{ maxWidth: 320 }}>
                  <Text size="xs" truncate>{h}</Text>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}
        <Button onClick={doPreview} loading={busy && !categories} disabled={!dir}>{S.preview}</Button>
      </Group>

      {categories !== null && (
        <Paper p="md" radius="md" withBorder mb="md">
          {sortable.length === 0 && !others ? (
            <Text c="dimmed" size="sm">{S.noFiles}</Text>
          ) : (
            <Stack gap={0}>
              {sortable.length > 0 && (
                <Group justify="space-between" mb={10}>
                  <Checkbox
                    checked={allChecked}
                    indeterminate={!allChecked && someChecked}
                    onChange={e => toggleAll(e.currentTarget.checked)}
                    label={<Text size="sm" fw={600}>{allChecked ? S.deselectAll : S.selectAll}</Text>}
                  />
                  {willMoveCount > 0 && (
                    <Text size="xs" c="dimmed">
                      {S.willMove}: {willMoveCount} {S.files} · {fmtSize(willMoveSize)}
                    </Text>
                  )}
                </Group>
              )}

              <Stack gap={4}>
                {sortable.map(cat => (
                  <Group key={cat.name} justify="space-between" py={5} style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                    <Checkbox
                      checked={selected.has(cat.name)}
                      onChange={() => toggle(cat.name)}
                      label={
                        <Group gap={8}>
                          <Text size="sm" fw={500} w={80}>{cat.name}</Text>
                          <Text size="xs" c="dimmed">{cat.exts.join(', ')}</Text>
                        </Group>
                      }
                    />
                    <Group gap={8}>
                      <Text size="xs" c="dimmed">{fmtSize(cat.size)}</Text>
                      <Text size="sm" c={selected.has(cat.name) ? undefined : 'dimmed'}>{cat.count} {S.files}</Text>
                    </Group>
                  </Group>
                ))}
              </Stack>

              {others && (
                <Group justify="space-between" pt={10} mt={6} style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                  <Text size="sm" c="dimmed">{S.others}</Text>
                  <Group gap={8}>
                    <Text size="xs" c="dimmed">{fmtSize(others.size)}</Text>
                    <Text size="sm" c="dimmed">{others.count} {S.files}</Text>
                  </Group>
                </Group>
              )}
            </Stack>
          )}
        </Paper>
      )}

      {categories !== null && sortable.length > 0 && movedCount === null && (
        <Group mb="md">
          <Button onClick={doSort} loading={busy} disabled={selected.size === 0} color="blue">{S.sort}</Button>
          <Switch
            checked={copyMode}
            onChange={e => setCopyMode(e.currentTarget.checked)}
            label={<Text size="sm">{copyMode ? S.copyMode : S.moveMode}</Text>}
          />
        </Group>
      )}

      {movedCount !== null && (
        <Text c={errEntries.length === 0 ? 'green' : 'yellow'} fw={600} mb="md">
          {S.moved}: {movedCount} {S.files}{errEntries.length > 0 ? ` · ${errEntries.length} ${S.errTitle.toLowerCase()}` : ''}
        </Text>
      )}

      {errEntries.length > 0 && (
        <Paper p="md" radius="md" withBorder>
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={8}>{S.errTitle}</Text>
          <Stack gap={4}>
            {errEntries.map(([file, msg]) => (
              <Text key={file} size="xs">{file}: {msg}</Text>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  )
}
