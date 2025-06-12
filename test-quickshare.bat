@echo off
echo ===========================================
echo 🚀 FastTransfer 快速分享功能測試
echo ===========================================
echo.

echo 📦 安裝依賴...
cd /d "d:\fastransfer\client"
call npm install
if %errorlevel% neq 0 (
    echo ❌ 前端依賴安裝失敗
    pause
    exit /b 1
)

cd /d "d:\fastransfer\server"
call npm install
if %errorlevel% neq 0 (
    echo ❌ 後端依賴安裝失敗
    pause
    exit /b 1
)

echo.
echo 🔨 構建前端...
cd /d "d:\fastransfer\client"
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端構建失敗
    pause
    exit /b 1
)

echo.
echo ✅ 構建完成！
echo.
echo 🌟 新功能包括：
echo   📝 文字訊息即時分享
echo   🔗 網址/連結快速分享  
echo   📋 剪貼簿內容同步
echo   📸 手機照片即拍即傳
echo   🎤 語音訊息錄製分享
echo   👁️ 檔案預覽功能
echo   ✨ 美化的 UI 設計
echo.
echo 🚀 啟動開發服務器...
echo.

start "FastTransfer Backend" cmd /k "cd /d d:\fastransfer\server && npm start"
timeout /t 3 /nobreak >nul
start "FastTransfer Frontend" cmd /k "cd /d d:\fastransfer\client && npm run dev"

echo.
echo 📖 測試指南：
echo   1. 後端運行在 http://localhost:3001
echo   2. 前端運行在 http://localhost:5173
echo   3. 創建房間並測試新的快速分享功能
echo   4. 測試文字、網址、剪貼簿、照片、語音分享
echo   5. 測試檔案預覽功能
echo.
echo 按任意鍵關閉此視窗...
pause >nul
