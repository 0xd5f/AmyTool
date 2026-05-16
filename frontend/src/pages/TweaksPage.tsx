import { useState, useEffect, useMemo } from 'react'
import { ActionIcon, Badge, Box, Button, Center, Group, Loader, Paper, Select, Stack, Switch, Text, Tooltip } from '@mantine/core'
import { GetTweaks, ApplyTweak, ApplySelectTweak } from '../../wailsjs/go/main/App'
import { IconRefresh } from '../icons'
import type { Tweak } from '../types'
import { LOCALES } from '../locales'

type L = typeof LOCALES['en']

interface Props { L: L }

export function TweaksPage({ L }: Props) {
  const [tweaks, setTweaks] = useState<Tweak[]>([])
  const [tweaksLoading, setTweaksLoading] = useState(false)
  const [tweakErrors, setTweakErrors] = useState<Record<string, string>>({})
  const [tweakSelectValues, setTweakSelectValues] = useState<Record<string, string>>({})

  useEffect(() => { loadTweaks() }, [])

  async function loadTweaks() {
    setTweaksLoading(true)
    setTweakErrors({})
    try {
      const data = (await GetTweaks() ?? []) as Tweak[]
      setTweaks(data)
      const initVals: Record<string, string> = {}
      for (const t of data) if (t.kind === 'select' && t.currentValue) initVals[t.id] = t.currentValue
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

  const tweaksByCategory = useMemo(() => {
    const map = new Map<string, Tweak[]>()
    for (const t of tweaks) {
      if (!map.has(t.category)) map.set(t.category, [])
      map.get(t.category)!.push(t)
    }
    return map
  }, [tweaks])

  return (
    <Box p="md">
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
            {Array.from(tweaksByCategory.entries()).map(([cat, items]) => (
              <div key={cat}>
                <Text fw={600} size="sm" c="dimmed" tt="uppercase" mb="xs" style={{ letterSpacing: 1 }}>{L.categories[cat] ?? cat}</Text>
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
                              data={(tweak.options ?? []).map(o => ({
                                value: o.value,
                                label: L.tweakSelectOptions?.[tweak.id]?.[o.value] ?? o.label,
                              }))}
                              allowDeselect={false}
                            />
                          ) : (
                            <Switch checked={tweak.enabled} onChange={e => handleTweakToggle(tweak.id, e.currentTarget.checked)} color="blue" />
                          )}
                        </Group>
                      </Paper>
                    )
                  })}
                </Stack>
              </div>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
