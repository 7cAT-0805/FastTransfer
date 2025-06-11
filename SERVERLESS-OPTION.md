# 🌐 Netlify 全端部署方案

## 方案概述
將後端重構為 Netlify Functions (Serverless)，實現真正的全端 Netlify 部署。

## 優點
✅ 完全在 Netlify 部署，管理簡單
✅ 自動擴縮容，成本效益高  
✅ 無需管理伺服器
✅ 內建 CDN 加速

## 缺點
⚠️ 需要重構即時功能（WebSocket → 輪詢）
⚠️ 檔案存儲需要外部服務（如 Cloudinary）
⚠️ 開發複雜度稍高

## 實作步驟

### 1. 創建 Netlify Functions
```bash
mkdir netlify/functions
```

### 2. 重構 API 端點
- `/api/rooms` → `netlify/functions/rooms.js`
- `/api/upload` → `netlify/functions/upload.js`
- `/api/download` → `netlify/functions/download.js`

### 3. 替換 WebSocket
- 使用定時輪詢檢查房間狀態
- 或使用 Netlify 的 Server-Sent Events

### 4. 檔案存儲
- 整合 Cloudinary 或 AWS S3
- 或使用 Firebase Storage

## 預估改造時間
📅 2-3 小時重構工作
