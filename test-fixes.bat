@echo off
echo ========================================
echo FastTransfer 測試腳本
echo ========================================
echo.
echo 正在檢查服務狀態...
echo.

REM 檢查後端服務
echo 檢查後端服務 (端口 3001)...
netstat -an | findstr ":3001" > nul
if %errorlevel% == 0 (
    echo ✓ 後端服務運行中
) else (
    echo ✗ 後端服務未運行
    echo 請執行: cd server ^&^& node index.js
    pause
    exit /b 1
)

REM 檢查前端服務
echo 檢查前端服務 (端口 5173 或 5174)...
netstat -an | findstr ":517" > nul
if %errorlevel% == 0 (
    echo ✓ 前端服務運行中
) else (
    echo ✗ 前端服務未運行
    echo 請執行: cd client ^&^& npm run dev
)

echo.
echo ========================================
echo 測試功能清單
echo ========================================
echo.
echo 1. 在線人數正確計算 (已修復)
echo    - 加入房間時人數正確增加
echo    - 離開房間時人數正確減少
echo    - 不會出現人數 x2 的問題
echo.
echo 2. 檔案上傳功能 (已修復)
echo    - 避免重複上傳同一檔案
echo    - 新加入的成員能看到所有檔案
echo    - Socket.IO 事件不會重複觸發
echo.
echo 3. 建議測試步驟:
echo    a) 打開瀏覽器 http://localhost:5174
echo    b) 創建房間並記錄房間代碼
echo    c) 在另一個瀏覽器視窗加入同一房間
echo    d) 觀察在線人數是否正確
echo    e) 房主上傳檔案，檢查是否只上傳一次
echo    f) 檢查新加入的成員是否能看到檔案
echo    g) 關閉一個視窗，檢查人數是否減少
echo.
echo ========================================
echo 快速啟動指令
echo ========================================
echo.
echo 啟動後端: cd server ^&^& node index.js
echo 啟動前端: cd client ^&^& npm run dev
echo 建置前端: cd client ^&^& npm run build
echo.
pause
