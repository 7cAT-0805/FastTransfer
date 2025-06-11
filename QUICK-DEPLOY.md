# 🚀 快速部署指南

5 分鐘內將 FastTransfer 上傳到 GitHub 並部署到 Netlify！

## ⚡ 超快速版本

### 1️⃣ 配置 Git（一次性設置）
```bash
git config --global user.name "您的姓名"
git config --global user.email "your-email@example.com"
```

### 2️⃣ 上傳到 GitHub
```bash
cd d:\fastransfer
git init
git add .
git commit -m "Initial commit"
```

### 3️⃣ 創建 GitHub 倉庫
1. 前往 [github.com](https://github.com)
2. 點擊 "New repository"
3. 名稱：`fastransfer`
4. 點擊 "Create repository"

### 4️⃣ 推送代碼
```bash
git remote add origin https://github.com/您的用戶名/fastransfer.git
git branch -M main
git push -u origin main
```

### 5️⃣ 部署到 Netlify
1. 前往 [netlify.com](https://netlify.com)
2. 點擊 "New site from Git"
3. 選擇 GitHub，授權連接
4. 選擇 `fastransfer` 倉庫
5. 設置：
   - Build command: `npm run build`
   - Publish directory: `client/dist`
6. 點擊 "Deploy site"

## 🎉 完成！

您的網站將在幾分鐘內上線，Netlify 會提供一個類似 `https://amazing-name-123456.netlify.app` 的網址。

---

💡 **小貼士**: 每次修改代碼後，只需要 `git add . && git commit -m "更新" && git push` 即可自動重新部署！
