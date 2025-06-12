# 🛠️ 開發者模式使用指南

## 🎯 什麼是開發者模式？

開發者模式讓你可以在不連接真實後端 API 的情況下測試 FastTransfer 的所有功能。非常適合：

- 🔧 **前端開發測試**
- 📱 **UI/UX 驗證**
- 🎨 **介面調整**
- 🚀 **演示展示**

## 🔐 如何啟用開發者模式？

### 複雜的啟用序列（防止意外觸發）：

#### 第一步：Konami Code
在任何頁面輸入經典的 Konami Code：
```
↑ ↑ ↓ ↓ ← → ← → B A
```
> 💡 使用鍵盤方向鍵和字母鍵

#### 第二步：特殊點擊
當看到提示後，**按住 `Ctrl + Shift`** 同時點擊頁面 Logo **3次**

#### 第三步：密碼驗證
在 5 秒內輸入密碼：`DEVMODE2025`

### 🎉 成功啟用！
你會看到一個歡迎彈窗，確認開發者模式已啟用。

## 🛠️ 開發者模式功能

### 📋 模擬功能列表

#### 🏠 房間管理
- ✅ **創建房間**：生成模擬房間 ID (`DEV12345`)
- ✅ **加入房間**：模擬成功加入
- ✅ **房主驗證**：自動設定為房主

#### 📁 檔案操作
- ✅ **檔案上傳**：模擬上傳過程（含進度條）
- ✅ **檔案列表**：顯示預設測試檔案
- ✅ **檔案下載**：生成 Blob URL 供下載

#### 👥 即時功能
- ✅ **Socket.IO**：模擬即時連接
- ✅ **參與者計數**：隨機模擬 1-5 人
- ✅ **即時通知**：模擬檔案上傳通知

#### 📱 QR Code
- ✅ **QR Code 生成**：正常運作
- ✅ **分享功能**：完整測試

### 🎛️ 除錯面板

啟用後，左下角會顯示除錯面板：

```
🛠️ 開發者面板
模式: 開發者
API: 模擬  
房間: DEV12345
檔案: 2
[退出開發者模式]
```

### 📊 控制台日誌

開發者模式會在控制台顯示詳細日誌：

```
🛠️ Dev Mode API Call: POST /rooms
🔌 Mock Socket Emit: joinRoom DEV12345
🛠️ Developer Mode: Using mock socket
```

## 🔧 模擬數據

### 🏠 預設房間
```javascript
{
  id: 'DEV12345',
  hostId: 'dev-host-001', 
  participants: 3,
  files: [...]
}
```

### 📁 預設檔案
```javascript
[
  {
    id: 'file-001',
    originalName: '測試文件.txt',
    size: 1024,
    uploadedAt: '2025-06-12T...',
    downloadUrl: 'blob:mock-file-1'
  },
  {
    id: 'file-002', 
    originalName: '示範圖片.jpg',
    size: 2048000,
    uploadedAt: '2025-06-12T...',
    downloadUrl: 'blob:mock-file-2'
  }
]
```

## 🎯 測試場景

### 🧪 完整測試流程

1. **啟用開發者模式**（使用上述序列）
2. **創建房間**
   - 點擊 "創建房間"
   - 自動跳轉到 `DEV12345` 房間
3. **測試檔案上傳**
   - 選擇任意檔案上傳
   - 觀察模擬進度和結果
4. **測試 QR Code**
   - 查看 QR Code 生成
   - 測試下載和分享功能
5. **測試多人模擬**
   - 參與者數量會隨機變化
   - 模擬新檔案上傳通知

### 🎨 UI/UX 測試

開發者模式特別適合：
- **響應式設計**測試
- **載入狀態**驗證  
- **錯誤處理**模擬
- **動畫效果**檢查

## 🔄 退出開發者模式

### 方法 1：除錯面板
點擊除錯面板的 "退出開發者模式" 按鈕

### 方法 2：控制台
```javascript
localStorage.removeItem('fastransfer_dev_mode');
location.reload();
```

### 方法 3：手動清除
清除瀏覽器的 localStorage

## 🚨 注意事項

### ⚠️ 限制
- **不會實際上傳檔案**到伺服器
- **不會真實連接** Socket.IO
- **下載檔案**僅為模擬（Blob URL）
- **房間共享**無法跨瀏覽器測試

### 💡 建議
- 開發完成後記得**測試真實環境**
- 使用開發者模式進行**快速原型驗證**
- **UI 調整**時特別有用

## 🎭 高級功能

### 自定義模擬數據
可以透過控制台修改模擬數據：

```javascript
// 取得開發者模式實例
const devMode = DeveloperMode.getInstance();

// 取得模擬房間
const mockRoom = devMode.getMockRoom();

// 添加自定義檔案
mockRoom.files.push({
  id: 'custom-001',
  originalName: '自定義檔案.pdf',
  size: 5000000,
  uploadedAt: new Date().toISOString(),
  downloadUrl: 'blob:custom-file'
});
```

## 🎉 開發愉快！

開發者模式讓你可以專注於前端開發，無需擔心後端連接問題。享受快速迭代的開發體驗！ 🚀
