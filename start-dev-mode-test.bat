@echo off
echo 🛠️ FastTransfer 開發者模式測試啟動腳本
echo.

echo 📁 切換到客戶端目錄...
cd /d "%~dp0\client"

echo 📦 檢查依賴項...
if not exist "node_modules" (
    echo 安裝依賴項...
    npm install
)

echo 🚀 啟動開發服務器...
echo 開發者模式測試頁面: %~dp0dev-mode-test.html
echo 主應用程式: http://localhost:5173
echo.
echo 💡 測試步驟:
echo 1. 打開 http://localhost:5173
echo 2. 按 F12 打開開發者工具
echo 3. 在控制台輸入: DevMode_7cAT()
echo 4. 測試各項功能
echo.

start "" "%~dp0dev-mode-test.html"
npm run dev

pause
