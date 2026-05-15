# AmyTool

Windows desktop utility for cleaning developer caches and applying system tweaks.

Built with [Wails v2](https://wails.io) (Go backend) + [React](https://react.dev) + [Mantine](https://mantine.dev) frontend.

---

## Features

### Projects — Developer Cache Cleaner
Scans a directory tree and finds build artifacts / dependency folders:

| Ecosystem | Folders detected |
|-----------|-----------------|
| JavaScript / Node | `node_modules`, `.next`, `.nuxt`, `.svelte-kit`, `.turbo`, `.parcel-cache` |
| Rust | `target/` |
| Python | `__pycache__`, `.pytest_cache`, `.mypy_cache`, `.ruff_cache`, `.venv` |
| Java / Kotlin | `.gradle`, `build/` |
| Go | build cache |

- Sortable table with project name, type badge, size, and path
- Configurable scan depth
- One-click delete with optional confirmation dialog
- Copy paths to clipboard

### Windows Cache
Bulk-clean system temp folders with one click:

- User & system `Temp` folders
- Browser caches: Chrome, Edge, Internet Explorer / Legacy Edge, Firefox (all profiles)
- Explorer thumbnail cache
- **Recycle Bin** (emptied via `Clear-RecycleBin`)

### Tweaks — Registry Optimizer
50+ HKCU registry tweaks, grouped by category. No reboot required for most.

Categories: **Explorer**, **Taskbar**, **Privacy**, **Performance**, **Appearance**, **Win11**, and more.

Highlights:
- Show file extensions & hidden files
- Dark mode for apps and system UI
- Disable telemetry, Cortana, web search in Start Menu
- Disable timeline, Activity History, Bing in Start
- Taskbar size (Small / Medium / Large) — Win11
- Taskbar position (Top / Bottom) — Win11 *(restarts Explorer)*
- Fast context menu, disable Snap Assist, Aero Shake, and more

### Settings
- Dark / Light theme
- Interface language: **Russian** / **English**
- Configurable scan depth, folder type filter
- Compact table mode
- Auto-select all found folders

---

## Build

### Prerequisites

- [Go 1.22+](https://go.dev/dl/)
- [Wails v2](https://wails.io/docs/gettingstarted/installation) — `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- [Node.js 18+](https://nodejs.org/)

### Development

```bash
wails dev
```

### Production build

```bash
wails build
```

The binary is output to `build/bin/AmyTool.exe`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go 1.22, Wails v2.12 |
| Frontend | React 18, TypeScript 5.5, Vite 5 |
| UI | Mantine v7 |
| Registry | `reg.exe` (no admin required for HKCU tweaks) |

---

## Notes

- All registry tweaks write to `HKCU` — no elevation needed
- Settings are persisted to `%APPDATA%\AmyTool\settings.json`
- Tweaks that require Explorer restart do so automatically in the background
- The app window is frameless; drag the title bar to move it
