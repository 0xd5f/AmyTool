export type Lang = 'ru' | 'en'

interface TweakTr { name: string; desc: string; cat: string }

interface L {
  tabs: { dashboard: string; projects: string; cache: string; tweaks: string; settings: string; sorter: string }
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
  categories: Record<string, string>
  tweakTranslations: Record<string, TweakTr>
  tweakSelectOptions?: Record<string, Record<string, string>>
}

const ru: L = {
  tabs: { dashboard: 'Обзор', projects: 'Проекты', cache: 'Кеш Windows', tweaks: 'Твики', settings: 'Настройки', sorter: 'Сортировщик' },
  dashboard: {
    cpu: 'Процессор',
    ram: 'Память',
    disk: 'Диск',
    uptime: 'Аптайм',
    pcInfo: 'О системе',
    hostname: 'Имя компьютера',
    os: 'Операционная система',
    processor: 'Процессор',
    gpu: 'Видеокарта',
    ramLabel: 'Оперативная память',
    bios: 'BIOS',
    nic: 'Сетевой адаптер',
    loading: 'Загрузка...',
  },
  sorter: {
    title: 'Сортировщик файлов',
    selectFolder: 'Выбрать папку',
    preview: 'Предпросмотр',
    sort: 'Сортировать',
    noFolder: 'Папка не выбрана',
    noFiles: 'Нечего сортировать',
    files: 'файлов',
    errTitle: 'Ошибок',
    done: 'Готово',
    selectAll: 'Выбрать все',
    deselectAll: 'Снять все',
    willMove: 'Будет перемещено',
    moved: 'Перемещено',
    others: 'Не распознанные файлы',
    copyMode: 'Копировать',
    moveMode: 'Переместить',
    recentFolders: 'Последние папки',
  },
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
  categories: {
    'Проводник': 'Проводник',
    'Внешний вид': 'Внешний вид',
    'Производительность': 'Производительность',
    'Доступность': 'Доступность',
    'Панель задач': 'Панель задач',
    'Приватность': 'Приватность',
    'Персонализация': 'Персонализация',
    'Приложения': 'Приложения',
    'Win11': 'Win11',
    'Браузеры': 'Браузеры',
  },
  tweakTranslations: {
    show_extensions:               { cat: 'Проводник',        name: 'Показывать расширения файлов',                    desc: 'Отображать .exe, .txt и пр. в Проводнике' },
    show_hidden:                   { cat: 'Проводник',        name: 'Показывать скрытые файлы',                         desc: 'Отображать скрытые и системные файлы' },
    dark_apps:                     { cat: 'Внешний вид',      name: 'Тёмный режим приложений',                         desc: 'Использовать тёмную тему для приложений Windows' },
    dark_system:                   { cat: 'Внешний вид',      name: 'Тёмный режим системы',                            desc: 'Тёмная тема для системных элементов (меню, панель задач)' },
    disable_animations:            { cat: 'Производительность', name: 'Отключить анимации окон',                       desc: 'Убрать плавные переходы и анимации для скорости' },
    disable_sticky_keys:           { cat: 'Доступность',      name: 'Отключить залипание клавиш',                      desc: 'Убрать диалог при нажатии Shift 5 раз подряд' },
    hide_cortana:                  { cat: 'Панель задач',     name: 'Скрыть кнопку Cortana',                           desc: 'Убрать кнопку Cortana с панели задач' },
    hide_taskview:                 { cat: 'Панель задач',     name: 'Скрыть «Просмотр задач»',                         desc: 'Убрать кнопку Timeline / Task View с панели задач' },
    hide_searchbox:                { cat: 'Панель задач',     name: 'Скрыть строку поиска',                            desc: 'Убрать поисковую строку с панели задач' },
    disable_bing:                  { cat: 'Приватность',      name: 'Отключить Bing в меню «Пуск»',                    desc: 'Не отправлять поиск Start-меню в Bing/интернет' },
    disable_tips:                  { cat: 'Приватность',      name: 'Отключить советы Windows',                        desc: 'Не показывать рекламные подсказки и предложения' },
    disable_feedback:              { cat: 'Приватность',      name: 'Отключить запросы отзывов',                       desc: 'Не показывать диалоги с просьбой оценить Windows' },
    disable_ads_explorer:          { cat: 'Проводник',        name: 'Скрыть рекламу в Проводнике',                     desc: 'Убрать уведомления облачных провайдеров в Проводнике' },
    disable_snap_assist:           { cat: 'Проводник',        name: 'Отключить Snap Assist',                           desc: 'Не показывать варианты при прикреплении окна' },
    disable_aero_shake:            { cat: 'Проводник',        name: 'Отключить Aero Shake',                            desc: 'Запретить сворачивать окна встряской мыши' },
    disable_balloon_tips:          { cat: 'Проводник',        name: 'Отключить всплывающие подсказки',                 desc: 'Скрыть balloon-уведомления в системном трее' },
    numlock_startup:               { cat: 'Доступность',      name: 'NumLock при входе',                               desc: 'Автоматически включать NumLock при входе в систему' },
    disable_game_dvr:              { cat: 'Производительность', name: 'Отключить Game DVR',                            desc: 'Запретить фоновую запись игрового процесса Xbox' },
    disable_xbox_gamebar:          { cat: 'Производительность', name: 'Отключить Xbox Game Bar',                       desc: 'Убрать наложение Xbox Game Bar (Win+G)' },
    disable_error_reporting:       { cat: 'Приватность',      name: 'Отключить отчёты об ошибках',                     desc: 'Не отправлять дампы и отчёты об ошибках в Microsoft' },
    disable_lock_screen_ads:       { cat: 'Приватность',      name: 'Отключить рекламу на экране блокировки',          desc: 'Убрать подсказки и рекомендации на lock screen' },
    disable_startup_suggestions:   { cat: 'Приватность',      name: 'Отключить рекламу в «Пуске»',                    desc: 'Убрать предлагаемые приложения из меню Пуск' },
    disable_news_taskbar:          { cat: 'Панель задач',     name: 'Скрыть «Новости и интересы»',                     desc: 'Убрать кнопку виджетов/новостей с панели задач' },
    hide_people_bar:               { cat: 'Панель задач',     name: 'Скрыть кнопку «Люди»',                            desc: 'Убрать кнопку People с панели задач (Windows 10)' },
    disable_transparency:          { cat: 'Внешний вид',      name: 'Отключить прозрачность',                          desc: 'Убрать эффекты прозрачности интерфейса Windows' },
    disable_lockscreen_spotlight:  { cat: 'Внешний вид',      name: 'Отключить Spotlight на блокировке',               desc: 'Убрать рекламные изображения на экране блокировки' },
    disable_tablet_mode:           { cat: 'Внешний вид',      name: 'Отключить планшетный режим',                      desc: 'Запретить Windows автоматически включать планшетный режим' },
    show_full_path:                { cat: 'Проводник',        name: 'Полный путь в заголовке Проводника',              desc: 'Отображать полный путь к папке в строке заголовка' },
    disable_autoplay:              { cat: 'Проводник',        name: 'Отключить автозапуск',                            desc: 'Не открывать диски/флешки автоматически при подключении' },
    disable_activity_history:      { cat: 'Приватность',      name: 'Отключить журнал активности',                     desc: 'Не отслеживать открытые файлы и приложения' },
    disable_tailored_experience:   { cat: 'Приватность',      name: 'Отключить персонализированную рекламу',           desc: 'Не использовать диагностику для показа рекламы' },
    visual_effects_performance:    { cat: 'Производительность', name: 'Визуальные эффекты: производительность',        desc: 'Режим «Наилучшее быстродействие» для визуальных эффектов' },
    disable_wallpaper_change:      { cat: 'Персонализация',   name: 'Запретить смену обоев',                           desc: 'Не давать пользователю менять обои рабочего стола' },
    disable_store_autoupdate:      { cat: 'Приложения',       name: 'Отключить автообновление из Store',               desc: 'Не обновлять приложения из Microsoft Store автоматически' },
    disable_cortana_search:        { cat: 'Приложения',       name: 'Отключить Cortana в поиске',                      desc: 'Запретить поиску через Cortana (HKCU, без администратора)' },
    win11_old_context_menu:        { cat: 'Win11',            name: 'Старое контекстное меню (Win11)',                  desc: 'Восстановить полное контекстное меню с правым кликом' },
    win11_old_explorer:            { cat: 'Win11',            name: 'Лента Проводника (Win11)',                         desc: 'Вернуть классическую ленту в Проводнике Windows 11' },
    win11_taskbar_left:            { cat: 'Win11',            name: 'Выровнять панель задач по левому краю',           desc: 'Переместить кнопку Пуск и иконки к левому краю' },
    edge_disable_sync:             { cat: 'Браузеры',         name: 'Отключить синхронизацию Edge',                    desc: 'Запретить Microsoft Edge синхронизировать данные' },
    edge_disable_telemetry:        { cat: 'Браузеры',         name: 'Отключить телеметрию Edge',                       desc: 'Запретить Edge отправлять статистику в Microsoft' },
    edge_disable_first_run:        { cat: 'Браузеры',         name: 'Отключить экран приветствия Edge',                desc: 'Не показывать «первый запуск» и предложение войти' },
    chrome_disable_sync:           { cat: 'Браузеры',         name: 'Отключить синхронизацию Chrome',                  desc: 'Запретить Google Chrome синхронизировать данные' },
    chrome_disable_metrics:        { cat: 'Браузеры',         name: 'Отключить телеметрию Chrome',                     desc: 'Запретить Chrome отправлять статистику в Google' },
    disable_input_switch_icon:     { cat: 'Панель задач',     name: 'Скрыть значок раскладки клавиатуры',              desc: 'Убрать индикатор языка/раскладки из системного трея' },
    disable_search_highlights:     { cat: 'Приватность',      name: 'Отключить подсветку в поиске',                    desc: 'Убрать динамические иконки и события в поиске' },
    disable_suggested_apps_lockscreen: { cat: 'Приватность',  name: 'Отключить рекомендации на блокировке',            desc: 'Убрать предложения приложений на экране блокировки' },
    disable_cross_device_paste:    { cat: 'Приватность',      name: 'Отключить буфер обмена между устройствами',       desc: 'Не синхронизировать буфер обмена через облако Microsoft' },
    explorer_open_this_pc:         { cat: 'Проводник',        name: 'Открывать Проводник на «Этот компьютер»',         desc: 'По умолчанию Проводник открывается на «Быстрый доступ»' },
    hide_meet_now:                 { cat: 'Панель задач',     name: 'Скрыть кнопку «Встреча сейчас»',                  desc: 'Убрать иконку Meet Now из системного трея' },
    fast_context_menu:             { cat: 'Проводник',        name: 'Быстрое открытие контекстного меню',              desc: 'Уменьшить задержку перед появлением меню с 400 до 1 мс' },
    disable_silent_app_install:    { cat: 'Приватность',      name: 'Отключить тихую установку рекламных приложений',  desc: 'Запретить Windows тихо устанавливать рекламные приложения' },
    disable_app_suggestions_start: { cat: 'Приватность',      name: 'Отключить предложения приложений в «Пуске»',      desc: 'Убрать рекомендуемые приложения из Store в меню Пуск' },
    end_task_taskbar:              { cat: 'Панель задач',     name: 'Кнопка «Завершить задачу» в панели задач',        desc: 'Добавить пункт «Завершить задачу» в контекстное меню панели задач' },
    show_battery_percentage:       { cat: 'Панель задач',     name: 'Показывать процент заряда батареи',               desc: 'Отображать процент заряда прямо на значке батареи в трее' },
    disable_advertising_id:        { cat: 'Приватность',      name: 'Отключить рекламный идентификатор',               desc: 'Запретить приложениям использовать персонализированный рекламный ID' },
    disable_speech_privacy:        { cat: 'Приватность',      name: 'Отключить сбор голосовых данных',                 desc: 'Не отправлять образцы голоса в Microsoft для распознавания речи' },
    disable_ink_collection:        { cat: 'Приватность',      name: 'Отключить сбор рукописного ввода',                desc: 'Не отправлять образцы рукописного текста и контактов в Microsoft' },
    disable_bg_apps:               { cat: 'Производительность', name: 'Отключить фоновые приложения',                  desc: 'Запретить приложениям работать в фоне (глобально)' },
    disable_storage_sense:         { cat: 'Производительность', name: 'Отключить контроль памяти (Storage Sense)',      desc: 'Отключить автоматическую очистку файлов через Storage Sense' },
    disable_fso:                   { cat: 'Производительность', name: 'Отключить Full Screen Optimization',             desc: 'Отключить FSO для стабильности в полноэкранных играх' },
    scrollbars_always_visible:     { cat: 'Внешний вид',      name: 'Всегда показывать полосы прокрутки',              desc: 'Не скрывать полосы прокрутки в приложениях автоматически' },
    disable_mouse_accel:           { cat: 'Производительность', name: 'Отключить ускорение мыши',                      desc: 'Убрать «Повышение точности» указателя (акселерацию)' },
    disable_toast_notifications:   { cat: 'Приватность',      name: 'Отключить всплывающие уведомления',               desc: 'Запретить показ toast-уведомлений от приложений' },
    disable_siuf_feedback:         { cat: 'Приватность',      name: 'Отключить опросы обратной связи (SIUF)',           desc: 'Не показывать системные опросы о работе Windows' },
    win11_taskbar_size:            { cat: 'Win11',            name: 'Размер панели задач (Win11)',                      desc: 'Изменить высоту панели задач Windows 11: маленькая / средняя / большая' },
    win11_taskbar_layout:          { cat: 'Win11',            name: 'Положение панели задач (Win11)',                   desc: 'Переместить панель задач вверх или вниз экрана' },
  },
}

const en: L = {
  tabs: { dashboard: 'Overview', projects: 'Projects', cache: 'Windows Cache', tweaks: 'Tweaks', settings: 'Settings', sorter: 'Sorter' },
  dashboard: {
    cpu: 'CPU',
    ram: 'Memory',
    disk: 'Disk',
    uptime: 'Uptime',
    pcInfo: 'System Info',
    hostname: 'Computer Name',
    os: 'Operating System',
    processor: 'Processor',
    gpu: 'GPU',
    ramLabel: 'RAM',
    bios: 'BIOS',
    nic: 'Network Adapter',
    loading: 'Loading...',
  },
  sorter: {
    title: 'File Sorter',
    selectFolder: 'Select Folder',
    preview: 'Preview',
    sort: 'Sort Files',
    noFolder: 'No folder selected',
    noFiles: 'Nothing to sort',
    files: 'files',
    errTitle: 'Errors',
    done: 'Done',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    willMove: 'Will be moved',
    moved: 'Moved',
    others: 'Unrecognized files',
    copyMode: 'Copy',
    moveMode: 'Move',
    recentFolders: 'Recent folders',
  },
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
    end_task_taskbar:              { cat: 'Taskbar',         name: 'End Task in taskbar context menu',       desc: 'Add an End Task option to the taskbar right-click menu' },
    show_battery_percentage:       { cat: 'Taskbar',         name: 'Show battery percentage',                desc: 'Display battery percentage on the battery tray icon' },
    disable_advertising_id:        { cat: 'Privacy',         name: 'Disable advertising ID',                 desc: 'Prevent apps from using your personalized advertising ID' },
    disable_speech_privacy:        { cat: 'Privacy',         name: 'Disable speech data collection',         desc: "Don't send voice samples to Microsoft for speech recognition" },
    disable_ink_collection:        { cat: 'Privacy',         name: 'Disable ink and typing collection',      desc: "Don't send handwriting samples and contacts to Microsoft" },
    disable_bg_apps:               { cat: 'Performance',     name: 'Disable background apps',                desc: 'Prevent apps from running in the background (globally)' },
    disable_storage_sense:         { cat: 'Performance',     name: 'Disable Storage Sense',                  desc: 'Disable automatic file cleanup through Storage Sense' },
    disable_fso:                   { cat: 'Performance',     name: 'Disable Full Screen Optimization',       desc: 'Disable FSO for better stability in fullscreen games' },
    scrollbars_always_visible:     { cat: 'Appearance',      name: 'Always show scrollbars',                 desc: "Don't automatically hide scrollbars in apps" },
    disable_mouse_accel:           { cat: 'Performance',     name: 'Disable mouse acceleration',             desc: "Remove 'Enhance pointer precision' (pointer acceleration)" },
    disable_toast_notifications:   { cat: 'Privacy',         name: 'Disable toast notifications',            desc: 'Prevent apps from showing toast (pop-up) notifications' },
    disable_siuf_feedback:         { cat: 'Privacy',         name: 'Disable SIUF feedback surveys',          desc: "Don't show system feedback surveys about Windows" },
    win11_taskbar_size:         { cat: 'Win11',           name: 'Taskbar size (Win11)',                 desc: 'Change Windows 11 taskbar height: small / medium / large' },
    win11_taskbar_layout:       { cat: 'Win11',           name: 'Taskbar position (Win11)',             desc: 'Move taskbar to top or bottom of the screen' },
  },
  tweakSelectOptions: {
    win11_taskbar_size:   { '0': 'Small', '1': 'Medium', '2': 'Large' },
    win11_taskbar_layout: { top: 'Top', bottom: 'Bottom' },
  },
}

export const LOCALES: Record<Lang, L> = { ru, en }
