# 🚀 FastTransfer 快速使用指南

## 🎯 專案概述

FastTransfer 是一個現代化的即時檔案傳輸網站，讓用戶能夠：
- ✅ 創建臨時房間並上傳檔案
- ✅ 分享房間代碼供他人下載
- ✅ 支援所有檔案格式（最大100MB）
- ✅ 房主離開時自動清理確保隱私
- ✅ 響應式設計，支援手機和電腦
- ✅ 現代化UI設計，操作直觀簡單
- ✅ 內存存儲，適合雲端部署

## 🛠️ 快速開始

### 方法一：使用一鍵啟動腳本
```bash
# Windows用戶直接雙擊執行
start-dev.bat
```

### 方法二：手動啟動
```bash
# 1. 安裝所有依賴
npm run setup

# 2. 啟動開發服務器（自動同時啟動前後端）
npm run dev

# 或者分別啟動
npm run server:dev  # 啟動後端 (localhost:3001)
npm run client:dev  # 啟動前端 (localhost:5173)
```

## 🌐 訪問網站

開發環境：
- **前端**: http://localhost:5173
- **後端API**: http://localhost:3001

## 📱 功能測試

### 1. 創建房間
1. 打開 http://localhost:5173
2. 點擊「創建新房間」
3. 系統會生成一個8位數的房間代碼
4. 房主可以上傳檔案

### 2. 加入房間
1. 在首頁輸入房間代碼
2. 點擊「加入房間」
3. 可以查看和下載檔案

### 3. 檔案上傳
#### 支援多檔案上傳
- **拖拽上傳**: 可同時拖拽多個檔案到上傳區域
- **點擊選擇**: 支援選擇多個檔案（按住 Ctrl/Cmd 多選）
- **檔案管理**: 
  - 顯示已選檔案列表
  - 個別移除不需要的檔案
  - 一鍵清空全部檔案
  - 添加更多檔案到列表
- **批量上傳**: 一次上傳所有選中的檔案
- **進度顯示**: 每個檔案獨立的上傳進度條
- **格式支援**: 支援所有格式，單檔案最大100MB
- **上傳統計**: 顯示成功/失敗檔案數量

#### 上傳步驟
1. 拖拽檔案或點擊選擇檔案（可多選）
2. 查看檔案列表，移除不需要的檔案
3. 點擊「上傳全部檔案」開始批量上傳
4. 查看上傳進度和結果統計

## 🎨 UI特色

- **現代化設計**: 使用Tailwind CSS製作的美觀界面
- **響應式布局**: 完美適配各種設備
- **直觀操作**: 簡單易懂的使用流程
- **即時通知**: Toast提示用戶操作結果
- **Icon豐富**: 使用Lucide React圖標庫

## 🔧 技術架構

### 前端
- **React 18** + **TypeScript**
- **Vite** 作為建置工具
- **Tailwind CSS** 樣式框架
- **Socket.IO Client** 即時通訊
- **React Router** 路由管理
- **React Hot Toast** 通知組件

### 後端
- **Node.js** + **Express**
- **Socket.IO** 即時通訊
- **Multer** 檔案上傳處理
- **CORS** 跨域請求支援
- **Helmet** 安全性中間件
- **Express Rate Limit** 速率限制

## 📁 專案結構

```
fastransfer/
├── 📄 README.md           # 專案說明
├── 📄 DEPLOYMENT.md       # 部署指南
├── 📄 USAGE.md           # 使用指南（本檔案）
├── 📄 start-dev.bat      # 開發環境啟動腳本
├── 📄 package.json       # 主要專案配置
├── 📁 client/             # 前端專案
│   ├── 📄 index.html     # HTML模板
│   ├── 📄 package.json   # 前端依賴
│   ├── 📄 vite.config.ts # Vite配置
│   ├── 📄 tailwind.config.js # Tailwind配置
│   └── 📁 src/
│       ├── 📄 App.tsx    # 主應用組件
│       ├── 📄 main.tsx   # 應用入口
│       ├── 📁 components/ # 可複用組件
│       ├── 📁 pages/     # 頁面組件
│       ├── 📁 types/     # TypeScript類型
│       └── 📁 utils/     # 工具函數
└── 📁 server/            # 後端專案
    ├── 📄 index.js       # 服務器主檔案
    └── 📄 package.json   # 後端依賴
```

## 🔐 環境變數配置

### 前端 (client/.env)
```bash
VITE_API_URL=http://localhost:3001
```

### 後端 (.env)
```bash
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=100MB
JWT_SECRET=your-secret-key
```

## 🚀 部署準備

### 1. GitHub推送
```bash
git init
git add .
git commit -m "Initial commit: FastTransfer 檔案傳輸網站"
git remote add origin https://github.com/your-username/fastransfer.git
git push -u origin main
```

### 2. Netlify前端部署
- 連接GitHub儲存庫
- 建置命令: `npm run build`
- 發布目錄: `client/dist`

### 3. Heroku後端部署
```bash
heroku create your-app-backend
git subtree push --prefix server heroku main
```

## 🛡️ 安全性功能

- ✅ HTTPS加密傳輸
- ✅ CORS跨域保護  
- ✅ 速率限制防濫用
- ✅ 檔案大小限制
- ✅ 自動檔案清理
- ✅ 房間過期機制

## 📞 故障排除

### 常見問題

1. **端口被占用**
   ```bash
   # 檢查端口使用情況
   netstat -ano | findstr :3001
   netstat -ano | findstr :5173
   ```

2. **依賴安裝失敗**
   ```bash
   # 清除npm緩存
   npm cache clean --force
   # 重新安裝
   npm run setup
   ```

3. **Socket連接失敗**
   - 檢查防火牆設定
   - 確認後端服務器運行中
   - 檢查CORS配置

4. **檔案上傳失敗**
   - 檢查檔案大小（<100MB）
   - 確認uploads目錄權限
   - 檢查磁盤空間

### 日誌查看
```bash
# 後端日誌
cd server && npm run dev

# 前端開發工具
F12 -> Console
```

## 🔄 更新和維護

### 更新依賴
```bash
# 檢查過期依賴
npm outdated

# 更新依賴
npm update
```

### 性能監控
- 使用Google Analytics追蹤使用情況
- 監控伺服器資源使用
- 定期檢查錯誤日誌

## 💡 擴展功能建議

### 短期
- [ ] 檔案預覽功能
- [ ] 批量檔案上傳
- [ ] 自定義房間名稱
- [ ] 檔案密碼保護

### 長期
- [ ] 用戶帳戶系統
- [ ] 檔案版本控制
- [ ] 協作編輯功能
- [ ] 移動App開發

---

## 🎉 享受使用 FastTransfer！

如有任何問題或建議，歡迎在GitHub Issues中反饋。

**立即開始體驗快速檔案傳輸的便利！** 🚀
