package main

import (
	"fmt"
	"math"
	"strconv"
	"strings"
	"sync"
	"time"
)

type DiskInfo struct {
	Letter string `json:"letter"`
	Used   uint64 `json:"used"`
	Total  uint64 `json:"total"`
}

type SystemStats struct {
	CPUPercent float64    `json:"cpuPercent"`
	RAMUsed    uint64     `json:"ramUsed"`
	RAMTotal   uint64     `json:"ramTotal"`
	Disks      []DiskInfo `json:"disks"`
	UptimeSec  int64      `json:"uptimeSec"`
}

type PCInfo struct {
	Hostname  string `json:"hostname"`
	OSVersion string `json:"osVersion"`
	CPU       string `json:"cpu"`
	GPU       string `json:"gpu"`
	RAMTotal  string `json:"ramTotal"`
	BIOS      string `json:"bios"`
	NIC       string `json:"nic"`
}

var (
	pcInfoCache    PCInfo
	pcInfoOnce     sync.Once
	statsCache     SystemStats
	statsCacheMu   sync.RWMutex
	statsStartOnce sync.Once
	statsReady     = make(chan struct{})
)

func psRun(script string) (string, error) {
	cmd := hideCmd("powershell", "-NoProfile", "-NonInteractive", "-")
	cmd.Stdin = strings.NewReader(script)
	out, err := cmd.Output()
	return string(out), err
}

func psVal(output, key string) string {
	for _, line := range strings.Split(output, "\n") {
		line = strings.TrimRight(line, "\r \t")
		if strings.HasPrefix(line, key+"=") {
			return strings.TrimSpace(line[len(key)+1:])
		}
	}
	return ""
}

func collectStats() SystemStats {
	s := SystemStats{Disks: []DiskInfo{}}
	script := `
$cpu = [math]::Round((Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average, 1)
$os = Get-CimInstance Win32_OperatingSystem
Write-Output "CPU=$cpu"
Write-Output "TOTAL=$($os.TotalVisibleMemorySize)"
Write-Output "FREE=$($os.FreePhysicalMemory)"
$bt = $os.LastBootUpTime
Write-Output "BOOT=$($bt.Year.ToString('0000'))$($bt.Month.ToString('00'))$($bt.Day.ToString('00'))$($bt.Hour.ToString('00'))$($bt.Minute.ToString('00'))$($bt.Second.ToString('00'))"
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object { Write-Output "DISK=$($_.DeviceID)|$($_.Size)|$($_.FreeSpace)" }
`
	out, err := psRun(script)
	if err != nil {
		return s
	}
	if v := psVal(out, "CPU"); v != "" {
		f, _ := strconv.ParseFloat(v, 64)
		s.CPUPercent = math.Round(f*10) / 10
	}
	if v := psVal(out, "TOTAL"); v != "" {
		kb, _ := strconv.ParseUint(v, 10, 64)
		s.RAMTotal = kb * 1024
	}
	if v := psVal(out, "FREE"); v != "" {
		kb, _ := strconv.ParseUint(v, 10, 64)
		free := kb * 1024
		if s.RAMTotal > free {
			s.RAMUsed = s.RAMTotal - free
		}
	}
	if v := psVal(out, "BOOT"); v != "" && len(v) >= 14 {
		if boot, err := time.ParseInLocation("20060102150405", v[:14], time.Local); err == nil {
			s.UptimeSec = int64(time.Since(boot).Seconds())
		}
	}
	for _, line := range strings.Split(out, "\n") {
		line = strings.TrimRight(line, "\r \t")
		if strings.HasPrefix(line, "DISK=") {
			parts := strings.Split(line[5:], "|")
			if len(parts) == 3 {
				total, _ := strconv.ParseUint(strings.TrimSpace(parts[1]), 10, 64)
				free, _ := strconv.ParseUint(strings.TrimSpace(parts[2]), 10, 64)
				if total > 0 {
					s.Disks = append(s.Disks, DiskInfo{
						Letter: strings.TrimSpace(parts[0]),
						Total:  total,
						Used:   total - free,
					})
				}
			}
		}
	}
	return s
}

func (a *App) GetSystemStats() SystemStats {
	statsStartOnce.Do(func() {
		go func() {
			first := true
			for {
				s := collectStats()
				statsCacheMu.Lock()
				statsCache = s
				statsCacheMu.Unlock()
				if first {
					close(statsReady)
					first = false
				}
				time.Sleep(3 * time.Second)
			}
		}()
	})
	select {
	case <-statsReady:
	case <-time.After(15 * time.Second):
	}
	statsCacheMu.RLock()
	defer statsCacheMu.RUnlock()
	return statsCache
}

func formatRAM(bytes uint64) string {
	gb := float64(bytes) / 1073741824
	if gb >= 1 {
		return fmt.Sprintf("%.1f GB", gb)
	}
	return fmt.Sprintf("%.0f MB", float64(bytes)/1048576)
}

func (a *App) GetPCInfo() PCInfo {
	pcInfoOnce.Do(func() {
		script := `
$cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1).Name
$osObj = Get-CimInstance Win32_OperatingSystem
$os = $osObj.Caption -replace '^Microsoft ', ''
$gpu = (Get-CimInstance Win32_VideoController | Select-Object -First 1).Name
$ram = $osObj.TotalVisibleMemorySize
$b = Get-CimInstance Win32_BIOS
$bios = ("$($b.Manufacturer) $($b.SMBIOSBIOSVersion)").Trim()
$nic = (Get-CimInstance Win32_NetworkAdapter -Filter "NetEnabled=True" | Select-Object -First 1).Name
Write-Output "HOST=$($env:COMPUTERNAME)"
Write-Output "OS=$os"
Write-Output "CPU=$cpu"
Write-Output "GPU=$gpu"
Write-Output "RAM=$ram"
Write-Output "BIOS=$bios"
Write-Output "NIC=$nic"
`
		out, err := psRun(script)
		if err != nil {
			return
		}
		pcInfoCache.Hostname = psVal(out, "HOST")
		pcInfoCache.OSVersion = psVal(out, "OS")
		pcInfoCache.CPU = psVal(out, "CPU")
		pcInfoCache.GPU = psVal(out, "GPU")
		if v := psVal(out, "RAM"); v != "" {
			kb, _ := strconv.ParseUint(v, 10, 64)
			pcInfoCache.RAMTotal = formatRAM(kb * 1024)
		}
		pcInfoCache.BIOS = psVal(out, "BIOS")
		pcInfoCache.NIC = psVal(out, "NIC")
	})
	return pcInfoCache
}
