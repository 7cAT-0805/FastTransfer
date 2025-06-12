@echo off
title FastTransfer 網路診斷工具
echo ========================================
echo   FastTransfer 網路連接診斷工具
echo ========================================
echo.

echo 1. 測試 Railway 後端連接...
curl -s -w "HTTP 狀態碼: %%{http_code}\n" https://fasttransfer-production.up.railway.app/api/health

echo.
echo 2. 測試 Render 後端連接...
curl -s -w "HTTP 狀態碼: %%{http_code}\n" https://fastransfer-backend.onrender.com/api/health

echo.
echo 3. 測試網路連接...
ping -n 4 railway.app

echo.
echo 4. 檢查 DNS 解析...
nslookup fasttransfer-production.up.railway.app

echo.
echo ========================================
echo   診斷完成！
echo ========================================
echo.
echo 如果看到 HTTP 狀態碼: 200，表示後端正常
echo 如果看到連接錯誤，請檢查網路連接
echo.
pause
