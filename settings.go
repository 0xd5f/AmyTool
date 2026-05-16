package main

import (
	"os"
	"path/filepath"
)

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
