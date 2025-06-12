# 🚀 Railway 部署指南

## ✨ 為什麼選擇 Railway？

- ✅ **無冷啟動延遲** - 幾乎瞬間啟動
- ✅ **500小時/月免費額度** - 比 Render 更穩定
- ✅ **完美支援 WebSocket** - Socket.IO 零問題
- ✅ **自動 HTTPS** - 安全連接
- ✅ **簡單易用** - 一鍵部署

## 🎯 快速部署步驟

### 1. 註冊 Railway
1. 前往 [railway.app](https://railway.app)
2. 用 GitHub 帳號登入
3. 選擇 "Start a New Project"

### 2. 部署後端
1. 選擇 **"Deploy from GitHub repo"**
2. 選擇你的 `FastTransfer` 倉庫
3. Railway 會自動檢測 `railway.json` 配置
4. 點擊 **"Deploy"**

### 3. 設定環境變數
部署完成後，在 Railway 控制台設定：

```bash
# 必要環境變數
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://fasttransfer.netlify.app

# 可選環境變數
MAX_FILE_SIZE=50MB
UPLOAD_LIMIT=10
```

### 4. 取得 Railway URL
部署完成後，你會得到類似這樣的 URL：
```
https://fastransfer-backend-production.up.railway.app
```

### 5. 更新前端配置
複製 Railway URL，然後更新前端：

## 🔧 自動更新前端配置

讓我為你自動更新前端指向 Railway：

### Railway URL 格式
通常是：`https://[你的應用名稱].up.railway.app`

## 🚀 Railway 優勢

| 特性 | Railway | Render | Fly.io |
|------|---------|--------|--------|
| 冷啟動延遲 | ✅ 幾乎沒有 | ❌ 15-30秒 | ✅ 很少 |
| 免費額度 | ✅ 500小時/月 | ⚖️ 750小時/月 | ⚖️ 有限制 |
| WebSocket | ✅ 完美 | ✅ 有延遲 | ✅ 良好 |
| 設定難度 | ✅ 超簡單 | ⚖️ 中等 | ❌ 複雜 |
| 部署速度 | ✅ 極快 | ⚖️ 普通 | ⚖️ 中等 |

## 🔍 監控和除錯

### Railway 控制台功能：
- 📊 **即時日誌** - 查看應用運行狀態
- 📈 **資源監控** - CPU、記憶體使用率
- 🔧 **環境變數管理** - 一鍵修改設定
- 🔄 **自動重啟** - 應用異常時自動恢復

## 🆘 常見問題

### Q: 如何查看日誌？
在 Railway 控制台點擊你的服務，選擇 "Logs" 頁籤

### Q: 如何設定自定義域名？
在 "Settings" → "Domains" 中添加你的域名

### Q: 如何擴展資源？
Railway 會自動擴展，超過免費額度時會提示升級

## 🎉 部署完成後

1. **測試連接**：訪問 `https://你的railway網址/api/health`
2. **更新前端**：修改 API 配置指向新的 Railway URL
3. **測試功能**：創建房間、上傳檔案、Socket.IO 連接

## 💡 小提示

- Railway 提供 **PostgreSQL** 和 **Redis** 免費額度，未來可以擴展功能
- 可以連接 **GitHub** 實現自動部署
- 支援多種程式語言和框架
- 有活躍的社群和文檔
