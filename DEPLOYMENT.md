# FastTransfer 部署指南

## 📋 部署前準備

### 1. 環境變數設定

#### 後端環境變數 (.env)
```bash
PORT=3001
NODE_ENV=production
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads
JWT_SECRET=your_very_secure_jwt_secret_here
CORS_ORIGIN=https://your-netlify-app.netlify.app
```

#### 前端環境變數 (client/.env)
```bash
VITE_API_URL=https://your-backend-server.herokuapp.com
VITE_GOOGLE_ANALYTICS_ID=G-your-analytics-id
```

## 🚀 一鍵部署流程

### 步驟 1: 推送至 GitHub
```bash
# 初始化 git 儲存庫
git init
git add .
git commit -m "Initial commit: FastTransfer 檔案傳輸網站"

# 推送至 GitHub
git remote add origin https://github.com/your-username/fastransfer.git
git branch -M main
git push -u origin main
```

### 步驟 2: 部署後端至 Heroku
1. 註冊 [Heroku](https://heroku.com) 帳戶
2. 安裝 Heroku CLI
3. 執行以下指令：

```bash
# 登入 Heroku
heroku login

# 創建應用程式
heroku create your-app-name-backend

# 設定環境變數
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_very_secure_jwt_secret
heroku config:set CORS_ORIGIN=https://your-netlify-app.netlify.app

# 部署
git subtree push --prefix server heroku main
```

### 步驟 3: 部署前端至 Netlify
1. 登入 [Netlify](https://netlify.com)
2. 點擊 "New site from Git"
3. 連接您的 GitHub 儲存庫
4. 設定建置參數：
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
   - **Base directory**: (留空)

5. 設定環境變數：
   - `VITE_API_URL`: `https://your-heroku-app.herokuapp.com`
   - `VITE_GOOGLE_ANALYTICS_ID`: `G-your-analytics-id`

6. 點擊 "Deploy site"

### 步驟 4: 更新 CORS 設定
部署完成後，更新 Heroku 上的 CORS_ORIGIN 環境變數：
```bash
heroku config:set CORS_ORIGIN=https://your-actual-netlify-url.netlify.app
```

## 🔧 本地開發

### 安裝依賴
```bash
npm run setup
```

### 啟動開發服務器
```bash
npm run dev
```

### 建置專案
```bash
npm run build
```

## 📁 檔案結構
```
fastransfer/
├── client/                 # 前端 React 應用
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/         # 頁面組件
│   │   ├── types/         # TypeScript 類型
│   │   └── utils/         # 工具函數
│   └── dist/              # 建置輸出
├── server/                # 後端 Node.js 服務
│   ├── index.js          # 主要服務器文件
│   └── uploads/          # 檔案上傳目錄
├── netlify.toml          # Netlify 配置
├── Procfile              # Heroku 配置
└── README.md
```

## 🛡️ 安全性注意事項

1. **環境變數**: 絕不要將敏感資訊提交到 git
2. **CORS**: 確保正確設定 CORS 來源
3. **檔案大小**: 限制上傳檔案大小防止濫用
4. **速率限制**: 已內建 API 速率限制
5. **自動清理**: 檔案 30 分鐘後自動刪除

## 📈 Google AdSense 最佳化

1. 確保網站有足夠的原創內容
2. 添加隱私政策和使用條款（已包含）
3. 確保網站載入速度良好
4. 提供良好的使用者體驗
5. 遵守 AdSense 政策

## 🆘 故障排除

### 常見問題
1. **CORS 錯誤**: 檢查後端 CORS_ORIGIN 設定
2. **檔案上傳失敗**: 檢查檔案大小和格式
3. **Socket 連接失敗**: 檢查防火牆設定
4. **AdSense 未顯示**: 確認 AdSense 代碼正確且已審核通過

### 監控和日誌
- Heroku: `heroku logs --tail`
- Netlify: 在 Netlify 控制台查看建置日誌

## 📞 技術支援

如有問題，請檢查：
1. 環境變數是否正確設定
2. API 端點是否可訪問
3. 建置過程是否成功
4. 網路連接是否正常

---

**恭喜！您的 FastTransfer 檔案傳輸網站現在已經準備好部署了！** 🎉
