# FastTransfer - 快速檔案傳輸網站

一個現代化的即時檔案傳輸平台，讓用戶可以創建房間並安全地分享檔案。

## 功能特色

- 🚀 即時檔案傳輸
- 📁 多檔案批量上傳支援
- 🏠 房間創建與管理
- 🔒 安全的檔案分享
- 📱 響應式設計
- ⚡ 房主離開即時清理機制
- 💾 內存存儲系統（適合雲端部署）
- 🎯 拖拽上傳與進度顯示
- ✅ 修復在線人數計算問題
- ✅ 修復檔案重複上傳問題

## 快速開始

### 安裝依賴
```bash
npm run setup
```

### 開發模式
```bash
npm run dev
```

### 建置專案
```bash
npm run build
```

### 測試功能
```bash
# 測試多檔案上傳功能
npm run test:multi-upload

# 測試房主離開功能
npm run test:host-leave
```

## 部署

### 📤 上傳到 GitHub

#### 1. 初始化 Git（首次使用）
```bash
# 配置 Git 用戶信息
git config --global user.name "您的姓名"
git config --global user.email "your-email@example.com"

# 初始化 Git 倉庫
cd d:\fastransfer
git init
git add .
git commit -m "Initial commit: FastTransfer 檔案傳輸網站"
```

#### 2. 創建 GitHub 倉庫
1. 前往 [GitHub](https://github.com) 並登入
2. 點擊右上角 "+" → "New repository"
3. 填寫：
   - Repository name: `FastTransfer`
   - Description: `快速檔案傳輸網站`
   - 選擇 Public 或 Private
4. **不要勾選** "Add a README file"
5. 點擊 "Create repository"

#### 3. 推送代碼到 GitHub
```bash
# 添加遠程倉庫（替換 YOUR_USERNAME 為您的 GitHub 用戶名）
git remote add origin https://github.com/YOUR_USERNAME/FastTransfer.git
git branch -M main
git push -u origin main
```

### 🌐 部署到 Netlify

#### 1. 連接 GitHub
1. 前往 [Netlify](https://netlify.com) 並登入
2. 點擊 "New site from Git"
3. 選擇 "GitHub" 並授權連接
4. 選擇您的 `fastransfer` 倉庫

#### 2. 配置建置設定
- **Build command**: `npm run build`
- **Publish directory**: `client/dist`
- **Node version**: 18 或以上

#### 3. 環境變數設定
在 Netlify 的 Site settings → Environment variables 中添加：
```
VITE_API_URL=https://your-backend-url.herokuapp.com
```

#### 4. 完成部署
點擊 "Deploy site"，幾分鐘後您的網站就會上線！

### 🔄 日常更新
每次修改代碼後，只需執行：
```bash
git add .
git commit -m "描述您的更改"
git push origin main
```
Netlify 會自動重新部署您的網站。

🚀 **想要更詳細的說明？** 

- 📖 [完整部署教學](./DEPLOYMENT-GUIDE.md) - 詳細的 GitHub + Netlify 部署指南
- ⚡ [5分鐘快速部署](./QUICK-DEPLOY.md) - 超快速版本

## 環境變數

複製 `.env.example` 為 `.env` 並填入您的配置：

```bash
cp .env.example .env
```

## 技術棧

- **前端**: React + TypeScript + Vite
- **後端**: Node.js + Express + Socket.IO
- **樣式**: Tailwind CSS
- **部署**: Netlify + Heroku

## 許可證

MIT License
