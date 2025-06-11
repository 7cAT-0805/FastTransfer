# 🌟 Glitch 部署教學 (備用方案)

## 適合場景
- Render 無法使用時的備案
- 想要線上編輯代碼
- 快速原型測試

## 🚀 部署步驟

### 步驟1: 前往 Glitch
1. 前往 [glitch.com](https://glitch.com)
2. 用 GitHub 帳號登入

### 步驟2: Import 專案
1. 點擊 "New Project"
2. 選擇 "Import from GitHub"
3. 輸入：`https://github.com/你的用戶名/FastTransfer`
4. 等待 Import 完成

### 步驟3: 配置專案
1. 在 Glitch 編輯器中
2. 編輯 `glitch.json` (如果沒有就創建)：
```json
{
  "install": "cd server && npm install",
  "start": "cd server && npm start",
  "watch": {
    "ignore": ["client/"]
  }
}
```

### 步驟4: 環境變數
1. 點擊左側的 🔒 ".env"
2. 添加：
```
NODE_ENV=production
CORS_ORIGIN=https://fasttransfer.netlify.app
```

### 步驟5: 測試
- Glitch 會自動部署
- 你的 API 網址：`https://你的專案名.glitch.me`

## ⚠️ Glitch 限制
- 5分鐘無活動後休眠
- 每小時 4000 次請求限制
- 磁碟空間限制
- 但完全免費！

---

# 🔥 Cyclic 部署教學 (另一個免費選項)

## 🚀 部署步驟

### 步驟1: 註冊 Cyclic
1. 前往 [cyclic.sh](https://www.cyclic.sh)
2. 用 GitHub 登入

### 步驟2: 部署應用
1. 點擊 "Deploy Now"
2. 選擇你的 `FastTransfer` 倉庫
3. 等待自動部署

### 步驟3: 配置
- Cyclic 會自動檢測 Node.js 專案
- 自動安裝依賴
- 自動啟動服務

### 步驟4: 環境變數
在 Cyclic 控制台設定：
```
NODE_ENV=production
CORS_ORIGIN=https://fasttransfer.netlify.app
```

## ✅ Cyclic 優點
- 無休眠限制
- 自動 HTTPS
- 簡單設定
- 完全免費

---

# 📊 免費平台比較

| 平台 | 免費額度 | 休眠 | WebSocket | 設定難度 |
|------|----------|------|-----------|----------|
| **Render** | 750h/月 | 15分鐘 | ✅ | 簡單 |
| **Glitch** | 無限制 | 5分鐘 | ✅ | 最簡單 |
| **Cyclic** | 無限制 | 無 | ✅ | 簡單 |
| **Railway** | $5額度 | 無 | ✅ | 簡單 |

## 🎯 我的建議

1. **首選**: Render (最穩定)
2. **備案**: Cyclic (無休眠)
3. **測試**: Glitch (最快設定)
