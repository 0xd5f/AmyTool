import { useState, useEffect } from 'react'
import { ActionIcon, Box, MantineProvider, Text, Tooltip } from '@mantine/core'
import { LOCALES } from './locales'
import { LoadSettings } from '../wailsjs/go/main/App'
import { WindowMinimise, WindowToggleMaximise, Quit } from '../wailsjs/runtime/runtime'
import { loadSettings, saveSettings } from './utils'
import type { Settings } from './types'
import { IconMinus, IconSquare, IconX, IconFolder, IconBroom, IconToggle, IconSettings, IconChevronLeft, IconChevronRight, IconDashboard, IconSort } from './icons'
import { DashboardPage } from './pages/DashboardPage'
import { CleanerPage } from './pages/CleanerPage'
import { CachePage } from './pages/CachePage'
import { TweaksPage } from './pages/TweaksPage'
import { SorterPage } from './pages/SorterPage'
import { SettingsPage } from './pages/SettingsPage'

type Tab = 'dashboard' | 'cleaner' | 'cache' | 'tweaks' | 'settings' | 'sorter'

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const L = LOCALES[settings.lang]

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      saveSettings(next)
      return next
    })
  }

  useEffect(() => {
    LoadSettings().then((raw: string) => {
      if (raw) {
        try { setSettings(prev => ({ ...prev, ...JSON.parse(raw) })) } catch {}
      }
    }).catch(() => {})
  }, [])

  const titleBarStyle = { '--wails-draggable': 'drag', userSelect: 'none' as const }
  const noDrag = { '--wails-draggable': 'no-drag' } as React.CSSProperties

  const navItems = [
    { value: 'dashboard' as Tab, icon: <IconDashboard />, label: L.tabs.dashboard },
    { value: 'cache'    as Tab, icon: <IconBroom />,    label: L.tabs.cache     },
    { value: 'cleaner'  as Tab, icon: <IconFolder />,   label: L.tabs.projects  },
    { value: 'sorter'   as Tab, icon: <IconSort />,     label: L.tabs.sorter    },
    { value: 'tweaks'   as Tab, icon: <IconToggle />,   label: L.tabs.tweaks    },
    { value: 'settings' as Tab, icon: <IconSettings />, label: L.tabs.settings  },
  ]

  return (
    <MantineProvider forceColorScheme={settings.colorScheme}>
      <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        <Box h={40} px="sm" style={{
          ...titleBarStyle,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--mantine-color-default-border)',
          flexShrink: 0, background: 'var(--mantine-color-dark-8)',
        } as React.CSSProperties}>
          <Text size="sm" fw={600} c="dimmed" style={noDrag}>AmyTool</Text>
          <div style={noDrag}>
            <ActionIcon variant="subtle" size="sm" onClick={WindowMinimise}><IconMinus /></ActionIcon>
            <ActionIcon variant="subtle" size="sm" onClick={WindowToggleMaximise}><IconSquare /></ActionIcon>
            <ActionIcon variant="subtle" size="sm" color="red" onClick={Quit}><IconX /></ActionIcon>
          </div>
        </Box>

        <Box style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

          <Box style={{
            width: sidebarCollapsed ? 56 : 200,
            transition: 'width 200ms ease',
            flexShrink: 0, display: 'flex', flexDirection: 'column',
            borderRight: '1px solid var(--mantine-color-default-border)',
            background: 'var(--mantine-color-dark-8)', overflow: 'hidden',
          }}>
            <Box style={{ flex: 1, paddingTop: 8 }}>
              {navItems.map(item => {
                const isActive = activeTab === item.value
                return (
                  <Tooltip key={item.value} label={item.label} position="right" withArrow disabled={!sidebarCollapsed}>
                    <Box
                      onClick={() => setActiveTab(item.value)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        gap: 10, padding: sidebarCollapsed ? '9px 0' : '9px 14px',
                        borderRadius: 6, margin: '2px 6px', cursor: 'pointer',
                        background: isActive ? 'var(--mantine-color-dark-5)' : 'transparent',
                        color: isActive ? 'var(--mantine-color-white)' : 'var(--mantine-color-dimmed)',
                        transition: 'background 120ms, color 120ms',
                        whiteSpace: 'nowrap', overflow: 'hidden',
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--mantine-color-dark-6)' }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <Box style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 18 }}>{item.icon}</Box>
                      {!sidebarCollapsed && <Text size="sm" fw={isActive ? 600 : 400} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</Text>}
                    </Box>
                  </Tooltip>
                )
              })}
            </Box>

            <Box style={{ borderTop: '1px solid var(--mantine-color-default-border)', padding: '6px' }}>
              <Box
                onClick={() => setSidebarCollapsed(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  gap: 10, padding: sidebarCollapsed ? '8px 0' : '8px 14px',
                  borderRadius: 6, cursor: 'pointer',
                  color: 'var(--mantine-color-dimmed)',
                  transition: 'background 120ms',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--mantine-color-dark-6)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <Box style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 18 }}>
                  {sidebarCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
                </Box>
                {!sidebarCollapsed && <Text size="sm">Свернуть</Text>}
              </Box>
            </Box>
          </Box>

          <Box style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 'dashboard' && <DashboardPage L={L} />}
            {activeTab === 'cleaner'  && <CleanerPage  settings={settings} updateSetting={updateSetting} L={L} />}
            {activeTab === 'cache'    && <CachePage    L={L} />}
            {activeTab === 'tweaks'   && <TweaksPage   L={L} />}
            {activeTab === 'sorter'   && <SorterPage   L={L} />}
            {activeTab === 'settings' && <SettingsPage settings={settings} updateSetting={updateSetting} L={L} />}
          </Box>
        </Box>
      </Box>
    </MantineProvider>
  )
}
