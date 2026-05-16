import { useState, useMemo } from 'react'
import {
  ActionIcon, Alert, Autocomplete, Badge, Box, Button, Center,
  Checkbox, Divider, Group, Loader, Modal, NumberInput, Paper,
  ScrollArea, SegmentedControl, Stack, Switch, Table, Text, Tooltip,
} from '@mantine/core'
import { FindFolders, DeleteFolders, SelectDirectory } from '../../wailsjs/go/main/App'
import { IconSearch, IconFolder, IconSettings, IconCopy, IconTrash, IconChevron } from '../icons'
import type { FolderItem, Settings, FilterGroup, SortKey } from '../types'
import { formatSize, getGroup, pushHistory, getHistory, TYPE_META, ALL_TYPES, typeMeta } from '../utils'
import { LOCALES } from '../locales'

type L = typeof LOCALES['en']

interface Props {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  L: L
}

export function CleanerPage({ settings, updateSetting, L }: Props) {
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

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
  }, [items, filterGroup, sortKey, sortDir, settings.disabledTypes])

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

  function SortTh({ k, label }: { k: SortKey; label: string }) {
    return (
      <Table.Th onClick={() => handleSort(k)} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <Group gap={4} wrap="nowrap">{label}{sortKey === k ? <IconChevron dir={sortDir === 'asc' ? 'up' : 'down'} /> : null}</Group>
      </Table.Th>
    )
  }

  return (
    <Box p="md">
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
                    data={(['all', 'js', 'rust', 'python', 'java', 'go'] as FilterGroup[])
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

      <Modal opened={settingsOpen} onClose={() => setSettingsOpen(false)} title={L.settings.scanSettingsTitle} size="md" radius="md">
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
    </Box>
  )
}
