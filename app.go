package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func hideCmd(name string, args ...string) *exec.Cmd {
	cmd := exec.Command(name, args...)
	cmd.SysProcAttr = &syscall.SysProcAttr{CreationFlags: 0x08000000}
	return cmd
}

type FolderItem struct {
	Path        string `json:"path"`
	Type        string `json:"type"`
	ProjectName string `json:"projectName"`
	Size        int64  `json:"size"`
	SizeFmt     string `json:"sizeFmt"`
}

type CacheTarget struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Size    int64  `json:"size"`
	SizeFmt string `json:"sizeFmt"`
	Exists  bool   `json:"exists"`
}

type TweakOption struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

type Tweak struct {
	ID              string        `json:"id"`
	Name            string        `json:"name"`
	Description     string        `json:"description"`
	Category        string        `json:"category"`
	Enabled         bool          `json:"enabled"`
	RequiresRestart bool          `json:"requiresRestart"`
	Kind            string        `json:"kind"`
	Options         []TweakOption `json:"options,omitempty"`
	CurrentValue    string        `json:"currentValue,omitempty"`
}

type selectTweakDef struct {
	id, name, desc, category string
	key, valueName           string
	vtype                    string
	requiresRestart          bool
	defaultValue             string
	options                  []TweakOption
}

var selectTweakDefs = []selectTweakDef{
	{
		id: "win11_taskbar_size", name: "Размер панели задач (Win11)",
		desc:      "Изменить высоту панели задач Windows 11: маленькая / средняя / большая",
		category:  "Win11",
		key:       `HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`,
		valueName: "TaskbarSi", vtype: "REG_DWORD",
		requiresRestart: true, defaultValue: "1",
		options: []TweakOption{
			{Label: "Маленькая", Value: "0"},
			{Label: "Средняя", Value: "1"},
			{Label: "Большая", Value: "2"},
		},
	},
	{
		id: "win11_taskbar_layout", name: "Положение панели задач (Win11)",
		desc:            "Переместить панель задач вверх или вниз экрана",
		category:        "Win11",
		requiresRestart: true, defaultValue: "bottom",
		options: []TweakOption{
			{Label: "Вверху", Value: "top"},
			{Label: "Внизу", Value: "bottom"},
		},
	},
}

type tweakDef struct {
	id, name, desc, category string
	key, valueName           string
	enabledVal, disabledVal  string
	vtype                    string
	requiresRestart          bool
	keyOnly                  bool
}

var tweakDefs = []tweakDef{
	{"show_extensions", "Показывать расширения файлов", "Отображать .exe, .txt и пр. в Проводнике", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "HideFileExt", "0", "1", "REG_DWORD", false, false},
	{"show_hidden", "Показывать скрытые файлы", "Отображать скрытые и системные файлы", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "Hidden", "1", "2", "REG_DWORD", false, false},
	{"dark_apps", "Тёмный режим приложений", "Использовать тёмную тему для приложений Windows", "Внешний вид",
		`HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize`, "AppsUseLightTheme", "0", "1", "REG_DWORD", false, false},
	{"dark_system", "Тёмный режим системы", "Тёмная тема для системных элементов (меню, панель задач)", "Внешний вид",
		`HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize`, "SystemUsesLightTheme", "0", "1", "REG_DWORD", false, false},
	{"disable_animations", "Отключить анимации окон", "Убрать плавные переходы и анимации для скорости", "Производительность",
		`HKCU\Control Panel\Desktop\WindowMetrics`, "MinAnimate", "0", "1", "REG_SZ", false, false},
	{"disable_sticky_keys", "Отключить залипание клавиш", "Убрать диалог при нажатии Shift 5 раз подряд", "Доступность",
		`HKCU\Control Panel\Accessibility\StickyKeys`, "Flags", "506", "510", "REG_SZ", false, false},
	{"hide_cortana", "Скрыть кнопку Cortana", "Убрать кнопку Cortana с панели задач", "Панель задач",
		`HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "ShowCortanaButton", "0", "1", "REG_DWORD", false, false},
	{"hide_taskview", "Скрыть «Просмотр задач»", "Убрать кнопку Timeline / Task View с панели задач", "Панель задач",
		`HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "ShowTaskViewButton", "0", "1", "REG_DWORD", false, false},
	{"hide_searchbox", "Скрыть строку поиска", "Убрать поисковую строку с панели задач", "Панель задач",
		`HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Search`, "SearchboxTaskbarMode", "0", "2", "REG_DWORD", false, false},
	{"disable_bing", "Отключить Bing в меню «Пуск»", "Не отправлять поиск Start-меню в Bing/интернет", "Приватность",
		`HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Search`, "BingSearchEnabled", "0", "1", "REG_DWORD", false, false},
	{"disable_tips", "Отключить советы Windows", "Не показывать рекламные подсказки и предложения", "Приватность",
		`HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "SubscribedContent-338389Enabled", "0", "1", "REG_DWORD", false, false},
	{"disable_feedback", "Отключить запросы отзывов", "Не показывать диалоги с просьбой оценить Windows", "Приватность",
		`HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "SubscribedContent-338387Enabled", "0", "1", "REG_DWORD", false, false},
	{"disable_ads_explorer", "Скрыть рекламу в Проводнике", "Убрать уведомления облачных провайдеров в Проводнике", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "ShowSyncProviderNotifications", "0", "1", "REG_DWORD", false, false},
	{"disable_snap_assist", "Отключить Snap Assist", "Не показывать варианты при прикреплении окна", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "SnapAssist", "0", "1", "REG_DWORD", false, false},
	{"disable_aero_shake", "Отключить Aero Shake", "Запретить сворачивать окна встряской мыши", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "DisallowShaking", "1", "0", "REG_DWORD", false, false},
	{"disable_balloon_tips", "Отключить всплывающие подсказки", "Скрыть balloon-уведомления в системном трее", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "EnableBalloonTips", "0", "1", "REG_DWORD", false, false},
	{"numlock_startup", "NumLock при входе", "Автоматически включать NumLock при входе в систему", "Доступность",
		`HKCU\Control Panel\Keyboard`, "InitialKeyboardIndicators", "2", "0", "REG_SZ", false, false},
	{"disable_game_dvr", "Отключить Game DVR", "Запретить фоновую запись игрового процесса Xbox", "Производительность",
		`HKCU\System\GameConfigStore`, "GameDVR_Enabled", "0", "1", "REG_DWORD", false, false},
	{"disable_xbox_gamebar", "Отключить Xbox Game Bar", "Убрать наложение Xbox Game Bar (Win+G)", "Производительность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\GameDVR`, "AppCaptureEnabled", "0", "1", "REG_DWORD", true, false},
	{"disable_error_reporting", "Отключить отчёты об ошибках", "Не отправлять дампы и отчёты об ошибках в Microsoft", "Приватность",
		`HKCU\Software\Microsoft\Windows\Windows Error Reporting`, "Disabled", "1", "0", "REG_DWORD", false, false},
	{"disable_lock_screen_ads", "Отключить рекламу на экране блокировки", "Убрать подсказки и рекомендации на lock screen", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "RotatingLockScreenOverlayEnabled", "0", "1", "REG_DWORD", false, false},
	{"disable_startup_suggestions", "Отключить рекламу в «Пуске»", "Убрать предлагаемые приложения из меню Пуск", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "SystemPaneSuggestionsEnabled", "0", "1", "REG_DWORD", false, false},
	{"disable_news_taskbar", "Скрыть «Новости и интересы»", "Убрать кнопку виджетов/новостей с панели задач", "Панель задач",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Feeds`, "ShellFeedsTaskbarViewMode", "2", "0", "REG_DWORD", false, false},
	{"hide_people_bar", "Скрыть кнопку «Люди»", "Убрать кнопку People с панели задач (Windows 10)", "Панель задач",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\People`, "PeopleBand", "0", "1", "REG_DWORD", false, false},
	{"disable_transparency", "Отключить прозрачность", "Убрать эффекты прозрачности интерфейса Windows", "Внешний вид",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize`, "EnableTransparency", "0", "1", "REG_DWORD", false, false},
	{"disable_lockscreen_spotlight", "Отключить Spotlight на блокировке", "Убрать рекламные изображения на экране блокировки", "Внешний вид",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "RotatingLockScreenEnabled", "0", "1", "REG_DWORD", false, false},
	{"disable_tablet_mode", "Отключить планшетный режим", "Запретить Windows автоматически включать планшетный режим", "Внешний вид",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\ImmersiveShell`, "TabletMode", "0", "1", "REG_DWORD", false, false},
	{"show_full_path", "Полный путь в заголовке Проводника", "Отображать полный путь к папке в строке заголовка", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\CabinetState`, "FullPath", "1", "0", "REG_DWORD", false, false},
	{"disable_autoplay", "Отключить автозапуск", "Не открывать диски/флешки автоматически при подключении", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\AutoplayHandlers`, "DisableAutoplay", "1", "0", "REG_DWORD", false, false},
	{"disable_activity_history", "Отключить журнал активности", "Не отслеживать открытые файлы и приложения", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Privacy`, "PublishUserActivities", "0", "1", "REG_DWORD", false, false},
	{"disable_tailored_experience", "Отключить персонализированную рекламу", "Не использовать диагностику для показа рекламы", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Privacy`, "TailoredExperiencesWithDiagnosticDataEnabled", "0", "1", "REG_DWORD", false, false},
	{"visual_effects_performance", "Визуальные эффекты: производительность", "Режим «Обеспечить наилучшее быстродействие» для визуальных эффектов", "Производительность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects`, "VisualFXSetting", "2", "0", "REG_DWORD", false, false},
	{"disable_wallpaper_change", "Запретить смену обоев", "Не давать пользователю менять обои рабочего стола", "Персонализация",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\ActiveDesktop`, "NoChangingWallPaper", "1", "0", "REG_DWORD", false, false},
	{"disable_store_autoupdate", "Отключить автообновление аппов Microsoft Store", "Не обновлять приложения из Microsoft Store автоматически", "Приложения",
		`HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "AutoUpdateAppsEnabled", "0", "1", "REG_DWORD", false, false},
	{"disable_cortana_search", "Отключить Cortana в поиске", "Запретить поиску через Cortana (HKCU, без администратора)", "Приложения",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Search`, "CanCortanaBeEnabled", "0", "1", "REG_DWORD", false, false},
	{"win11_old_context_menu", "Старое контекстное меню (Win11)", "Восстановить полное контекстное меню с правым кликом (Windows 11)", "Win11",
		`HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32`, "", "", "", "", true, true},
	{"win11_old_explorer", "Лента Проводника (Win11)", "Вернуть классическую ленту в Проводнике вместо нового панельного тулбара", "Win11",
		`HKCU\Software\Classes\CLSID\{d93ed569-3b3e-4bff-8355-3c44f6a52bb5}\InprocServer32`, "", "", "", "", true, true},
	{"win11_taskbar_left", "Выровнять панель задач по левому краю (Win11)", "Переместить кнопку Пуск и иконки к левому краю панели задач", "Win11",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "TaskbarAl", "0", "1", "REG_DWORD", true, false},
	{"edge_disable_sync", "Отключить синхронизацию Edge", "Запретить Microsoft Edge синхронизировать данные с аккаунтом", "Браузеры",
		`HKCU\Software\Policies\Microsoft\Edge`, "SyncDisabled", "1", "0", "REG_DWORD", false, false},
	{"edge_disable_telemetry", "Отключить телеметрию Edge", "Запретить Edge отправлять статистику использования в Microsoft", "Браузеры",
		`HKCU\Software\Policies\Microsoft\Edge`, "MetricsReportingEnabled", "0", "1", "REG_DWORD", false, false},
	{"edge_disable_first_run", "Отключить экран приветствия Edge", "Не показывать «первый запуск» и предложение войти в аккаунт", "Браузеры",
		`HKCU\Software\Policies\Microsoft\Edge`, "HideFirstRunExperience", "1", "0", "REG_DWORD", false, false},
	{"chrome_disable_sync", "Отключить синхронизацию Chrome", "Запретить Google Chrome синхронизировать данные с аккаунтом", "Браузеры",
		`HKCU\Software\Policies\Google\Chrome`, "SyncDisabled", "1", "0", "REG_DWORD", false, false},
	{"chrome_disable_metrics", "Отключить телеметрию Chrome", "Запретить Chrome отправлять статистику использования в Google", "Браузеры",
		`HKCU\Software\Policies\Google\Chrome`, "MetricsReportingEnabled", "0", "1", "REG_DWORD", false, false},
	{"disable_input_switch_icon", "Скрыть значок раскладки клавиатуры", "Убрать индикатор языка/раскладки из системного трея", "Панель задач",
		`HKCU\Software\Microsoft\CTF\LangBar`, "ShowStatus", "3", "4", "REG_DWORD", false, false},
	{"disable_search_highlights", "Отключить подсветку в поиске", "Убрать динамические иконки и «интересные» события в поиске", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Feeds\DSB`, "ShowDynamicContent", "0", "1", "REG_DWORD", false, false},
	{"disable_suggested_apps_lockscreen", "Отключить «рекомендуемые» на экране блокировки", "Убрать предложения приложений на экране блокировки", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "SubscribedContent-353694Enabled", "0", "1", "REG_DWORD", false, false},
	{"disable_cross_device_paste", "Отключить буфер обмена между устройствами", "Не синхронизировать буфер обмена через облако Microsoft", "Приватность",
		`HKCU\Software\Microsoft\Clipboard`, "EnableClipboardHistory", "0", "1", "REG_DWORD", false, false},
	{"explorer_open_this_pc", "Открывать Проводник на «Этот компьютер»", "По умолчанию Проводник открывается на «Быстрый доступ» — этот твик переключает на «Этот компьютер»", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "LaunchTo", "1", "2", "REG_DWORD", false, false},
	{"hide_meet_now", "Скрыть кнопку «Встреча сейчас»", "Убрать иконку Meet Now из системного трея панели задач", "Панель задач",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer`, "HideSCAMeetNow", "1", "0", "REG_DWORD", false, false},
	{"fast_context_menu", "Быстрое открытие контекстного меню", "Уменьшить задержку перед появлением контекстного меню со 400 до 1 мс", "Проводник",
		`HKCU\Control Panel\Desktop`, "MenuShowDelay", "1", "400", "REG_SZ", false, false},
	{"disable_silent_app_install", "Отключить тихую установку рекламных приложений", "Запретить Windows тихо устанавливать рекламные приложения из Store без ведома пользователя", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "SilentInstalledAppsEnabled", "0", "1", "REG_DWORD", false, false},
	{"disable_app_suggestions_start", "Отключить предложения приложений в меню Пуск", "Убрать рекомендуемые приложения из Store в меню Пуск", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "SubscribedContent-338388Enabled", "0", "1", "REG_DWORD", false, false},
}

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) settingsFilePath() string {
	dir, err := os.UserConfigDir()
	if err != nil {
		return ""
	}
	return filepath.Join(dir, "AmyTool", "settings.json")
}

func (a *App) LoadSettings() string {
	p := a.settingsFilePath()
	if p == "" {
		return ""
	}
	data, err := os.ReadFile(p)
	if err != nil {
		return ""
	}
	return string(data)
}

func (a *App) SaveSettings(data string) {
	p := a.settingsFilePath()
	if p == "" {
		return
	}
	os.MkdirAll(filepath.Dir(p), 0755)
	os.WriteFile(p, []byte(data), 0644)
}

func (a *App) SelectDirectory() string {
	dir, _ := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Выберите папку для сканирования",
	})
	return dir
}

// ─── Folder scanner ───────────────────────────────────────────────────────────

type dirMarkers struct {
	hasPackageJSON bool
	hasCargoToml   bool
	hasPomXml      bool
	hasGradleBuild bool
	hasGoMod       bool
	hasPyMarker    bool
	hasNextConfig  bool
	hasNuxtConfig  bool
}

func getMarkers(dir string) dirMarkers {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return dirMarkers{}
	}
	var m dirMarkers
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		n := e.Name()
		switch n {
		case "package.json":
			m.hasPackageJSON = true
		case "Cargo.toml":
			m.hasCargoToml = true
		case "pom.xml":
			m.hasPomXml = true
		case "build.gradle", "build.gradle.kts":
			m.hasGradleBuild = true
		case "go.mod":
			m.hasGoMod = true
		case "requirements.txt", "pyproject.toml", "setup.py", "setup.cfg", "Pipfile":
			m.hasPyMarker = true
		}
		if strings.HasPrefix(n, "next.config.") {
			m.hasNextConfig = true
		}
		if strings.HasPrefix(n, "nuxt.config.") {
			m.hasNuxtConfig = true
		}
	}
	return m
}

func detectFolderType(name string, m dirMarkers) string {
	switch name {
	case "node_modules":
		if m.hasPackageJSON {
			return "node/modules"
		}
	case "target":
		if m.hasCargoToml {
			return "rust/target"
		}
		if m.hasPomXml {
			return "java/target"
		}
	case ".gradle":
		if m.hasGradleBuild {
			return "java/gradle"
		}
	case "build":
		if m.hasGradleBuild {
			return "java/build"
		}
		if m.hasPackageJSON {
			return "node/build"
		}
	case ".venv", "venv":
		if m.hasPyMarker {
			return "python/venv"
		}
	case "__pycache__":
		return "python/cache"
	case ".pytest_cache":
		return "python/test-cache"
	case ".mypy_cache":
		return "python/mypy-cache"
	case ".ruff_cache":
		return "python/ruff-cache"
	case ".tox":
		return "python/tox"
	case ".next":
		if m.hasNextConfig || m.hasPackageJSON {
			return "next.js/cache"
		}
	case ".nuxt":
		if m.hasNuxtConfig || m.hasPackageJSON {
			return "nuxt/cache"
		}
	case ".svelte-kit":
		if m.hasPackageJSON {
			return "svelte/cache"
		}
	case "dist":
		if m.hasPackageJSON {
			return "node/dist"
		}
	case "vendor":
		if m.hasGoMod {
			return "go/vendor"
		}
	case ".turbo":
		if m.hasPackageJSON {
			return "turbo/cache"
		}
	case "coverage":
		if m.hasPackageJSON {
			return "node/coverage"
		}
	case ".parcel-cache":
		if m.hasPackageJSON {
			return "parcel/cache"
		}
	}
	return ""
}

func (a *App) FindFolders(searchPath string, maxDepth int) []FolderItem {
	type stackEntry struct {
		path  string
		depth int
	}
	var found []FolderItem
	stack := []stackEntry{{searchPath, 0}}

	for len(stack) > 0 {
		current := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		entries, err := os.ReadDir(current.path)
		if err != nil {
			continue
		}

		markers := getMarkers(current.path)
		projectName := filepath.Base(current.path)

		for _, e := range entries {
			if !e.IsDir() {
				continue
			}
			full := filepath.Join(current.path, e.Name())
			t := detectFolderType(e.Name(), markers)
			if t != "" {
				found = append(found, FolderItem{
					Path:        full,
					Type:        t,
					ProjectName: projectName,
				})
			} else {
				nextDepth := current.depth + 1
				if maxDepth <= 0 || nextDepth < maxDepth {
					stack = append(stack, stackEntry{full, nextDepth})
				}
			}
		}
	}

	sizes := make([]int64, len(found))
	var wg sync.WaitGroup
	for i := range found {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			sizes[idx] = dirSize(found[idx].Path)
		}(i)
	}
	wg.Wait()

	for i := range found {
		found[i].Size = sizes[i]
		found[i].SizeFmt = formatSize(sizes[i])
	}

	return found
}

func (a *App) DeleteFolders(paths []string) map[string]string {
	results := make(map[string]string)
	for _, p := range paths {
		if err := os.RemoveAll(p); err != nil {
			results[p] = err.Error()
		} else {
			results[p] = "ok"
		}
	}
	return results
}

// ─── Windows cache cleaner ────────────────────────────────────────────────────

func (a *App) GetWindowsCacheTargets() []CacheTarget {
	localAppData := os.Getenv("LOCALAPPDATA")
	appData := os.Getenv("APPDATA")

	static := []struct{ name, path string }{
		{"Временные файлы пользователя", localAppData + `\Temp`},
		{"Системные временные файлы", `C:\Windows\Temp`},
		{"Кеш Google Chrome", localAppData + `\Google\Chrome\User Data\Default\Cache`},
		{"Кеш Microsoft Edge", localAppData + `\Microsoft\Edge\User Data\Default\Cache`},
		{"Кеш Internet Explorer / Legacy Edge", localAppData + `\Microsoft\Windows\INetCache`},
		{"Превью-иконки (thumbnails)", localAppData + `\Microsoft\Windows\Explorer`},
		{"Корзина", `::recycle::`},
	}

	var results []CacheTarget
	for _, s := range static {
		if s.path == `::recycle::` {
			size := dirSize(`C:\$Recycle.Bin`)
			results = append(results, CacheTarget{
				Name: s.name, Path: s.path,
				Size: size, SizeFmt: formatSize(size), Exists: true,
			})
			continue
		}
		info, err := os.Stat(s.path)
		exists := err == nil && info.IsDir()
		size := int64(0)
		if exists {
			size = dirSize(s.path)
		}
		results = append(results, CacheTarget{
			Name:    s.name,
			Path:    s.path,
			Size:    size,
			SizeFmt: formatSize(size),
			Exists:  exists,
		})
	}

	ffProfiles := appData + `\Mozilla\Firefox\Profiles`
	entries, err := os.ReadDir(ffProfiles)
	if err == nil {
		for _, e := range entries {
			if !e.IsDir() {
				continue
			}
			cachePath := filepath.Join(ffProfiles, e.Name(), "cache2")
			info, err := os.Stat(cachePath)
			exists := err == nil && info.IsDir()
			size := int64(0)
			if exists {
				size = dirSize(cachePath)
			}
			label := e.Name()
			if len(label) > 22 {
				label = label[:22] + "…"
			}
			results = append(results, CacheTarget{
				Name:    "Кеш Firefox (" + label + ")",
				Path:    cachePath,
				Size:    size,
				SizeFmt: formatSize(size),
				Exists:  exists,
			})
		}
	}

	return results
}

func (a *App) CleanCacheTargets(paths []string) map[string]string {
	results := make(map[string]string)
	for _, p := range paths {
		if p == `::recycle::` {
			err := hideCmd("PowerShell", "-NoProfile", "-Command",
				"Clear-RecycleBin -Force -ErrorAction SilentlyContinue").Run()
			if err != nil {
				results[p] = err.Error()
			} else {
				results[p] = "ok"
			}
			continue
		}
		entries, err := os.ReadDir(p)
		if err != nil {
			results[p] = err.Error()
			continue
		}
		var errs []string
		for _, e := range entries {
			full := filepath.Join(p, e.Name())
			if err := os.RemoveAll(full); err != nil {
				errs = append(errs, e.Name()+": "+err.Error())
			}
		}
		if len(errs) > 0 {
			results[p] = strings.Join(errs, "; ")
		} else {
			results[p] = "ok"
		}
	}
	return results
}

// ─── Windows tweaks ───────────────────────────────────────────────────────────

func restartExplorer() {
	hideCmd("taskkill", "/F", "/IM", "explorer.exe").Run()
	time.Sleep(1500 * time.Millisecond)
	hideCmd("cmd", "/C", "start", "explorer.exe").Run()
}

func getStuckRects3() ([]byte, error) {
	out, err := hideCmd("reg", "query",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3`,
		"/v", "Settings").Output()
	if err != nil {
		return nil, err
	}
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if strings.Contains(line, "REG_BINARY") {
			parts := strings.Fields(line)
			if len(parts) >= 3 {
				return hex.DecodeString(strings.ToLower(parts[len(parts)-1]))
			}
		}
	}
	return nil, fmt.Errorf("Settings value not found")
}

func regKeyExists(key string) bool {
	return hideCmd("reg", "query", key, "/ve").Run() == nil
}

func regReadValue(key, value, vtype string) (string, error) {
	out, err := hideCmd("reg", "query", key, "/v", value).Output()
	if err != nil {
		return "", err
	}
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if !strings.Contains(line, vtype) {
			continue
		}
		parts := strings.Fields(line)
		if len(parts) < 3 {
			continue
		}
		data := parts[len(parts)-1]
		if vtype == "REG_DWORD" {
			data = strings.TrimPrefix(data, "0x")
			n, err := strconv.ParseInt(data, 16, 64)
			if err != nil {
				return "", err
			}
			return strconv.Itoa(int(n)), nil
		}
		return data, nil
	}
	return "", fmt.Errorf("value %s not found", value)
}

func (a *App) GetTweaks() []Tweak {
	var result []Tweak
	for _, def := range tweakDefs {
		var enabled bool
		if def.keyOnly {
			enabled = regKeyExists(def.key)
		} else {
			current, err := regReadValue(def.key, def.valueName, def.vtype)
			enabled = err == nil && current == def.enabledVal
		}
		result = append(result, Tweak{
			ID:              def.id,
			Name:            def.name,
			Description:     def.desc,
			Category:        def.category,
			Enabled:         enabled,
			RequiresRestart: def.requiresRestart,
			Kind:            "toggle",
		})
	}
	for _, def := range selectTweakDefs {
		t := Tweak{
			ID:              def.id,
			Name:            def.name,
			Description:     def.desc,
			Category:        def.category,
			RequiresRestart: def.requiresRestart,
			Kind:            "select",
			Options:         def.options,
			CurrentValue:    def.defaultValue,
		}
		switch def.id {
		case "win11_taskbar_layout":
			data, err := getStuckRects3()
			if err == nil && len(data) >= 13 {
				switch data[12] {
				case 0x01:
					t.CurrentValue = "top"
				case 0x03:
					t.CurrentValue = "bottom"
				}
			}
		default:
			if v, err := regReadValue(def.key, def.valueName, def.vtype); err == nil {
				t.CurrentValue = v
			}
		}
		result = append(result, t)
	}
	return result
}

func (a *App) ApplyTweak(id string, enabled bool) string {
	for _, def := range tweakDefs {
		if def.id != id {
			continue
		}
		if def.keyOnly {
			var err error
			if enabled {
				err = hideCmd("reg", "add", def.key, "/ve", "/t", "REG_SZ", "/d", "", "/f").Run()
			} else {
				err = hideCmd("reg", "delete", def.key, "/f").Run()
			}
			if err != nil {
				return err.Error()
			}
			if def.requiresRestart {
				go restartExplorer()
			}
			return "ok"
		}
		val := def.disabledVal
		if enabled {
			val = def.enabledVal
		}
		err := hideCmd("reg", "add", def.key, "/v", def.valueName, "/t", def.vtype, "/d", val, "/f").Run()
		if err != nil {
			return err.Error()
		}
		if def.requiresRestart {
			go restartExplorer()
		}
		return "ok"
	}
	return "unknown tweak"
}

func (a *App) ApplySelectTweak(id, value string) string {
	for _, def := range selectTweakDefs {
		if def.id != id {
			continue
		}
		switch id {
		case "win11_taskbar_layout":
			edge := map[string]byte{"top": 0x01, "bottom": 0x03}[value]
			data, err := getStuckRects3()
			if err != nil {
				return "ошибка чтения: " + err.Error()
			}
			if len(data) < 13 {
				return "неверный формат данных"
			}
			data[12] = edge
			hexStr := strings.ToUpper(hex.EncodeToString(data))
			if err := hideCmd("reg", "add",
				`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3`,
				"/v", "Settings", "/t", "REG_BINARY", "/d", hexStr, "/f").Run(); err != nil {
				return err.Error()
			}
		default:
			if err := hideCmd("reg", "add", def.key, "/v", def.valueName,
				"/t", def.vtype, "/d", value, "/f").Run(); err != nil {
				return err.Error()
			}
		}
		if def.requiresRestart {
			go restartExplorer()
		}
		return "ok"
	}
	return "unknown tweak"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func dirSize(path string) int64 {
	var total int64
	filepath.WalkDir(path, func(_ string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return nil
		}
		info, err := d.Info()
		if err != nil {
			return nil
		}
		total += info.Size()
		return nil
	})
	return total
}

func formatSize(b int64) string {
	const (
		kb int64 = 1024
		mb       = kb * 1024
		gb       = mb * 1024
	)
	switch {
	case b >= gb:
		return fmt.Sprintf("%.2f GB", float64(b)/float64(gb))
	case b >= mb:
		return fmt.Sprintf("%.2f MB", float64(b)/float64(mb))
	case b >= kb:
		return fmt.Sprintf("%.2f KB", float64(b)/float64(kb))
	default:
		return fmt.Sprintf("%d B", b)
	}
}
