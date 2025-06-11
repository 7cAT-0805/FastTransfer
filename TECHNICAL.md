# 🔧 FastTransfer 技術運作說明

## 📋 專案概述

FastTransfer 是一個基於 **React + Node.js** 的即時檔案傳輸網站，使用現代化的網頁技術實現安全、快速的檔案分享功能。

## 🏗️ 技術架構

### 前端架構 (React + TypeScript)
```
client/
├── src/
│   ├── components/          # 可複用組件
│   │   ├── FileUploader.tsx # 檔案上傳組件
│   │   ├── FileList.tsx     # 檔案列表組件
│   │   └── Layout.tsx       # 頁面布局組件
│   ├── pages/               # 頁面組件
│   │   ├── Home.tsx         # 首頁 - 創建/加入房間
│   │   ├── Room.tsx         # 房間頁面 - 檔案管理
│   │   ├── Privacy.tsx      # 隱私政策
│   │   └── Terms.tsx        # 使用條款
│   ├── utils/               # 工具函數
│   │   ├── api.ts           # HTTP API 客戶端
│   │   ├── socket.ts        # Socket.IO 客戶端
│   │   └── helpers.ts       # 通用工具函數
│   └── types/               # TypeScript 類型定義
│       └── index.ts         # 核心數據類型
└── vite.config.ts           # Vite 建置配置
```

### 後端架構 (Node.js + Express)
```
server/
├── index.js                 # 主服務器檔案
├── uploads/                 # 檔案上傳目錄
│   └── [ROOM_ID]/          # 每個房間的檔案目錄
│       └── [FILES]         # 上傳的檔案
└── package.json            # 後端依賴配置
```

## 🔄 系統運作流程

### 1. 房間生命週期

#### 創建房間
1. **用戶點擊「創建新房間」**
2. **前端發送 POST 請求** → `/api/rooms`
3. **後端生成**：
   - 8位隨機房間代碼 (例如: `A1B2C3D4`)
   - 唯一房主ID (UUID)
   - 房間過期時間 (30分鐘)
4. **後端創建**：
   - 內存中的房間記錄
   - 檔案上傳目錄 `uploads/A1B2C3D4/`
5. **前端接收**：
   - 房間ID和房主ID
   - 將房主身份存入 `localStorage`
   - 跳轉到房間頁面

#### 加入房間
1. **用戶輸入房間代碼**
2. **前端發送 POST 請求** → `/api/rooms/A1B2C3D4/join`
3. **後端驗證房間存在性**
4. **成功後跳轉到房間頁面**

### 2. 即時通訊機制 (Socket.IO)

#### 連接建立
```javascript
// 客戶端連接
const socket = io('http://localhost:3001');
socket.emit('joinRoom', 'A1B2C3D4');

// 服務器端處理
io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    // 增加房間人數
    room.participants++;
    // 廣播人數更新
    io.to(roomId).emit('participantCountUpdate', room.participants);
  });
});
```

#### 即時事件
- **`participantCountUpdate`**: 房間人數變化
- **`fileUploaded`**: 新檔案上傳通知
- **`roomJoined`**: 成功加入房間
- **`error`**: 錯誤處理

### 3. 檔案上傳機制

#### 多檔案上傳功能
系統支援房主一次選擇並上傳多個檔案：

1. **檔案選擇方式**：
   - 拖拽多個檔案到上傳區域
   - 點擊選擇多個檔案（使用 `multiple` 屬性）
   - 可以多次添加檔案到列表中

2. **檔案管理**：
   - 顯示已選擇檔案列表
   - 個別移除檔案功能
   - 清空全部檔案功能
   - 即時顯示上傳進度

#### 上傳流程
1. **房主選擇檔案** (支援多檔案拖拽或點擊)
2. **前端驗證**：
   - 檔案大小 ≤ 100MB (個別檔案)
   - 房主身份驗證
3. **批量上傳**：
   ```javascript
   // 依序上傳每個檔案
   for (let i = 0; i < selectedFiles.length; i++) {
     const file = selectedFiles[i];
     const formData = new FormData();
     formData.append('file', file);
     formData.append('hostId', hostId);
     
     await api.post(`/rooms/${roomId}/upload`, formData, {
       onUploadProgress: (progressEvent) => {
         // 顯示個別檔案上傳進度
       }
     });
   }
   formData.append('file', selectedFile);
   formData.append('hostId', hostId);
   
   await api.post(`/rooms/${roomId}/upload`, formData);
   ```
4. **後端處理** (使用 Multer):
   - 驗證房主身份
   - 將檔案內容存儲到內存 Map 中
   - 生成檔案元數據
5. **內存存儲**：
   ```javascript
   // 檔案內容存儲在內存中
   const roomBuffers = fileBuffers.get(roomId);
   roomBuffers.set(fileId, {
     buffer: req.file.buffer,
     originalName: req.file.originalname,
     mimetype: req.file.mimetype
   });
   ```
5. **Socket.IO 廣播**：
   ```javascript
   io.to(roomId).emit('fileUploaded', fileInfo);
   ```
6. **所有客戶端即時更新檔案列表**

#### 檔案存儲結構
```
內存存儲 (Map 數據結構):
├── rooms (Map)                  # 房間基本信息
│   └── 'A1B2C3D4' → {
│       id: 'A1B2C3D4',
│       hostId: 'uuid-host-id',
│       participants: 2,
│       createdAt: Date
│   }
├── roomFiles (Map)              # 檔案元數據
│   └── 'A1B2C3D4' → [
│       {
│         id: 'file-uuid',
│         originalName: 'file.pdf',
│         filename: 'file-uuid',
│         size: 1024000,
│         mimetype: 'application/pdf'
│       }
│   ]
└── fileBuffers (Map)            # 檔案內容緩存
    └── 'A1B2C3D4' → Map {
        'file-uuid' → {
          buffer: Buffer,
          originalName: 'file.pdf',
          mimetype: 'application/pdf'
        }
    }
```

### 4. 檔案下載機制

#### 下載流程
1. **用戶點擊下載按鈕**
2. **前端建立下載連結**：
   ```javascript
   const downloadUrl = `/api/rooms/${roomId}/files/${filename}`;
   const link = document.createElement('a');
   link.href = downloadUrl;
   link.download = originalName;
   link.click();
   ```
3. **後端處理** GET `/api/rooms/:roomId/files/:filename`:
   - 驗證房間存在
   - 從內存中獲取檔案內容
   - 設置適當的 HTTP 標頭
   - 直接發送檔案 Buffer

## 💾 數據存儲說明

### 內存存儲 (Map)
```javascript
// 房間信息
const rooms = new Map();
rooms.set('A1B2C3D4', {
  id: 'A1B2C3D4',
  hostId: 'uuid-host-id',
  participants: 2,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 60 * 1000)
});

// 檔案信息
const roomFiles = new Map();
roomFiles.set('A1B2C3D4', [
  {
    id: 'file-uuid',
    originalName: 'document.pdf',
    filename: '1234567890-document.pdf',
    size: 1024000,
    mimetype: 'application/pdf',
    uploadedAt: new Date()
  }
]);
```

### 檔案系統存儲
- **存儲方式**: 內存中的 Map 數據結構
- **自動清理**: 房主離開房間時立即清理
- **安全性**: 檔案使用 UUID 識別，避免衝突
- **部署友好**: 不依賴檔案系統，適合 Heroku 等平台

## 🔒 安全機制

### 1. 房主驗證
```javascript
// 創建房間時生成房主ID
const hostId = uuidv4();
localStorage.setItem(`room_${roomId}_host`, hostId);

// 上傳時驗證
app.post('/api/rooms/:roomId/upload', (req, res) => {
  const { hostId } = req.body;
  const room = rooms.get(roomId);
  if (room.hostId !== hostId) {
    return res.status(403).json({ error: '只有房主可以上傳檔案' });
  }
});
```

### 2. 檔案大小限制
- **前端驗證**: JavaScript 檢查 `file.size`
- **後端限制**: Multer 配置 `limits: { fileSize: 100 * 1024 * 1024 }`

### 3. CORS 保護
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}));
```

### 4. 速率限制
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100 // 每IP最多100請求
});
```

## 🧹 自動清理機制

### 房主離開時清理
```javascript
socket.on('disconnect', () => {
  if (currentRoomId && rooms.has(currentRoomId)) {
    const room = rooms.get(currentRoomId);
    
    // 如果是房主離開，清理整個房間
    if (isHost) {
      console.log(`房主離開，清理房間 ${currentRoomId}`);
      cleanupRoom(currentRoomId);
      // 通知其他用戶房間已關閉
      io.to(currentRoomId).emit('roomClosed', { 
        message: '房主已離開，房間已關閉' 
      });
    }
  }
});

function cleanupRoom(roomId) {
  // 清除所有內存記錄
  rooms.delete(roomId);
  roomFiles.delete(roomId);
  fileBuffers.delete(roomId);
  console.log(`房間 ${roomId} 已清理`);
}
```

## 🌐 部署架構

### 開發環境
- **前端**: Vite Dev Server (localhost:5173)
- **後端**: Node.js (localhost:3001)
- **檔案存儲**: 內存 Map 數據結構

### 生產環境
- **前端**: Netlify (靜態托管)
- **後端**: Heroku (Container 部署)
- **檔案存儲**: 內存存儲 (服務器重啟時清除)

## 📊 性能特性

### 前端優化
- **代碼分割**: React.lazy() 按需載入
- **資源壓縮**: Vite 自動壓縮 CSS/JS
- **快取策略**: 瀏覽器快取靜態資源

### 後端優化
- **壓縮中間件**: gzip 壓縮 HTTP 響應
- **內存管理**: Map 數據結構快速訪問
- **檔案串流**: 大檔案下載使用串流傳輸

## 🔧 關鍵配置

### 環境變數
```bash
# 後端
PORT=3001
NODE_ENV=production
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads
CORS_ORIGIN=https://your-frontend-domain.netlify.app

# 前端
VITE_API_URL=https://your-backend.herokuapp.com
```

### 部署配置
```javascript
// netlify.toml (前端)
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

// Procfile (後端)
web: cd server && npm start
```

## 🔍 監控和日誌

### 開發環境日誌
```javascript
// Socket.IO 連接日誌
console.log('用戶連接:', socket.id);
console.log('用戶加入房間:', roomId, '當前人數:', room.participants);

// 檔案操作日誌
console.log('檔案上傳:', file.originalName, file.size);
console.log('房間清理:', roomId);
```

### 錯誤處理
```javascript
// 全域錯誤處理
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: '伺服器內部錯誤' });
});

// 前端錯誤邊界
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }
}
```

## 📈 擴展性考量

### 水平擴展
- **多服務器**: Redis 共享 Session
- **檔案存儲**: AWS S3 或 CloudFlare R2
- **負載平衡**: Nginx 或 CloudFlare

### 功能擴展
- **持久化**: PostgreSQL 或 MongoDB
- **用戶系統**: JWT 認證機制
- **檔案預覽**: PDF.js、圖片預覽
- **批量操作**: 多檔案上傳/下載

---

## 🎯 總結

FastTransfer 使用現代化的網頁技術棧，實現了：
- ✅ **即時性**: Socket.IO 確保所有操作即時同步
- ✅ **安全性**: 多層驗證機制保護檔案安全
- ✅ **易用性**: 直觀的拖拽上傳和一鍵下載
- ✅ **隱私性**: 自動清理機制保護用戶隱私
- ✅ **可擴展**: 模組化設計便於功能擴展

這個架構既滿足了基本的檔案傳輸需求，又具備了良好的擴展性和維護性。
