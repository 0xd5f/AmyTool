package main

import (
	"io"
	"os"
	"path/filepath"
	"strings"
)

type SortCategory struct {
	Name  string   `json:"name"`
	Count int      `json:"count"`
	Size  int64    `json:"size"`
	Exts  []string `json:"exts"`
}

var sortRules = []struct {
	Name string
	Exts []string
}{
	{"Archives", []string{"zip", "gz", "tgz", "rar", "7z", "tar", "bz2", "xz"}},
	{"Music", []string{"mp3", "wav", "flac", "ogg", "aac", "m4a", "wma"}},
	{"Video", []string{"avi", "mov", "mp4", "mkv", "3gp", "wmv", "flv", "webm"}},
	{"Photos", []string{"jpg", "jpeg", "raw", "cr2", "nef", "arw"}},
	{"Images", []string{"png", "bmp", "gif", "tiff", "tif", "svg", "webp", "ico"}},
	{"Docs", []string{"pdf", "txt", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "csv", "rtf", "md"}},
	{"Apps", []string{"exe", "bat", "msi", "cmd", "ps1"}},
}

func extToCategory(ext string) string {
	ext = strings.ToLower(strings.TrimPrefix(ext, "."))
	for _, rule := range sortRules {
		for _, e := range rule.Exts {
			if e == ext {
				return rule.Name
			}
		}
	}
	return ""
}

func (a *App) GetSortPreview(dir string) []SortCategory {
	counts := map[string]int{}
	sizes := map[string]int64{}
	total := 0
	var otherSize int64
	entries, err := os.ReadDir(dir)
	if err != nil {
		return []SortCategory{}
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		total++
		info, infoErr := e.Info()
		var fsize int64
		if infoErr == nil {
			fsize = info.Size()
		}
		cat := extToCategory(filepath.Ext(e.Name()))
		if cat != "" {
			counts[cat]++
			sizes[cat] += fsize
		} else {
			otherSize += fsize
		}
	}
	result := []SortCategory{}
	matched := 0
	for _, rule := range sortRules {
		if n, ok := counts[rule.Name]; ok && n > 0 {
			result = append(result, SortCategory{Name: rule.Name, Count: n, Size: sizes[rule.Name], Exts: rule.Exts})
			matched += n
		}
	}
	if others := total - matched; others > 0 {
		result = append(result, SortCategory{Name: "_others", Count: others, Size: otherSize, Exts: []string{}})
	}
	return result
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

func (a *App) RunSortSelected(dir string, cats []string, copyMode bool) map[string]string {
	allowed := map[string]bool{}
	for _, c := range cats {
		allowed[c] = true
	}
	errors := map[string]string{}
	entries, err := os.ReadDir(dir)
	if err != nil {
		errors["_"] = err.Error()
		return errors
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		cat := extToCategory(filepath.Ext(e.Name()))
		if cat == "" || !allowed[cat] {
			continue
		}
		destDir := filepath.Join(dir, cat)
		if mkErr := os.MkdirAll(destDir, 0755); mkErr != nil {
			errors[e.Name()] = mkErr.Error()
			continue
		}
		src := filepath.Join(dir, e.Name())
		dst := filepath.Join(destDir, e.Name())
		if _, statErr := os.Stat(dst); statErr == nil {
			errors[e.Name()] = "already exists"
			continue
		}
		if copyMode {
			if cpErr := copyFile(src, dst); cpErr != nil {
				errors[e.Name()] = cpErr.Error()
			}
		} else {
			if mvErr := os.Rename(src, dst); mvErr != nil {
				errors[e.Name()] = mvErr.Error()
			}
		}
	}
	return errors
}

func (a *App) RunSort(dir string) map[string]string {
	errors := map[string]string{}
	entries, err := os.ReadDir(dir)
	if err != nil {
		errors["_"] = err.Error()
		return errors
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		cat := extToCategory(filepath.Ext(e.Name()))
		if cat == "" {
			continue
		}
		destDir := filepath.Join(dir, cat)
		if mkErr := os.MkdirAll(destDir, 0755); mkErr != nil {
			errors[e.Name()] = mkErr.Error()
			continue
		}
		src := filepath.Join(dir, e.Name())
		dst := filepath.Join(destDir, e.Name())
		if _, statErr := os.Stat(dst); statErr == nil {
			errors[e.Name()] = "already exists"
			continue
		}
		if mvErr := os.Rename(src, dst); mvErr != nil {
			errors[e.Name()] = mvErr.Error()
		}
	}
	return errors
}
