# 🚀 Render 免費後端部署完整指南

## 🔧 修正建置錯誤

如果遇到 `Unknown command: "installnpm"` 錯誤，這是因為建置命令格式問題。

## 📋 正確的部署步驟

### 步驟1: 前往 Render 部署
1. 前往 [Render.com](https://render.com)
2. 用 GitHub 帳號註冊/登入
3. 點擊 "New +" → "Web Service"
4. 連接你的 GitHub 帳號
5. 選擇 `FastTransfer` 倉庫

### 步驟2: 配置設定 (重要！)
```
Name: fastransfer-backend
Environment: Node
Region: 選擇離你最近的區域

Build & Deploy:
✅ Root Directory: server
✅ Build Command: npm install
✅ Start Command: npm start

Instance Type: Free ($0/month)
```

### 步驟3: 環境變數設定
點擊 "Advanced" 添加環境變數：
```
NODE_ENV = production
CORS_ORIGIN = https://your-frontend-url.vercel.app
```

### 步驟4: 部署
1. 點擊 "Create Web Service"
2. 等待 5-10 分鐘部署完成
3. 複製提供的 URL（例如：`https://fastransfer-backend.onrender.com`）

## 🔄 如果遇到問題

### 問題1: 建置失敗
- 確保 Root Directory 設為 `server`
- 確保 Build Command 是 `npm install`（不要加 cd 命令）

### 問題2: 啟動失敗
- 檢查 Start Command 是 `npm start`
- 確保環境變數正確設定

### 問題3: CORS 錯誤
- 在環境變數中正確設定前端 URL
- 格式：`https://your-app.vercel.app`（不要尾隨斜線）

## ✅ 成功部署後
1. 複製後端 URL
2. 在前端（Vercel）設定環境變數：
   ```
   VITE_API_URL = https://your-backend.onrender.com
   ```
3. 重新部署前端

## 💡 免費版限制
- 15分鐘無活動後會休眠
- 重新啟動需要 30-60 秒
- 每月 750 小時免費使用時間

## 🆘 故障排除
如果部署失敗，檢查 Render 控制台的建置日誌：
1. 進入你的服務頁面
2. 點擊 "Logs" 標籤
3. 查看錯誤訊息並修正
