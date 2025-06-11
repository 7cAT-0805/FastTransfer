# 📝 FastTransfer 更新日誌

## 🗓️ 2025年6月11日 - 多檔案上傳功能 v2.1

### ✨ 新增功能 - 多檔案上傳

#### 主要特性
- **批量選擇**: 支援一次選擇多個檔案進行上傳
- **拖拽支援**: 可同時拖拽多個檔案到上傳區域
- **檔案管理**: 提供檔案列表管理介面
- **進度顯示**: 個別檔案上傳進度條顯示

#### 功能詳情
1. **檔案選擇方式**:
   - 點擊選擇檔案（支援 `multiple` 屬性）
   - 拖拽多個檔案到上傳區域
   - 可多次添加檔案到待上傳列表

2. **檔案管理功能**:
   - 顯示已選擇檔案列表（名稱、大小、格式）
   - 個別移除檔案功能
   - 一鍵清空全部檔案
   - 添加更多檔案按鈕

3. **上傳體驗優化**:
   - 依序上傳檔案，避免服務器壓力
   - 個別檔案進度條顯示
   - 批量上傳結果統計（成功/失敗數量）
   - 上傳過程中禁用操作按鈕

4. **UI/UX 改進**:
   - 檔案列表最大高度限制，超出可滾動
   - 清晰的視覺回饋和狀態指示
   - 優化拖拽區域提示文字
   - 響應式設計適配各種屏幕

#### 技術實現
```javascript
// 多檔案選擇處理
const handleFilesSelect = (files: File[]) => {
  const validFiles = files.filter(file => {
    if (file.size > 100 * 1024 * 1024) {
      toast.error(`檔案 ${file.name} 大小不能超過 100MB`);
      return false;
    }
    return true;
  });
  
  if (validFiles.length > 0) {
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }
};

// 批量上傳處理
for (let i = 0; i < selectedFiles.length; i++) {
  const file = selectedFiles[i];
  const formData = new FormData();
  formData.append('file', file);
  formData.append('hostId', hostId);
  
  await api.post(`/rooms/${roomId}/upload`, formData, {
    onUploadProgress: (progressEvent) => {
      // 個別檔案進度更新
    }
  });
}
```

---

## 🗓️ 2025年6月11日 - 重大更新 v2.0

### ✅ 部署優化 - 內存存儲機制

#### 重大架構改變
- **原因**: 為了適應 Netlify + Heroku 部署環境
- **改變**: 從檔案系統存儲改為完全內存存儲
- **優勢**: 
  - 不依賴檔案系統，適合容器化部署
  - 消除 Heroku 暫時檔案系統的限制
  - 房主離開時立即清理，保護隱私

#### 修改內容：
1. **後端存儲機制**:
   - 使用 `multer.memoryStorage()` 代替磁盤存儲
   - 新增 `fileBuffers` Map 存儲檔案內容
   - 檔案直接存儲在內存中的 Buffer 對象

2. **清理機制優化**:
   - ❌ 移除 30分鐘自動清理機制
   - ✅ 改為房主離開房間時立即清理
   - ✅ 所有用戶被強制退出並收到通知

3. **Socket.IO 邏輯增強**:
   - 檢測房主身份 (`socket.handshake.auth.hostId`)
   - 房主離開時廣播 `roomClosed` 事件
   - 前端處理房間關閉並跳轉到首頁

#### 1. 移除 Google AdSense 相關內容
- **原因**: 目前無法申請 AdSense，移除相關代碼避免混淆
- **修改內容**:
  - 移除 `Room.tsx` 中的廣告位置組件
  - 清理 `.env.example` 中的 AdSense 環境變數
  - 更新 `USAGE.md` 移除 AdSense 整合章節
  - 更新專案概述描述

#### 2. 優化 UI 布局和高度一致性
- **問題**: 房主檢視時檔案上傳區和檔案列表高度不一致
- **解決方案**:
  - 修改 `FileUploader.tsx` 使用 `flex` 布局
  - 修改 `FileList.tsx` 使用相同的 `flex` 布局
  - 兩個組件都使用 `h-full flex flex-col` 確保高度一致
  - 優化空狀態顯示，改善用戶體驗

#### 3. 修復檔案重複顯示問題
- **問題**: 房主上傳檔案時會出現兩個，但其他人只看到一個
- **原因**: 房主同時觸發本地回調和 Socket.IO 事件
- **解決方案**:
  - 移除 `FileUploader` 的 `onFileUploaded` 屬性
  - 統一使用 Socket.IO 事件更新檔案列表
  - 避免重複添加同一檔案

#### 4. 創建技術文檔
- **新文件**: `TECHNICAL.md`
- **內容包含**:
  - 完整的技術架構說明
  - 系統運作流程詳解
  - 檔案上傳/下載機制
  - 數據存儲說明
  - 安全機制介紹
  - 部署架構說明
  - 性能優化特性
  - 擴展性考量

### 🔧 技術改進

#### 代碼質量
- 修復 TypeScript 編譯錯誤
- 移除未使用的 import 語句
- 優化組件結構和邏輯

#### 用戶體驗
- 檔案列表和上傳區高度一致
- 改善空狀態顯示
- 統一檔案更新機制

#### 文檔完善
- 技術運作說明詳細化
- 移除過時的 AdSense 相關內容
- 更新使用指南

### 📁 新的檔案存儲機制

#### 存儲位置說明
```javascript
// 內存中的三層 Map 結構：

1. rooms (房間基本信息)
   └── 'A1B2C3D4' → { id, hostId, participants, createdAt }

2. roomFiles (檔案元數據) 
   └── 'A1B2C3D4' → [{ id, originalName, filename, size, mimetype }]

3. fileBuffers (檔案內容)
   └── 'A1B2C3D4' → Map { 
       'file-uuid' → { buffer, originalName, mimetype }
   }
```

#### 檔案生命週期
1. **上傳**: 檔案存儲到內存 Buffer
2. **標識**: 使用 UUID 作為檔案唯一識別
3. **存取**: 通過內存 Map 快速訪問
4. **清理**: 房主離開時立即清除所有相關數據

#### 部署優勢
- ✅ **Netlify 相容**: 前端純靜態，無後端依賴
- ✅ **Heroku 友好**: 不依賴檔案系統持久化
- ✅ **內存高效**: 直接 Buffer 操作，無 I/O 開銷
- ✅ **即時清理**: 房主離開立即釋放內存

### 🔄 系統運作流程

#### 房間創建
1. 用戶點擊「創建新房間」
2. 後端生成 8 位房間代碼 (如: `387855AC`)
3. 創建對應的檔案目錄 `uploads/387855AC/`
4. 生成房主 UUID 並存儲在瀏覽器 localStorage
5. 用戶跳轉到房間頁面

#### 檔案上傳
1. 房主選擇檔案 (拖拽或點擊)
2. 前端驗證檔案大小 (≤100MB)
3. 使用 FormData 發送 POST 請求到 `/api/rooms/[ROOM_ID]/upload`
4. 後端使用 Multer 處理檔案上傳
5. 檔案保存到 `uploads/[ROOM_ID]/[TIMESTAMP]-[FILENAME]`
6. Socket.IO 廣播 `fileUploaded` 事件
7. 所有客戶端即時更新檔案列表

#### 檔案下載
1. 用戶點擊下載按鈕
2. 前端建立下載連結 `/api/rooms/[ROOM_ID]/files/[FILENAME]`
3. 後端驗證房間和檔案存在性
4. 使用 `res.download()` 傳送檔案
5. 瀏覽器開始下載檔案

#### 自動清理
1. 每個房間設置 30 分鐘過期時間
2. 後端每 5 分鐘檢查過期房間
3. 自動刪除過期房間的檔案目錄
4. 清除內存中的房間記錄

### 🚀 部署狀態

#### 開發環境 ✅
- 前端: http://localhost:5173
- 後端: http://localhost:3001
- 檔案存儲: 本地 `uploads/` 目錄

#### 生產環境準備 🔄
- 前端: 準備部署到 Netlify
- 後端: 準備部署到 Heroku
- 檔案存儲: Heroku 暫時檔案系統

### 📋 待辦事項

#### 短期目標
- [ ] 完成生產環境部署測試
- [ ] 添加檔案預覽功能
- [ ] 優化大檔案上傳體驗
- [ ] 添加上傳進度顯示

#### 長期目標
- [ ] 實現檔案加密功能
- [ ] 添加批量檔案操作
- [ ] 集成雲端存儲服務
- [ ] 開發移動應用版本

---

## 🎉 更新完成！

FastTransfer 檔案傳輸網站現已完成重大更新，具備：
- ✨ 清爽的無廣告界面
- 🎨 一致的UI布局設計
- 🔧 穩定的檔案上傳機制
- 📚 完整的技術文檔

**立即體驗**: http://localhost:5173
