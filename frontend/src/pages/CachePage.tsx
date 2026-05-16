import { useState, useEffect } from 'react'
import { Alert, Badge, Box, Button, Center, Checkbox, Group, Loader, Paper, Stack, Text, Tooltip } from '@mantine/core'
import { GetWindowsCacheTargets, CleanCacheTargets } from '../../wailsjs/go/main/App'
import { IconBroom, IconRefresh } from '../icons'
import type { CacheTarget } from '../types'
import { formatSize } from '../utils'
import { LOCALES } from '../locales'

type L = typeof LOCALES['en']

interface Props { L: L }

export function CachePage({ L }: Props) {
  const [cacheTargets, setCacheTargets] = useState<CacheTarget[]>([])
  const [cacheSelected, setCacheSelected] = useState<Set<string>>(new Set())
  const [cacheLoading, setCacheLoading] = useState(false)
  const [cacheCleaning, setCacheCleaning] = useState(false)
  const [cacheResult, setCacheResult] = useState<{ cleaned: number; errors: number } | null>(null)

  useEffect(() => { loadCacheTargets() }, [])

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

  const cacheSelectedSize = cacheTargets.filter(t => cacheSelected.has(t.path)).reduce((a, t) => a + t.size, 0)

  return (
    <Box p="md">
      <Stack gap="md" maw={900} mx="auto">
        <Group justify="space-between" align="center">
          <div>
            <Text fw={600} size="lg">{L.cache.title}</Text>
            <Text size="sm" c="dimmed">{L.cache.subtitle}</Text>
          </div>
          <Tooltip label={L.cache.refresh}>
            <Button variant="default" leftSection={<IconRefresh />} onClick={loadCacheTargets} loading={cacheLoading} size="sm">{L.cache.refresh}</Button>
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
    </Box>
  )
}
