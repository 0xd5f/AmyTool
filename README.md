# AmyTool

> **v0.1.1**

Windows desktop utility for cleaning developer caches, sorting files, and applying system tweaks.

Built with [Wails v2](https://wails.io) (Go backend) + [React](https://react.dev) + [Mantine](https://mantine.dev) frontend.

---

## Features

### Dashboard
Real-time system overview on launch:

- CPU model, RAM (used / total), disk usage per drive
- OS version, motherboard, BIOS info
- All data collected via PowerShell CIM — no WMI/wmic dependency

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

### Sorter — File Organiser
Sort a folder's files into subfolders by type in one click:

| Category | Extensions |
|----------|-----------|
| Archives | zip, rar, 7z, tar, gz, … |
| Music | mp3, flac, wav, ogg, … |
| Video | mp4, mkv, avi, mov, … |
| Photos | jpg, jpeg, png, gif, … |
| Images | svg, ico, webp, psd, ai, … |
| Docs | pdf, doc, docx, xls, xlsx, … |
| Apps | exe, msi, appx, … |
| Others | everything else |

- Preview before sorting: file count + total size per category
- Select / deselect categories with checkboxes
- **Copy** or **Move** mode
- Folder history (last 5 used paths)

### Tweaks — Registry Optimizer
HKCU registry tweaks, grouped by category. No reboot required for most.

#### 🗂 Проводник (Explorer)
| Твик | Описание |
|------|----------|
| Показывать расширения файлов | Отображать .exe, .txt и пр. в Проводнике |
| Показывать скрытые файлы | Отображать скрытые и системные файлы |
| Открывать Проводник на «Этот компьютер» | По умолчанию вместо «Быстрый доступ» |
| Полный путь в заголовке Проводника | Показывать полный путь в строке заголовка |
| Быстрое открытие контекстного меню | Задержка 0 мс вместо 400 мс |
| Отключить Snap Assist | Не показывать варианты при прикреплении окна |
| Отключить Aero Shake | Запретить сворачивать окна встряской мыши |
| Отключить автозапуск | Не открывать диски/флешки автоматически |
| Отключить всплывающие подсказки | Скрыть balloon-уведомления в трее |
| Скрыть рекламу в Проводнике | Убрать уведомления облачных провайдеров |

#### 🖥 Внешний вид (Appearance)
| Твик | Описание |
|------|----------|
| Тёмный режим приложений | Тёмная тема для приложений Windows |
| Тёмный режим системы | Тёмная тема для системных элементов |
| Отключить прозрачность | Убрать эффекты прозрачности интерфейса |
| Отключить анимации окон | Убрать плавные переходы для скорости |
| Визуальные эффекты: производительность | Режим «наилучшее быстродействие» |
| Отключить Spotlight на блокировке | Убрать рекламные изображения на lock screen |
| Отключить планшетный режим | Запретить автовключение планшетного режима |

#### 📌 Панель задач (Taskbar)
| Твик | Описание |
|------|----------|
| Размер панели задач (Win11) | Маленький / Средний / Большой |
| Положение панели задач (Win11) | Сверху / Снизу |
| Выровнять по левому краю (Win11) | Кнопка Пуск и иконки — к левому краю |
| Скрыть кнопку Cortana | Убрать кнопку Cortana с панели задач |
| Скрыть «Просмотр задач» | Убрать кнопку Timeline / Task View |
| Скрыть строку поиска | Убрать поисковую строку с панели задач |
| Скрыть «Новости и интересы» | Убрать кнопку виджетов/новостей |
| Скрыть кнопку «Люди» | Убрать People с панели задач (Win10) |
| Скрыть кнопку «Встреча сейчас» | Убрать Meet Now из системного трея |
| Скрыть значок раскладки клавиатуры | Убрать индикатор языка из трея |

#### 🔒 Приватность (Privacy)
| Твик | Описание |
|------|----------|
| Отключить Bing в меню «Пуск» | Не отправлять поиск в интернет |
| Отключить советы Windows | Не показывать рекламные подсказки |
| Отключить запросы отзывов | Не показывать диалоги оценки Windows |
| Отключить отчёты об ошибках | Не отправлять дампы в Microsoft |
| Отключить рекламу на экране блокировки | Убрать подсказки на lock screen |
| Отключить рекламу в «Пуске» | Убрать предлагаемые приложения из Пуска |
| Отключить журнал активности | Не отслеживать открытые файлы |
| Отключить персонализированную рекламу | Не использовать диагностику для рекламы |
| Отключить подсветку в поиске | Убрать динамические события в поиске |
| Отключить «рекомендуемые» на блокировке | Убрать предложения приложений на lock screen |
| Отключить буфер обмена между устройствами | Не синхронизировать буфер через облако |
| Отключить тихую установку приложений | Запретить тихую установку рекламных app из Store |
| Отключить предложения приложений в Пуске | Убрать рекомендации из Store в Пуске |

#### ⚡ Производительность (Performance)
| Твик | Описание |
|------|----------|
| Отключить Game DVR | Запретить фоновую запись Xbox |
| Отключить Xbox Game Bar | Убрать наложение Win+G |

#### 🌐 Браузеры (Browsers)
| Твик | Описание |
|------|----------|
| Отключить синхронизацию Edge | Запретить Edge синхронизировать данные |
| Отключить телеметрию Edge | Не отправлять статистику в Microsoft |
| Отключить экран приветствия Edge | Убрать «первый запуск» Edge |
| Отключить синхронизацию Chrome | Запретить Chrome синхронизировать данные |
| Отключить телеметрию Chrome | Не отправлять статистику в Google |

#### 🔧 Доступность и прочее
| Твик | Описание |
|------|----------|
| Отключить залипание клавиш | Убрать диалог при 5× нажатии Shift |
| NumLock при входе | Включать NumLock автоматически |
| Отключить автообновление Microsoft Store | Не обновлять приложения автоматически |
| Отключить Cortana в поиске | Запретить поиск через Cortana |

#### 🪟 Win11
| Твик | Описание |
|------|----------|
| Старое контекстное меню | Вернуть полное меню правого клика |
| Лента Проводника | Вернуть классическую ленту вместо нового тулбара |

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

---

## Changelog

### v0.1.1
- Added **Sorter** tab — sort files into subfolders by type (copy or move, preview with sizes, folder history)
- Dashboard now uses PowerShell CIM instead of deprecated `wmic`
- Fixed `disable_animations` tweak: also disables taskbar animations (`TaskbarAnimations`)
- Fixed `win11_old_context_menu` / `win11_old_explorer` disable: now correctly deletes the parent CLSID key
- Fixed `disable_xbox_gamebar`: removed unnecessary Explorer restart
- Fixed `fast_context_menu`: delay now 0 ms (was 1 ms)

### v0.1.0
- Initial release
