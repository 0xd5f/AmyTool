package main

import (
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

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
		`HKCU\Control Panel\Accessibility\StickyKeys`, "Flags", "58", "506", "REG_SZ", false, false},
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
		`HKCU\Software\Microsoft\Windows\CurrentVersion\GameDVR`, "AppCaptureEnabled", "0", "1", "REG_DWORD", false, false},
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
		`HKCU\Software\Microsoft\Clipboard`, "AllowCrossDeviceClipboard", "0", "1", "REG_DWORD", false, false},
	{"explorer_open_this_pc", "Открывать Проводник на «Этот компьютер»", "По умолчанию Проводник открывается на «Быстрый доступ» — этот твик переключает на «Этот компьютер»", "Проводник",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "LaunchTo", "1", "2", "REG_DWORD", false, false},
	{"hide_meet_now", "Скрыть кнопку «Встреча сейчас»", "Убрать иконку Meet Now из системного трея панели задач", "Панель задач",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer`, "HideSCAMeetNow", "1", "0", "REG_DWORD", false, false},
	{"fast_context_menu", "Быстрое открытие контекстного меню", "Уменьшить задержку перед появлением контекстного меню со 400 до 0 мс", "Проводник",
		`HKCU\Control Panel\Desktop`, "MenuShowDelay", "0", "400", "REG_SZ", false, false},
	{"disable_silent_app_install", "Отключить тихую установку рекламных приложений", "Запретить Windows тихо устанавливать рекламные приложения из Store без ведома пользователя", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "SilentInstalledAppsEnabled", "0", "1", "REG_DWORD", false, false},
	{"disable_app_suggestions_start", "Отключить предложения приложений в меню Пуск", "Убрать рекомендуемые приложения из Store в меню Пуск", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager`, "SubscribedContent-338388Enabled", "0", "1", "REG_DWORD", false, false},
	{"end_task_taskbar", "Кнопка «Завершить задачу» в панели задач", "Добавить пункт «Завершить задачу» в контекстное меню панели задач", "Панель задач",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarDeveloperSettings`, "TaskbarEndTask", "1", "0", "REG_DWORD", false, false},
	{"show_battery_percentage", "Показывать процент заряда батареи", "Отображать процент заряда прямо на значке батареи в трее", "Панель задач",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer`, "DisplayBatteryPercentage", "1", "0", "REG_DWORD", false, false},
	{"disable_advertising_id", "Отключить рекламный идентификатор", "Запретить приложениям использовать персонализированный рекламный ID", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo`, "Enabled", "0", "1", "REG_DWORD", false, false},
	{"disable_speech_privacy", "Отключить сбор голосовых данных", "Не отправлять образцы голоса в Microsoft для распознавания речи", "Приватность",
		`HKCU\Software\Microsoft\Speech_OneCore\Settings\OnlineSpeechPrivacy`, "HasAccepted", "0", "1", "REG_DWORD", false, false},
	{"disable_ink_collection", "Отключить сбор рукописного ввода", "Не отправлять образцы рукописного текста и контактов в Microsoft", "Приватность",
		`HKCU\Software\Microsoft\InputPersonalization\TrainedDataStore`, "HarvestContacts", "0", "1", "REG_DWORD", false, false},
	{"disable_bg_apps", "Отключить фоновые приложения", "Запретить приложениям работать в фоне (глобально)", "Производительность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications`, "GlobalUserDisabled", "1", "0", "REG_DWORD", false, false},
	{"disable_storage_sense", "Отключить контроль памяти (Storage Sense)", "Отключить автоматическую очистку файлов через Storage Sense", "Производительность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\StorageSense\Parameters\StoragePolicy`, "01", "0", "1", "REG_DWORD", false, false},
	{"disable_fso", "Отключить Full Screen Optimization", "Отключить оптимизацию для полноэкранных игр (FSO) для стабильности", "Производительность",
		`HKCU\System\GameConfigStore`, "GameDVR_FSEBehaviorMode", "2", "0", "REG_DWORD", false, false},
	{"scrollbars_always_visible", "Всегда показывать полосы прокрутки", "Не скрывать полосы прокрутки в приложениях автоматически", "Внешний вид",
		`HKCU\Control Panel\Accessibility`, "DynamicScrollbars", "0", "1", "REG_DWORD", false, false},
	{"disable_mouse_accel", "Отключить ускорение мыши", "Убрать «Повышение точности» указателя (отключить акселерацию)", "Производительность",
		`HKCU\Control Panel\Mouse`, "MouseSpeed", "0", "1", "REG_SZ", false, false},
	{"disable_toast_notifications", "Отключить всплывающие уведомления", "Запретить показ toast-уведомлений от приложений", "Приватность",
		`HKCU\Software\Microsoft\Windows\CurrentVersion\PushNotifications`, "ToastEnabled", "0", "1", "REG_DWORD", false, false},
	{"disable_siuf_feedback", "Отключить опросы обратной связи (SIUF)", "Не показывать системные опросы о работе Windows", "Приватность",
		`HKCU\Software\Microsoft\Siuf\Rules`, "NumberOfSIUFInPeriod", "0", "1", "REG_DWORD", false, false},
}

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
				delKey := def.key
				if id == "win11_old_context_menu" || id == "win11_old_explorer" {
					delKey = def.key[:strings.LastIndex(def.key, `\`)]
				}
				err = hideCmd("reg", "delete", delKey, "/f").Run()
			}
			if err != nil {
				return err.Error()
			}
			if def.requiresRestart {
				go restartExplorer()
			}
			return "ok"
		}
		if id == "disable_animations" {
			animVal, taskbarVal := "1", "1"
			if enabled {
				animVal, taskbarVal = "0", "0"
			}
			hideCmd("reg", "add", `HKCU\Control Panel\Desktop\WindowMetrics`, "/v", "MinAnimate", "/t", "REG_SZ", "/d", animVal, "/f").Run()
			hideCmd("reg", "add", `HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`, "/v", "TaskbarAnimations", "/t", "REG_DWORD", "/d", taskbarVal, "/f").Run()
			return "ok"
		}
		if id == "disable_mouse_accel" {
			speed, t1, t2 := "1", "6", "10"
			if enabled {
				speed, t1, t2 = "0", "0", "0"
			}
			key := `HKCU\Control Panel\Mouse`
			hideCmd("reg", "add", key, "/v", "MouseSpeed", "/t", "REG_SZ", "/d", speed, "/f").Run()
			hideCmd("reg", "add", key, "/v", "MouseThreshold1", "/t", "REG_SZ", "/d", t1, "/f").Run()
			hideCmd("reg", "add", key, "/v", "MouseThreshold2", "/t", "REG_SZ", "/d", t2, "/f").Run()
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
