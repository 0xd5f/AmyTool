export type Lang = 'ru' | 'en'

interface TweakTr { name: string; desc: string; cat: string }

interface L {
  tabs: { projects: string; cache: string; tweaks: string; settings: string }
  titleBar: string
  cleaner: {
    scanLabel: string
    scanPlaceholder: string
    scanTooltip: string
    browse: string
    scan: string
    scanning: string
    notFound: string
    shown: string
    selected: string
    copyPaths: string
    copied: string
    deleteBtn: string
    colType: string
    colProject: string
    colSize: string
    colPath: string
    groups: Record<string, string>
  }
  cache: {
    title: string
    subtitle: string
    refresh: string
    counting: string
    selected: string
    cleanBtn: string
    cleaned: string
    errors: string
    notFound: string
  }
  tweaks: {
    title: string
    subtitle: string
    refresh: string
    reading: string
    notLoaded: string
    load: string
    restart: string
    error: string
  }
  settings: {
    title: string
    appearance: string
    themeLabel: string
    dark: string
    light: string
    compact: string
    compactDesc: string
    general: string
    depth: string
    depthDesc: string
    autoSelect: string
    showSizes: string
    showProject: string
    confirm: string
    types: string
    enableAll: string
    disableAll: string
    language: string
    scanSettingsTitle: string
  }
  confirm: {
    title: string
    text: (count: number) => string
    textSize: (size: string) => string
    irreversible: string
    cancel: string
    deleteBtn: string
  }
  categories: Record<string, string>
  tweakTranslations: Record<string, TweakTr>
  tweakSelectOptions?: Record<string, Record<string, string>>
}

const ru: L = {
  tabs: { projects: 'Проекты', cache: 'Кеш Windows', tweaks: 'Твики', settings: 'Настройки' },
  titleBar: 'AmyTool',
  cleaner: {
    scanLabel: 'Папка для сканирования',
    scanPlaceholder: 'Выберите или введите путь...',
    scanTooltip: 'Настройки сканирования',
    browse: 'Обзор',
    scan: 'Сканировать',
    scanning: 'Сканирование...',
    notFound: 'Папки не найдены',
    shown: 'Показано',
    selected: 'Выбрано',
    copyPaths: 'Копировать пути',
    copied: 'Скопировано!',
    deleteBtn: 'Удалить',
    colType: 'Тип',
    colProject: 'Проект',
    colSize: 'Размер',
    colPath: 'Путь',
    groups: { all: 'Все', js: 'JS / TS', rust: 'Rust', python: 'Python', java: 'Java', go: 'Go' },
  },
  cache: {
    title: 'Очистка кеша Windows',
    subtitle: 'Выберите директории для очистки',
    refresh: 'Обновить размеры',
    counting: 'Подсчёт размеров...',
    selected: 'Выбрано',
    cleanBtn: 'Очистить',
    cleaned: 'Очищено директорий',
    errors: 'ошибок',
    notFound: 'не найдено',
  },
  tweaks: {
    title: 'Твики Windows',
    subtitle: 'Настройка реестра через reg.exe',
    refresh: 'Перечитать текущее состояние',
    reading: 'Чтение реестра...',
    notLoaded: 'Твики не загружены',
    load: 'Загрузить',
    restart: 'рестарт',
    error: 'Ошибка',
  },
  settings: {
    title: 'Настройки программы',
    appearance: 'Внешний вид',
    themeLabel: 'Тема интерфейса',
    dark: 'Тёмная',
    light: 'Светлая',
    compact: 'Компактный режим таблицы',
    compactDesc: 'Уменьшенные строки в таблице проектов',
    general: 'Общие',
    depth: 'Глубина сканирования',
    depthDesc: '0 — без ограничений',
    autoSelect: 'Автовыбор всех найденных',
    showSizes: 'Показывать размеры папок',
    showProject: 'Столбец «Проект»',
    confirm: 'Подтверждение перед удалением',
    types: 'Типы папок',
    enableAll: 'Все',
    disableAll: 'Снять все',
    language: 'Язык интерфейса',
    scanSettingsTitle: 'Настройки сканирования',
  },
  confirm: {
    title: 'Подтверждение удаления',
    text: (count) => `Удалить ${count} папок`,
    textSize: (size) => `, освободив ${size}`,
    irreversible: 'Это действие необратимо.',
    cancel: 'Отмена',
    deleteBtn: 'Удалить',
  },
  categories: {},
  tweakTranslations: {},
}

const en: L = {
  tabs: { projects: 'Projects', cache: 'Windows Cache', tweaks: 'Tweaks', settings: 'Settings' },
  titleBar: 'AmyTool',
  cleaner: {
    scanLabel: 'Folder to scan',
    scanPlaceholder: 'Select or type a path...',
    scanTooltip: 'Scan settings',
    browse: 'Browse',
    scan: 'Scan',
    scanning: 'Scanning...',
    notFound: 'No folders found',
    shown: 'Shown',
    selected: 'Selected',
    copyPaths: 'Copy paths',
    copied: 'Copied!',
    deleteBtn: 'Delete',
    colType: 'Type',
    colProject: 'Project',
    colSize: 'Size',
    colPath: 'Path',
    groups: { all: 'All', js: 'JS / TS', rust: 'Rust', python: 'Python', java: 'Java', go: 'Go' },
  },
  cache: {
    title: 'Windows Cache Cleaner',
    subtitle: 'Select directories to clean',
    refresh: 'Refresh sizes',
    counting: 'Calculating sizes...',
    selected: 'Selected',
    cleanBtn: 'Clean',
    cleaned: 'Directories cleaned',
    errors: 'errors',
    notFound: 'not found',
  },
  tweaks: {
    title: 'Windows Tweaks',
    subtitle: 'Registry settings via reg.exe',
    refresh: 'Reload current state',
    reading: 'Reading registry...',
    notLoaded: 'Tweaks not loaded',
    load: 'Load',
    restart: 'restart',
    error: 'Error',
  },
  settings: {
    title: 'Application settings',
    appearance: 'Appearance',
    themeLabel: 'Interface theme',
    dark: 'Dark',
    light: 'Light',
    compact: 'Compact table mode',
    compactDesc: 'Smaller rows in the projects table',
    general: 'General',
    depth: 'Scan depth',
    depthDesc: '0 — unlimited',
    autoSelect: 'Auto-select all found',
    showSizes: 'Show folder sizes',
    showProject: 'Show Project column',
    confirm: 'Confirm before deleting',
    types: 'Folder types',
    enableAll: 'All',
    disableAll: 'Deselect all',
    language: 'Interface language',
    scanSettingsTitle: 'Scan settings',
  },
  confirm: {
    title: 'Confirm deletion',
    text: (count) => `Delete ${count} folder${count !== 1 ? 's' : ''}`,
    textSize: (size) => `, freeing ${size}`,
    irreversible: 'This action is irreversible.',
    cancel: 'Cancel',
    deleteBtn: 'Delete',
  },
  categories: {
    'Проводник': 'Explorer',
    'Внешний вид': 'Appearance',
    'Производительность': 'Performance',
    'Доступность': 'Accessibility',
    'Панель задач': 'Taskbar',
    'Приватность': 'Privacy',
    'Персонализация': 'Personalization',
    'Приложения': 'Apps',
    'Win11': 'Win11',
    'Браузеры': 'Browsers',
  },
  tweakTranslations: {
    show_extensions:            { cat: 'Explorer',        name: 'Show file extensions',               desc: 'Show .exe, .txt etc. in Explorer' },
    show_hidden:                { cat: 'Explorer',        name: 'Show hidden files',                  desc: 'Show hidden and system files' },
    dark_apps:                  { cat: 'Appearance',      name: 'Dark mode for apps',                 desc: 'Use dark theme for Windows apps' },
    dark_system:                { cat: 'Appearance',      name: 'Dark mode for system',               desc: 'Dark theme for system elements (menus, taskbar)' },
    disable_animations:         { cat: 'Performance',     name: 'Disable window animations',          desc: 'Remove smooth transitions and animations for speed' },
    disable_sticky_keys:        { cat: 'Accessibility',   name: 'Disable Sticky Keys',                desc: 'Remove dialog when Shift is pressed 5 times in a row' },
    hide_cortana:               { cat: 'Taskbar',         name: 'Hide Cortana button',                desc: 'Remove Cortana button from taskbar' },
    hide_taskview:              { cat: 'Taskbar',         name: 'Hide Task View button',              desc: 'Remove Timeline / Task View button from taskbar' },
    hide_searchbox:             { cat: 'Taskbar',         name: 'Hide search bar',                    desc: 'Remove search bar from taskbar' },
    disable_bing:               { cat: 'Privacy',         name: 'Disable Bing in Start Menu',         desc: "Don't send Start Menu searches to Bing / internet" },
    disable_tips:               { cat: 'Privacy',         name: 'Disable Windows tips',               desc: "Don't show promotional tips and suggestions" },
    disable_feedback:           { cat: 'Privacy',         name: 'Disable feedback requests',          desc: "Don't show dialogs asking to rate Windows" },
    disable_ads_explorer:       { cat: 'Explorer',        name: 'Hide ads in Explorer',               desc: 'Remove cloud provider notifications in Explorer' },
    disable_snap_assist:        { cat: 'Explorer',        name: 'Disable Snap Assist',                desc: "Don't show layout options when snapping a window" },
    disable_aero_shake:         { cat: 'Explorer',        name: 'Disable Aero Shake',                 desc: 'Prevent minimizing all windows by shaking the mouse' },
    disable_balloon_tips:       { cat: 'Explorer',        name: 'Disable balloon tips',               desc: 'Hide balloon notifications in the system tray' },
    numlock_startup:            { cat: 'Accessibility',   name: 'NumLock on login',                   desc: 'Automatically enable NumLock on system login' },
    disable_game_dvr:           { cat: 'Performance',     name: 'Disable Game DVR',                   desc: 'Prevent background Xbox game recording' },
    disable_xbox_gamebar:       { cat: 'Performance',     name: 'Disable Xbox Game Bar',              desc: 'Remove Xbox Game Bar overlay (Win+G)' },
    disable_error_reporting:    { cat: 'Privacy',         name: 'Disable error reporting',            desc: "Don't send crash dumps and reports to Microsoft" },
    disable_lock_screen_ads:    { cat: 'Privacy',         name: 'Disable lock screen ads',            desc: 'Remove tips and recommendations on lock screen' },
    disable_startup_suggestions:{ cat: 'Privacy',         name: 'Disable Start Menu ads',             desc: 'Remove suggested apps from Start Menu' },
    disable_news_taskbar:       { cat: 'Taskbar',         name: 'Hide News & Interests',              desc: 'Remove widgets / news button from taskbar' },
    hide_people_bar:            { cat: 'Taskbar',         name: 'Hide People button',                 desc: 'Remove People button from taskbar (Windows 10)' },
    disable_transparency:       { cat: 'Appearance',      name: 'Disable transparency',               desc: 'Remove transparency effects from Windows UI' },
    disable_lockscreen_spotlight:{ cat: 'Appearance',     name: 'Disable Spotlight on lock screen',   desc: 'Remove promotional images on lock screen' },
    disable_tablet_mode:        { cat: 'Appearance',      name: 'Disable tablet mode',                desc: 'Prevent Windows from auto-enabling tablet mode' },
    show_full_path:             { cat: 'Explorer',        name: 'Full path in Explorer title',        desc: 'Show full folder path in the title bar' },
    disable_autoplay:           { cat: 'Explorer',        name: 'Disable AutoPlay',                   desc: "Don't auto-open drives or USB drives when connected" },
    disable_activity_history:   { cat: 'Privacy',         name: 'Disable activity history',           desc: "Don't track opened files and apps" },
    disable_tailored_experience:{ cat: 'Privacy',         name: 'Disable personalized ads',           desc: "Don't use diagnostic data for targeted ads" },
    visual_effects_performance: { cat: 'Performance',     name: 'Visual effects: performance',        desc: "Set 'Best performance' mode for visual effects" },
    disable_wallpaper_change:   { cat: 'Personalization', name: 'Disable wallpaper change',           desc: 'Prevent user from changing the desktop wallpaper' },
    disable_store_autoupdate:   { cat: 'Apps',            name: 'Disable Microsoft Store auto-update',desc: "Don't update Microsoft Store apps automatically" },
    disable_cortana_search:     { cat: 'Apps',            name: 'Disable Cortana in search',          desc: 'Disable Cortana in search (HKCU, no admin required)' },
    win11_old_context_menu:     { cat: 'Win11',           name: 'Old context menu (Win11)',            desc: 'Restore full right-click context menu in Windows 11' },
    win11_old_explorer:         { cat: 'Win11',           name: 'Explorer ribbon (Win11)',             desc: 'Restore the classic ribbon in Explorer in Windows 11' },
    win11_taskbar_left:         { cat: 'Win11',           name: 'Left-align taskbar (Win11)',          desc: 'Move the Start button and icons to the left edge' },
    edge_disable_sync:          { cat: 'Browsers',        name: 'Disable Edge sync',                  desc: 'Prevent Microsoft Edge from syncing data with your account' },
    edge_disable_telemetry:     { cat: 'Browsers',        name: 'Disable Edge telemetry',             desc: 'Prevent Edge from sending usage statistics to Microsoft' },
    edge_disable_first_run:     { cat: 'Browsers',        name: 'Disable Edge welcome screen',        desc: "Don't show the first-run experience or sign-in prompts" },
    chrome_disable_sync:        { cat: 'Browsers',        name: 'Disable Chrome sync',                desc: 'Prevent Google Chrome from syncing data with your account' },
    chrome_disable_metrics:     { cat: 'Browsers',        name: 'Disable Chrome telemetry',           desc: 'Prevent Chrome from sending usage stats to Google' },
    disable_input_switch_icon:  { cat: 'Taskbar',         name: 'Hide keyboard layout icon',          desc: 'Remove language / layout indicator from system tray' },
    disable_search_highlights:  { cat: 'Privacy',         name: 'Disable search highlights',          desc: "Remove dynamic icons and 'interesting' events in search" },
    disable_suggested_apps_lockscreen: { cat: 'Privacy',  name: 'Disable lock screen suggestions',   desc: 'Remove app suggestions on lock screen' },
    disable_cross_device_paste: { cat: 'Privacy',         name: 'Disable cross-device clipboard',     desc: "Don't sync clipboard through Microsoft cloud" },
    explorer_open_this_pc:      { cat: 'Explorer',        name: 'Open Explorer to This PC',           desc: 'Open File Explorer to This PC instead of Quick Access' },
    hide_meet_now:              { cat: 'Taskbar',         name: 'Hide Meet Now button',               desc: 'Remove the Meet Now icon from the taskbar system tray' },
    fast_context_menu:          { cat: 'Explorer',        name: 'Fast context menu',                  desc: 'Reduce context menu delay from 400ms to 1ms' },
    disable_silent_app_install: { cat: 'Privacy',         name: 'Disable silent app installs',        desc: 'Prevent Windows from silently installing promotional Store apps' },
    disable_app_suggestions_start: { cat: 'Privacy',      name: 'Disable Start Menu app suggestions', desc: 'Remove recommended app suggestions from Store in Start Menu' },
    win11_taskbar_size:         { cat: 'Win11',           name: 'Taskbar size (Win11)',                 desc: 'Change Windows 11 taskbar height: small / medium / large' },
    win11_taskbar_layout:       { cat: 'Win11',           name: 'Taskbar position (Win11)',             desc: 'Move taskbar to top or bottom of the screen' },
  },
  tweakSelectOptions: {
    win11_taskbar_size:   { '0': 'Small', '1': 'Medium', '2': 'Large' },
    win11_taskbar_layout: { top: 'Top', bottom: 'Bottom' },
  },
}

export const LOCALES: Record<Lang, L> = { ru, en }
