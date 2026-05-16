package main

import (
	"os"
	"path/filepath"
	"strings"
	"sync"
)

type FolderItem struct {
	Path        string `json:"path"`
	Type        string `json:"type"`
	ProjectName string `json:"projectName"`
	Size        int64  `json:"size"`
	SizeFmt     string `json:"sizeFmt"`
}

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
