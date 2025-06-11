@echo off
echo 正在啟動 FastTransfer 開發服務器...
echo.

REM 檢查是否已安裝依賴
if not exist "node_modules" (
    echo 正在安裝依賴...
    call npm run setup
)

REM 啟動開發服務器
echo 正在啟動開發服務器...
start cmd /k "cd /d server && npm run dev"
timeout /t 3 /nobreak >nul
start cmd /k "cd /d client && npm run dev"

echo.
echo FastTransfer 開發服務器已啟動！
echo 前端服務: http://localhost:5173
echo 後端服務: http://localhost:3001
echo.
echo 按任意鍵結束...
pause >nul
