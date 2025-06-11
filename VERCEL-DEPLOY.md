# 🎯 最簡單的部署方案

## 使用 Vercel（支持全端）

Vercel 比 Netlify 更適合全端應用！

### 步驟1: 部署到 Vercel
1. 前往 [Vercel](https://vercel.com)
2. 用 GitHub 登入
3. Import 你的 `FastTransfer` 倉庫
4. Vercel 會自動檢測並部署

### 步驟2: 配置設定
Vercel 會自動：
- 部署前端到全球 CDN
- 將 `server` 資料夾的 API 轉為 Serverless Functions
- 支援 WebSocket 連接

### 步驟3: 環境變數
```
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

### 結果
✅ 一個 URL 搞定前後端
✅ 自動 HTTPS
✅ 全球 CDN
✅ 支援 WebSocket
✅ 免費額度充足

**部署時間**: 5分鐘
**管理複雜度**: 最低
