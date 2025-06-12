# FastTransfer Network Error 快速修復指南

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FastTransfer Network Error 診斷工具" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 檢查網路連接
Write-Host "1. 檢查基本網路連接..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName "8.8.8.8" -Count 2 -Quiet
    if ($ping) {
        Write-Host "   ✅ 網路連接正常" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 網路連接異常" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "   ❌ 無法檢測網路連接" -ForegroundColor Red
}

Write-Host ""

# 測試 Railway 後端
Write-Host "2. 測試 Railway 後端連接..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://fasttransfer-production.up.railway.app/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Railway 後端正常運行" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   📊 狀態: $($content.status)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Railway 後端連接失敗: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 測試 Render 後端
Write-Host "3. 測試 Render 後端連接..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://fastransfer-backend.onrender.com/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Render 後端正常運行" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Render 後端連接失敗: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 檢查 DNS 解析
Write-Host "4. 檢查 DNS 解析..." -ForegroundColor Yellow
try {
    $dns = Resolve-DnsName "fasttransfer-production.up.railway.app" -ErrorAction Stop
    Write-Host "   ✅ DNS 解析正常" -ForegroundColor Green
    Write-Host "   🌐 IP 地址: $($dns[0].IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ DNS 解析失敗" -ForegroundColor Red
}

Write-Host ""

# 修復建議
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   修復建議" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "如果 Railway 後端正常但仍有問題，請嘗試：" -ForegroundColor White
Write-Host "1. 清除瀏覽器快取（Ctrl+Shift+Delete）" -ForegroundColor Gray
Write-Host "2. 使用無痕模式開啟網站" -ForegroundColor Gray
Write-Host "3. 檢查是否有廣告攔截器干擾" -ForegroundColor Gray
Write-Host "4. 嘗試不同的瀏覽器" -ForegroundColor Gray
Write-Host "5. 檢查公司/學校防火牆設置" -ForegroundColor Gray

Write-Host ""
Write-Host "如果所有後端都無法連接：" -ForegroundColor White
Write-Host "1. 檢查網路代理設置" -ForegroundColor Gray
Write-Host "2. 嘗試使用手機熱點" -ForegroundColor Gray
Write-Host "3. 聯繫網路管理員" -ForegroundColor Gray

Write-Host ""
Write-Host "緊急解決方案：" -ForegroundColor Yellow
Write-Host "在 FastTransfer 網站上按 Ctrl+Shift+D 啟用開發者模式" -ForegroundColor Gray
Write-Host "這將啟用離線模擬功能，可以測試界面" -ForegroundColor Gray

Write-Host ""
Write-Host "按任意鍵退出..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
