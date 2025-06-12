# FastTransfer Network Error 詳細診斷腳本

param(
    [switch]$Detailed
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "        FastTransfer Network 診斷報告" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$report = @()
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "📅 診斷時間: $timestamp" -ForegroundColor Gray
Write-Host ""

# 1. 基本網路連通性測試
Write-Host "🌐 1. 基本網路連通性測試" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $pingTest = Test-Connection -ComputerName "8.8.8.8" -Count 2 -Quiet
    if ($pingTest) {
        Write-Host "   ✅ 網際網路連接正常" -ForegroundColor Green
        $report += "✅ 網際網路連接: 正常"
    } else {
        Write-Host "   ❌ 網際網路連接異常" -ForegroundColor Red
        $report += "❌ 網際網路連接: 異常"
        Write-Host "   💡 建議: 檢查網路連接或嘗試重新連接" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  無法測試網路連接" -ForegroundColor Yellow
    $report += "⚠️ 網際網路連接: 無法測試"
}

Write-Host ""

# 2. DNS 解析測試
Write-Host "🔍 2. DNS 解析測試" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$domains = @(
    "fasttransfer-production.up.railway.app",
    "fasttransfer.netlify.app"
)

foreach ($domain in $domains) {
    try {
        $dnsResult = Resolve-DnsName $domain -ErrorAction Stop
        Write-Host "   ✅ $domain" -ForegroundColor Green
        if ($Detailed) {
            Write-Host "      IP: $($dnsResult[0].IPAddress)" -ForegroundColor Gray
        }
        $report += "✅ DNS $domain : 正常"
    } catch {
        Write-Host "   ❌ $domain - DNS 解析失敗" -ForegroundColor Red
        $report += "❌ DNS $domain : 失敗"
    }
}

Write-Host ""

# 3. Railway 後端測試
Write-Host "🚀 3. Railway 後端服務測試" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $healthResponse = Invoke-RestMethod -Uri "https://fasttransfer-production.up.railway.app/api/health" -Method GET -TimeoutSec 10
    Write-Host "   ✅ 健康檢查: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "   📊 回應時間: $($healthResponse.timestamp)" -ForegroundColor Gray
    $report += "✅ Railway 健康檢查: 正常"
    
    # 測試房間創建
    try {
        $roomResponse = Invoke-RestMethod -Uri "https://fasttransfer-production.up.railway.app/api/rooms" -Method POST -ContentType "application/json" -TimeoutSec 10
        Write-Host "   ✅ 房間創建: 成功 (房間: $($roomResponse.roomId))" -ForegroundColor Green
        $report += "✅ 房間創建測試: 成功"
    } catch {
        Write-Host "   ❌ 房間創建: 失敗 - $($_.Exception.Message)" -ForegroundColor Red
        $report += "❌ 房間創建測試: 失敗"
    }
    
} catch {
    Write-Host "   ❌ Railway 後端無法連接: $($_.Exception.Message)" -ForegroundColor Red
    $report += "❌ Railway 後端: 無法連接"
    
    if ($_.Exception.Message -like "*timeout*") {
        Write-Host "   💡 可能原因: 網路超時，服務可能在休眠中" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*SSL*" -or $_.Exception.Message -like "*certificate*") {
        Write-Host "   💡 可能原因: SSL 憑證問題" -ForegroundColor Yellow
    } else {
        Write-Host "   💡 可能原因: 防火牆或網路限制" -ForegroundColor Yellow
    }
}

Write-Host ""

# 4. Netlify 前端測試
Write-Host "🌐 4. Netlify 前端服務測試" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $netlifyResponse = Invoke-WebRequest -Uri "https://fasttransfer.netlify.app" -UseBasicParsing -TimeoutSec 10
    if ($netlifyResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Netlify 前端: 可訪問" -ForegroundColor Green
        $report += "✅ Netlify 前端: 正常"
    } else {
        Write-Host "   ⚠️  Netlify 前端: HTTP $($netlifyResponse.StatusCode)" -ForegroundColor Yellow
        $report += "⚠️ Netlify 前端: HTTP $($netlifyResponse.StatusCode)"
    }
} catch {
    Write-Host "   ❌ Netlify 前端無法訪問: $($_.Exception.Message)" -ForegroundColor Red
    $report += "❌ Netlify 前端: 無法訪問"
}

Write-Host ""

# 5. 系統環境檢查
Write-Host "🔧 5. 系統環境檢查" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$osInfo = Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion
Write-Host "   🖥️  作業系統: $($osInfo.WindowsProductName)" -ForegroundColor Gray
Write-Host "   📋 版本: $($osInfo.WindowsVersion)" -ForegroundColor Gray

# 檢查代理設置
$proxySettings = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -Name ProxyEnable -ErrorAction SilentlyContinue
if ($proxySettings.ProxyEnable -eq 1) {
    $proxyServer = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -Name ProxyServer -ErrorAction SilentlyContinue
    Write-Host "   🔗 代理設置: 已啟用 ($($proxyServer.ProxyServer))" -ForegroundColor Yellow
    $report += "⚠️ 系統代理: 已啟用"
} else {
    Write-Host "   🔗 代理設置: 未啟用" -ForegroundColor Green
    $report += "✅ 系統代理: 未啟用"
}

Write-Host ""

# 6. 診斷總結
Write-Host "📋 6. 診斷總結與建議" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Gray

$errorCount = ($report | Where-Object { $_ -like "❌*" }).Count
$warningCount = ($report | Where-Object { $_ -like "⚠️*" }).Count
$successCount = ($report | Where-Object { $_ -like "✅*" }).Count

Write-Host "   ✅ 成功項目: $successCount" -ForegroundColor Green
Write-Host "   ⚠️  警告項目: $warningCount" -ForegroundColor Yellow
Write-Host "   ❌ 錯誤項目: $errorCount" -ForegroundColor Red
Write-Host ""

if ($errorCount -eq 0 -and $warningCount -eq 0) {
    Write-Host "🎉 所有測試通過！" -ForegroundColor Green
    Write-Host "   💡 建議: 如果仍有問題，請清除瀏覽器快取" -ForegroundColor Cyan
} elseif ($errorCount -eq 0) {
    Write-Host "✅ 主要功能正常，有少量警告" -ForegroundColor Green
    Write-Host "   💡 建議: 檢查瀏覽器設置和快取" -ForegroundColor Cyan
} else {
    Write-Host "❌ 發現問題需要解決" -ForegroundColor Red
    
    if ($report -like "*網際網路連接: 異常*") {
        Write-Host "   🔧 優先解決: 網路連接問題" -ForegroundColor Yellow
    } elseif ($report -like "*Railway 後端: 無法連接*") {
        Write-Host "   🔧 優先解決: 後端連接問題" -ForegroundColor Yellow
        Write-Host "      - 檢查防火牆設置" -ForegroundColor Gray
        Write-Host "      - 嘗試不同網路環境" -ForegroundColor Gray
        Write-Host "      - 聯繫網路管理員" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📄 詳細報告:" -ForegroundColor Cyan
foreach ($item in $report) {
    Write-Host "   $item" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🆘 如需進一步協助，請提供此診斷報告" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 如果指定了詳細模式，生成報告文件
if ($Detailed) {
    $reportPath = "d:\fastransfer\diagnostic-report-$((Get-Date).ToString('yyyyMMdd-HHmmss')).txt"
    $fullReport = @"
FastTransfer Network 診斷報告
生成時間: $timestamp
========================================

$($report -join "`n")

系統資訊:
- 作業系統: $($osInfo.WindowsProductName)
- 版本: $($osInfo.WindowsVersion)
- PowerShell 版本: $($PSVersionTable.PSVersion)

網路環境:
- DNS 伺服器: $(Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object -First 1 -ExpandProperty ServerAddresses)
"@
    
    $fullReport | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "📁 詳細報告已儲存至: $reportPath" -ForegroundColor Green
}
