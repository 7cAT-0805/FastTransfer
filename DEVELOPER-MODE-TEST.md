# 🧪 開發者模式測試清單

## 🎯 快速測試步驟

### 1. 啟用開發者模式
- [ ] 輸入 Konami Code：`↑ ↑ ↓ ↓ ← → ← → B A`
- [ ] 看到提示："Konami Code 檢測到！現在按住 Ctrl+Shift 並點擊 Logo 3次..."
- [ ] 按住 `Ctrl + Shift` 點擊 Logo 3次
- [ ] 看到提示："很好！現在在 5 秒內輸入密碼：DEVMODE2025"
- [ ] 輸入：`DEVMODE2025`
- [ ] 看到成功彈窗："開發者模式已啟用！"
- [ ] 左下角出現除錯面板

### 2. 測試首頁功能
- [ ] 點擊 "創建房間"
- [ ] 應該快速跳轉到房間 `DEV12345`
- [ ] 控制台顯示：`🛠️ Dev Mode API Call: POST /rooms`

### 3. 測試房間功能
- [ ] 房間標題顯示：`房間: DEV12345`
- [ ] 顯示房主標籤
- [ ] 參與者數量顯示（1-5人隨機）
- [ ] 預設顯示 2 個測試檔案
- [ ] QR Code 正常顯示

### 4. 測試檔案上傳
- [ ] 選擇任意檔案上傳
- [ ] 看到模擬上傳進度
- [ ] 檔案添加到列表
- [ ] 除錯面板檔案數量更新

### 5. 測試 Socket.IO 模擬
- [ ] 控制台顯示：`🛠️ Developer Mode: Using mock socket`
- [ ] 控制台顯示：`🔌 Mock Socket Emit: joinRoom DEV12345`
- [ ] 參與者數量會隨機變化

### 6. 測試退出功能
- [ ] 點擊除錯面板 "退出開發者模式"
- [ ] 頁面重新載入
- [ ] 除錯面板消失
- [ ] 控制台不再顯示 Mock 日誌

## 🎭 進階測試

### 自定義測試數據
在控制台執行：
```javascript
// 取得開發者模式實例
window.devMode = DeveloperMode.getInstance();

// 查看模擬數據
console.log(window.devMode.getMockRoom());

// 添加自定義檔案
const mockRoom = window.devMode.getMockRoom();
mockRoom.files.push({
  id: 'test-' + Date.now(),
  originalName: '測試檔案.pdf',
  size: 1000000,
  uploadedAt: new Date().toISOString(),
  downloadUrl: 'blob:test-file'
});
```

### 測試錯誤情況
- [ ] 在非開發者模式下測試真實 API
- [ ] 驗證開發者模式不會干擾正常功能

## 🚨 已知問題

- 檔案下載為模擬 Blob URL
- Socket.IO 事件為簡化模擬
- 跨瀏覽器房間共享無效

## ✅ 測試通過標準

- [ ] 所有功能無錯誤
- [ ] 控制台日誌清晰
- [ ] UI/UX 流暢
- [ ] 可正常退出模式
