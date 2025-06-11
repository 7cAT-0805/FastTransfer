# 🎯 Render 免費部署教學 (推薦)

## 為什麼選擇 Render？
- ✅ **完全免費** - Web Service 永久免費
- ✅ **支援 Socket.IO** - 你的即時功能需要這個
- ✅ **簡單設定** - 5分鐘完成部署
- ✅ **自動部署** - Git push 自動更新

## 🚀 部署步驟

### 步驟1: 註冊 Render
1. 前往 [render.com](https://render.com)
2. 點擊 "Get Started for Free"
3. 選擇 "GitHub" 登入

### 步驟2: 創建 Web Service
1. 點擊 "New +"
2. 選擇 "Web Service"
3. 連接你的 GitHub 帳號
4. 選擇 `FastTransfer` 倉庫

### 步驟3: 配置設定
```
Name: fastransfer-backend
Region: Oregon (US West)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 步驟4: 環境變數
在 "Environment" 區域添加：
```
NODE_ENV=production
CORS_ORIGIN=https://fasttransfer.netlify.app
PORT=10000
```

### 步驟5: 選擇計劃
- 選擇 **"Free"** 計劃
- 點擊 "Create Web Service"

### 步驟6: 等待部署
- 部署需要 2-3 分鐘
- 完成後你會得到一個 URL，例如：
  `https://fastransfer-backend.onrender.com`

## 🔗 連接前端

### 在 Netlify 設定環境變數：
```
VITE_API_URL=https://fastransfer-backend.onrender.com
```

### 或者在本地測試：
```bash
# 在 client/.env 文件中
VITE_API_URL=https://fastransfer-backend.onrender.com
```

## ⚠️ 重要注意事項

### 免費版限制：
- **休眠機制**: 15分鐘無活動後會休眠
- **喚醒時間**: 第一次訪問需要 30-60 秒喚醒
- **記憶體**: 512MB RAM
- **運行時間**: 750 小時/月 (足夠個人使用)

### 解決休眠問題：
可以使用 cron 服務定期訪問你的 API 保持活躍，例如：
- [UptimeRobot](https://uptimerobot.com) (免費)
- [Pingdom](https://www.pingdom.com) (有免費版)

## 🎉 完成！

部署完成後：
1. 複製 Render 給你的 URL
2. 在 Netlify 設定 `VITE_API_URL` 環境變數
3. 重新部署 Netlify 前端
4. 測試檔案上傳功能

**總部署時間**: 約 10 分鐘
**總成本**: $0 💰
