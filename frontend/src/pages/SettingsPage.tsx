import { Anchor, Box, Button, Divider, Group, Paper, Stack, Switch, Text } from '@mantine/core'
import { IconMoon, IconSun } from '../icons'
import type { Settings } from '../types'
import { LOCALES } from '../locales'

type L = typeof LOCALES['en']

interface Props {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  L: L
}

export function SettingsPage({ settings, updateSetting, L }: Props) {
  return (
    <Box p="md">
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
              <Switch checked={settings.compactTable} onChange={e => updateSetting('compactTable', e.currentTarget.checked)} color="blue" />
            </Group>
          </Stack>
        </Paper>

        <Paper withBorder p="md">
          <Stack gap="md">
            <Text size="sm" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>{L.settings.language}</Text>
            <Group gap="xs" grow>
              <Button variant={settings.lang === 'ru' ? 'filled' : 'default'} onClick={() => updateSetting('lang', 'ru')}>Русский</Button>
              <Button variant={settings.lang === 'en' ? 'filled' : 'default'} onClick={() => updateSetting('lang', 'en')}>English</Button>
            </Group>
          </Stack>
        </Paper>

        <Group justify="space-between" align="center">
          <Anchor href="https://t.me/Oxd5f" target="_blank" size="sm" c="dimmed">Telegram: @Oxd5f</Anchor>
          <Text size="xs" c="dimmed">v0.1.1</Text>
        </Group>
      </Stack>
    </Box>
  )
}
