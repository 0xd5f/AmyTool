package main

import (
	"os"
	"path/filepath"
	"strings"
)

type CacheTarget struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Size    int64  `json:"size"`
	SizeFmt string `json:"sizeFmt"`
	Exists  bool   `json:"exists"`
}

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
