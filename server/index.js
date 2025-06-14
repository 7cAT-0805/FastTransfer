const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "https://fasttransfer.netlify.app",
      "https://684a2ed84e42030008d66d5e--fasttransfer.netlify.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// 信任 proxy（用於 Render 等雲端服務）
app.set('trust proxy', 1);

// 中間件
app.use(helmet());
app.use(compression());

// 增強 CORS 配置
const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "https://fasttransfer.netlify.app",
    "https://684a2ed84e42030008d66d5e--fasttransfer.netlify.app" // Netlify 預覽 URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 限制每個IP每15分鐘最多100個請求
  message: { error: '請求過於頻繁，請稍後再試' }
});
app.use('/api/', limiter);

// 房間管理
const rooms = new Map();
const roomFiles = new Map();
const fileBuffers = new Map(); // 新增：存儲檔案內容的內存緩存

// Multer配置 - 使用內存存儲
const storage = multer.memoryStorage(); // 改為內存存儲

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    // 允許所有檔案類型
    cb(null, true);
  }
});

// API路由
app.get('/api', (req, res) => {
  res.json({ status: 'FastTransfer API', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 根路徑健康檢查（供前端直接訪問）
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 根路徑歡迎訊息
app.get('/', (req, res) => {
  res.json({ 
    message: 'FastTransfer API Server', 
    status: 'OK',
    endpoints: {
      health: '/health',
      api: '/api/health'
    }
  });
});

// 創建房間
app.post('/api/rooms', (req, res) => {
  const roomId = uuidv4().substring(0, 8).toUpperCase();
  const hostId = uuidv4();
  
  const room = {
    id: roomId,
    hostId: hostId,
    createdAt: new Date(),
    participants: 0,
    files: []
  };
  
  rooms.set(roomId, room);
  roomFiles.set(roomId, []);
  fileBuffers.set(roomId, new Map()); // 初始化檔案緩存
  
  console.log(`房間 ${roomId} 已創建，房主: ${hostId}`);
  
  res.json({
    roomId: roomId,
    hostId: hostId,
    message: '房間創建成功'
  });
});

// 加入房間
app.post('/api/rooms/:roomId/join', (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  
  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: '房間不存在' });
  }
  
  const room = rooms.get(roomId);
  const userId = uuidv4();
  
  res.json({
    userId: userId,
    roomId: roomId,
    isHost: false,
    files: roomFiles.get(roomId) || [],
    message: '成功加入房間'
  });
});

// 驗證房主身份
app.post('/api/rooms/:roomId/verify-host', (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  const { hostId } = req.body;
  
  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: '房間不存在' });
  }
  
  const room = rooms.get(roomId);
  const isHost = room.hostId === hostId;
  
  res.json({ isHost });
});

// 檔案上傳 (所有房間成員皆可上傳)
app.post('/api/rooms/:roomId/upload', upload.single('file'), (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  
  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: '房間不存在' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: '沒有檔案被上傳' });
  }
  
  const fileId = uuidv4();  const fileInfo = {
    id: fileId,
    originalName: req.file.originalname,
    filename: fileId, // 使用UUID作為檔案識別
    size: req.file.size,
    uploadedAt: new Date(),
    mimetype: req.file.mimetype,
    previewUrl: `/api/rooms/${roomId}/files/${fileId}` // 添加預覽URL
  };
  
  // 將檔案內容存儲在內存中
  const roomBuffers = fileBuffers.get(roomId);
  roomBuffers.set(fileId, {
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype
  });
  
  const files = roomFiles.get(roomId) || [];
  files.push(fileInfo);
  roomFiles.set(roomId, files);
  
  console.log(`檔案上傳: ${req.file.originalname} (${req.file.size} bytes) 到房間 ${roomId}`);
  
  // 通知房間內所有用戶有新檔案
  io.to(roomId).emit('fileUploaded', fileInfo);
  
  res.json({
    message: '檔案上傳成功',
    file: fileInfo
  });
});

// 檔案下載/預覽
app.get('/api/rooms/:roomId/files/:filename', (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  const filename = req.params.filename;
  
  console.log(`📁 檔案請求: roomId=${roomId}, filename=${filename}`);
  
  if (!rooms.has(roomId)) {
    console.log(`❌ 房間不存在: ${roomId}`);
    return res.status(404).json({ error: '房間不存在' });
  }
  
  const files = roomFiles.get(roomId) || [];
  console.log(`📋 房間檔案列表:`, files.map(f => ({id: f.id, filename: f.filename, originalName: f.originalName})));
  
  const file = files.find(f => f.filename === filename);
  
  if (!file) {
    console.log(`❌ 檔案元數據不存在: ${filename}`);
    return res.status(404).json({ error: '檔案不存在' });
  }
  
  // 從內存中獲取檔案
  const roomBuffers = fileBuffers.get(roomId);
  if (!roomBuffers) {
    console.log(`❌ 房間緩存不存在: ${roomId}`);
    return res.status(404).json({ error: '房間緩存不存在' });
  }
  
  const fileData = roomBuffers.get(filename);
  
  if (!fileData) {
    console.log(`❌ 檔案內容不存在: ${filename}`);
    console.log(`📋 可用檔案緩存:`, Array.from(roomBuffers.keys()));
    return res.status(404).json({ error: '檔案內容不存在' });
  }
    console.log(`✅ 檔案服務成功: ${fileData.originalName} (${fileData.buffer.length} bytes)`);
    // 設置響應標頭 - 支援中文檔名
  if (fileData.mimetype && (fileData.mimetype.startsWith('image/') || fileData.mimetype === 'application/pdf')) {
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(fileData.originalName)}`);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileData.originalName)}`);
  }
  res.setHeader('Content-Type', fileData.mimetype || 'application/octet-stream');
  res.setHeader('Content-Length', fileData.buffer.length);
  res.setHeader('Cache-Control', 'no-cache');
  
  // 發送檔案內容
  res.send(fileData.buffer);
});

// 獲取房間檔案列表
app.get('/api/rooms/:roomId/files', (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  
  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: '房間不存在' });
  }
  
  const files = roomFiles.get(roomId) || [];
  res.json({ files });
});

// Socket.IO連接處理
io.on('connection', (socket) => {
  console.log('用戶連接:', socket.id);
  let currentRoomId = null;
  let isHost = false;
    socket.on('joinRoom', (roomId) => {
    roomId = roomId.toUpperCase();
    console.log(`👤 User ${socket.id} attempting to join room ${roomId}`);
    
    if (rooms.has(roomId)) {
      // 如果用戶已經在其他房間，先離開
      if (currentRoomId && currentRoomId !== roomId) {
        socket.leave(currentRoomId);
        const prevRoom = rooms.get(currentRoomId);
        if (prevRoom) {
          prevRoom.participants = Math.max(0, prevRoom.participants - 1);
          io.to(currentRoomId).emit('participantCountUpdate', prevRoom.participants);
        }
      }
      
      // 檢查是否為房主
      const room = rooms.get(roomId);
      const hostId = socket.handshake.auth?.hostId;
      isHost = room.hostId === hostId;
      
      console.log(`🔐 Host check: ${hostId} === ${room.hostId} ? ${isHost}`);
      
      // 只有新加入才增加人數
      const isNewJoin = currentRoomId !== roomId;
      
      // 加入新房間
      socket.join(roomId);
      currentRoomId = roomId;
      
      if (isNewJoin) {
        room.participants++;
      }
      
      socket.emit('roomJoined', {
        roomId: roomId,
        files: roomFiles.get(roomId) || [],
        isHost: isHost
      });
      
      io.to(roomId).emit('participantCountUpdate', room.participants);
      console.log(`✅ User ${socket.id} joined room ${roomId}, participants: ${room.participants}${isHost ? ' (Host)' : ' (Guest)'}`);
    } else {
      console.log(`❌ Room ${roomId} does not exist`);
      socket.emit('error', { message: '房間不存在' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('用戶斷線:', socket.id);
    
    // 用戶斷線時處理
    if (currentRoomId && rooms.has(currentRoomId)) {
      const room = rooms.get(currentRoomId);
      room.participants = Math.max(0, room.participants - 1);
      
      // 如果是房主離開，清理整個房間
      if (isHost) {
        console.log(`房主離開，清理房間 ${currentRoomId}`);
        cleanupRoom(currentRoomId);
        // 通知其他用戶房間已關閉
        io.to(currentRoomId).emit('roomClosed', { message: '房主已離開，房間已關閉' });
      } else {
        io.to(currentRoomId).emit('participantCountUpdate', room.participants);
        console.log(`用戶 ${socket.id} 離開房間 ${currentRoomId}，當前人數: ${room.participants}`);
      }
    }
  });
});

// 清理房間函數
function cleanupRoom(roomId) {
  if (rooms.has(roomId)) {
    console.log(`清理房間 ${roomId}`);
    
    // 清除內存記錄
    rooms.delete(roomId);
    roomFiles.delete(roomId);
    fileBuffers.delete(roomId);
    
    console.log(`房間 ${roomId} 已清理`);
  }
}

// 404處理
app.use('*', (req, res) => {
  res.status(404).json({ error: '找不到請求的資源' });
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: '伺服器內部錯誤' });
});

server.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
});
