import { useState, useEffect } from 'react'
import { Box, Group, Paper, Progress, SimpleGrid, Stack, Text } from '@mantine/core'
import type { SystemStats, PCInfo } from '../types'
import { GetSystemStats, GetPCInfo } from '../../wailsjs/go/main/App'

interface Props {
  L: {
    dashboard: {
      cpu: string
      ram: string
      disk: string
      uptime: string
      pcInfo: string
      hostname: string
      os: string
      processor: string
      gpu: string
      ramLabel: string
      bios: string
      nic: string
      loading: string
    }
  }
}

function formatBytes(b: number): string {
  if (b >= 1073741824) return (b / 1073741824).toFixed(1) + ' GB'
  if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB'
  return (b / 1024).toFixed(0) + ' KB'
}

function formatUptime(sec: number): string {
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d > 0) return `${d}д ${h}ч ${m}м`
  if (h > 0) return `${h}ч ${m}м`
  return `${m}м`
}

function barColor(pct: number): string {
  if (pct > 85) return 'red'
  if (pct > 65) return 'yellow'
  return 'blue'
}

function StatCard({ label, value, pct }: { label: string; value: string; pct?: number }) {
  return (
    <Paper p="md" radius="md" withBorder style={{ minWidth: 0 }}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>{label}</Text>
      <Text fw={700} size="lg" mb={pct != null ? 8 : 0}>{value}</Text>
      {pct != null && <Progress value={pct} color={barColor(pct)} size="sm" radius="xl" />}
    </Paper>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>{label}</Text>
      <Text size="sm" ta="right" style={{ wordBreak: 'break-word' }}>{value || '—'}</Text>
    </Group>
  )
}

export function DashboardPage({ L }: Props) {
  const D = L.dashboard
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [pcInfo, setPcInfo] = useState<PCInfo | null>(null)

  useEffect(() => {
    GetPCInfo().then(setPcInfo).catch(() => {})
    const tick = () => { GetSystemStats().then(setStats).catch(() => {}) }
    tick()
    const id = setInterval(tick, 3000)
    return () => clearInterval(id)
  }, [])

  const ramPct = stats && stats.ramTotal > 0 ? (stats.ramUsed / stats.ramTotal) * 100 : 0

  return (
    <Box p="md" style={{ height: '100%', overflowY: 'auto' }}>
      <SimpleGrid cols={2} spacing="md" mb="md">
        <StatCard
          label={D.cpu}
          value={stats ? `${stats.cpuPercent.toFixed(0)}%` : D.loading}
          pct={stats?.cpuPercent ?? 0}
        />
        <StatCard
          label={D.ram}
          value={stats ? `${formatBytes(stats.ramUsed)} / ${formatBytes(stats.ramTotal)}` : D.loading}
          pct={ramPct}
        />
      </SimpleGrid>

      {stats && stats.disks && stats.disks.length > 0 && (
        <SimpleGrid cols={Math.min(stats.disks.length, 4)} spacing="md" mb="md">
          {stats.disks.map(d => {
            const pct = d.total > 0 ? (d.used / d.total) * 100 : 0
            return (
              <StatCard
                key={d.letter}
                label={`${D.disk} ${d.letter}`}
                value={`${formatBytes(d.used)} / ${formatBytes(d.total)}`}
                pct={pct}
              />
            )
          })}
        </SimpleGrid>
      )}

      {stats && stats.uptimeSec > 0 && (
        <Box mb="md">
          <StatCard label={D.uptime} value={formatUptime(stats.uptimeSec)} />
        </Box>
      )}

      <Paper p="md" radius="md" withBorder>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={10}>{D.pcInfo}</Text>
        {pcInfo ? (
          <Stack gap={6}>
            <InfoRow label={D.hostname}  value={pcInfo.hostname}  />
            <InfoRow label={D.os}        value={pcInfo.osVersion} />
            <InfoRow label={D.processor} value={pcInfo.cpu}       />
            <InfoRow label={D.gpu}       value={pcInfo.gpu}       />
            <InfoRow label={D.ramLabel}  value={pcInfo.ramTotal}  />
            <InfoRow label={D.bios}      value={pcInfo.bios}      />
            <InfoRow label={D.nic}       value={pcInfo.nic}       />
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">{D.loading}</Text>
        )}
      </Paper>
    </Box>
  )
}