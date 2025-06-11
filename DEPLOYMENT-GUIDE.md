# FastTransfer 部署教學

這份教學將引導您如何將 FastTransfer 項目上傳到 GitHub 並部署到 Netlify。

## 📋 前置準備

### 1. 註冊必要帳號
- [GitHub 帳號](https://github.com)
- [Netlify 帳號](https://netlify.com)

### 2. 安裝 Git
- 下載並安裝 [Git for Windows](https://git-scm.com/download/win)
- 安裝後重啟命令提示字元

## 🚀 步驟一：配置 Git

打開 PowerShell 或命令提示字元，執行以下命令：

```bash
# 設置您的 Git 用戶名（替換為您的真實姓名）
git config --global user.name "您的姓名"

# 設置您的 Git 郵箱（替換為您的 GitHub 郵箱）
git config --global user.email "your-email@example.com"
```

## 📂 步驟二：初始化 Git 倉庫

```bash
# 切換到項目目錄
cd d:\fastransfer

# 初始化 Git 倉庫
git init

# 添加所有文件到暫存區
git add .

# 創建第一次提交
git commit -m "Initial commit: FastTransfer 檔案傳輸網站"
```

## 🌐 步驟三：創建 GitHub 倉庫

### 方法一：透過 GitHub 網站創建

1. 登入 [GitHub](https://github.com)
2. 點擊右上角的 "+" 號
3. 選擇 "New repository"
4. 填寫倉庫信息：
   - **Repository name**: `fastransfer`
   - **Description**: `快速檔案傳輸網站 - 支援即時檔案分享的現代化平台`
   - **Visibility**: 選擇 Public 或 Private
   - **不要勾選** "Add a README file"（因為我們已經有了）
5. 點擊 "Create repository"

### 方法二：使用 GitHub CLI（需先安裝）

```bash
# 安裝 GitHub CLI
winget install --id GitHub.cli

# 登入 GitHub
gh auth login

# 創建倉庫
gh repo create fastransfer --public --description "快速檔案傳輸網站"
```

## 📤 步驟四：上傳代碼到 GitHub

GitHub 創建完成後，會顯示類似以下的命令。請複製並執行：

```bash
# 添加遠程倉庫（替換 YOUR_USERNAME 為您的 GitHub 用戶名）
git remote add origin https://github.com/YOUR_USERNAME/fastransfer.git

# 將代碼推送到 GitHub
git branch -M main
git push -u origin main
```

## 🚀 步驟五：部署到 Netlify

### 5.1 透過 GitHub 連接

1. 登入 [Netlify](https://netlify.com)
2. 點擊 "New site from Git"
3. 選擇 "GitHub"
4. 授權 Netlify 存取您的 GitHub
5. 選擇您剛創建的 `fastransfer` 倉庫

### 5.2 配置建置設置

在 Netlify 的建置設置中填入：

- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `client/dist`

### 5.3 設置環境變數

1. 在 Netlify 專案設置中，找到 "Environment variables"
2. 添加以下變數：

```
NODE_ENV=production
VITE_API_URL=https://your-backend-url.herokuapp.com
```

## 🔧 步驟六：後端部署（可選）

如果您需要部署後端，推薦使用 Heroku：

### 6.1 安裝 Heroku CLI

```bash
# 下載並安裝 Heroku CLI
# 網址：https://devcenter.heroku.com/articles/heroku-cli
```

### 6.2 部署後端

```bash
# 登入 Heroku
heroku login

# 創建 Heroku 應用
heroku create your-app-name-backend

# 設置 buildpack（因為是 monorepo）
heroku buildpacks:set heroku/nodejs

# 添加設定檔，告訴 Heroku 只建置 server 目錄
echo "web: cd server && npm start" > Procfile

# 推送到 Heroku
git push heroku main
```

## 📝 步驟七：更新前端 API 設定

更新前端的 API URL 指向您的 Heroku 後端：

1. 在 `client/.env` 中設置：
```
VITE_API_URL=https://your-app-name-backend.herokuapp.com
```

2. 推送更新到 GitHub：
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

## ✅ 完成！

您的 FastTransfer 網站現在應該已經成功部署了！

### 訪問您的網站
- **前端**: https://your-site-name.netlify.app
- **後端**: https://your-app-name-backend.herokuapp.com

### 監控和維護
- 在 Netlify 儀表板監控前端狀態
- 在 Heroku 儀表板監控後端狀態
- GitHub 會自動觸發重新部署當您推送新代碼時

## 🔄 日常更新流程

當您修改代碼後，使用以下命令更新：

```bash
# 添加變更
git add .

# 提交變更
git commit -m "描述您的變更"

# 推送到 GitHub（自動觸發 Netlify 重新部署）
git push origin main
```

## ❗ 故障排除

### 常見問題

1. **建置失敗**：檢查 Netlify 的建置日誌
2. **API 連接問題**：確認後端 URL 設置正確
3. **環境變數問題**：確認所有必要的環境變數都已設置

### 有用的命令

```bash
# 檢查 Git 狀態
git status

# 查看提交歷史
git log --oneline

# 查看遠程倉庫
git remote -v
```

---

🎉 **恭喜！您已經成功將 FastTransfer 部署到雲端！**
