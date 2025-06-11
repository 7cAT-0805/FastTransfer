# 🚀 快速部署後端到 Railway

## 步驟1: 創建 Railway 帳號
1. 前往 [Railway](https://railway.app)
2. 使用 GitHub 帳號註冊登入

## 步驟2: 部署後端
1. 點擊 "New Project"
2. 選擇 "Deploy from GitHub repo"
3. 選擇你的 `FastTransfer` 倉庫
4. Railway 會自動檢測到 Node.js 專案

## 步驟3: 配置環境變數
在 Railway 專案設定中添加：
```
NODE_ENV=production
CORS_ORIGIN=https://fasttransfer.netlify.app
```

## 步驟4: 設定服務配置
確保 Railway 使用正確的啟動命令：
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## 步驟5: 取得 API URL
部署完成後，Railway 會提供一個 URL，類似：
`https://fastransfer-backend-production-xxxx.up.railway.app`

## 步驟6: 更新前端配置
將這個 URL 添加到 Netlify 的環境變數中。

---

**預計部署時間**: 5-10 分鐘
**費用**: 免費額度足夠個人使用
