# 🚀 Railway 部署後設定

## 步驟 1: 取得 Railway URL
部署完成後，你會在 Railway 控制台看到類似這樣的 URL：
```
https://fastransfer-backend-production.up.railway.app
```

## 步驟 2: 設定環境變數
在 Railway 控制台的 "Variables" 頁籤添加：

```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://fasttransfer.netlify.app
```

## 步驟 3: 更新前端配置
將 Railway URL 複製下來，然後執行以下命令更新前端：

### 自動更新腳本
```powershell
# 將 YOUR_RAILWAY_URL 替換為你的實際 Railway URL
$railwayUrl = "https://your-app-name.up.railway.app"

# 更新 vite.config.ts
(Get-Content "client\vite.config.ts") -replace "https://fastransfer-backend\.onrender\.com", $railwayUrl | Set-Content "client\vite.config.ts"

# 更新 api.ts
(Get-Content "client\src\utils\api.ts") -replace "https://fastransfer-backend\.onrender\.com", $railwayUrl | Set-Content "client\src\utils\api.ts"

# 更新 socket.ts
(Get-Content "client\src\utils\socket.ts") -replace "https://fastransfer-backend\.onrender\.com", $railwayUrl | Set-Content "client\src\utils\socket.ts"

# 更新 netlify.toml
(Get-Content "netlify.toml") -replace "https://fastransfer-backend\.onrender\.com", $railwayUrl | Set-Content "netlify.toml"

Write-Host "✅ 前端配置已更新為 Railway URL: $railwayUrl"
```

## 步驟 4: 重新部署前端
```powershell
cd client
npm run build
cd ..
git add .
git commit -m "🔄 更新前端指向 Railway 後端"
git push origin main
```

## 步驟 5: 測試連接
```powershell
# 測試 Railway 後端健康檢查
Invoke-WebRequest -Uri "https://your-app-name.up.railway.app/api/health"
```

## 🎉 完成！
現在你的應用使用 Railway 後端，享受：
- ⚡ 零冷啟動延遲
- 🚀 更快的響應速度
- 💪 更穩定的連接
