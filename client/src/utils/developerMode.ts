// 開發者模式工具
interface MockFile {
  id: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  downloadUrl: string;
  mimetype?: string;
}

interface MockRoom {
  id: string;
  hostId: string;
  participants: number;
  files: MockFile[];
}

interface MockMessage {
  id: string;
  type: 'text' | 'url' | 'clipboard' | 'voice' | 'image';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export class DeveloperMode {
  private static instance: DeveloperMode;
  private enabled = false;
  private mockData: MockRoom | null = null;
  private debugPanel: HTMLElement | null = null;
  private isHost = true; // 新增：角色切換
  private mockMessages: MockMessage[] = []; // 新增：模擬消息
  private debugLogs = true; // 新增：調試日誌開關

  private constructor() {
    this.initConsoleActivation();
    this.initMockMessages();
    this.exposeToWindow();
  }

  private exposeToWindow() {
    (window as any).devMode = this;
  }

  static getInstance(): DeveloperMode {
    if (!DeveloperMode.instance) {
      DeveloperMode.instance = new DeveloperMode();
    }
    return DeveloperMode.instance;
  }

  private initMockMessages() {
    this.mockMessages = [
      {
        id: 'msg-001',
        type: 'text',
        content: '這是一條測試文字訊息！歡迎使用 FastTransfer 開發者模式。',
        timestamp: new Date(Date.now() - 300000), // 5分鐘前
      },
      {
        id: 'msg-002',
        type: 'url',
        content: 'https://github.com/example/fastransfer',
        timestamp: new Date(Date.now() - 240000), // 4分鐘前
      },
      {
        id: 'msg-003',
        type: 'clipboard',
        content: '複製的內容：\n用戶名: admin\n密碼: 123456\n\n這是從剪貼簿分享的內容。',
        timestamp: new Date(Date.now() - 120000), // 2分鐘前
      },
      {
        id: 'msg-004',
        type: 'voice',
        content: 'blob:mock-audio-url',
        timestamp: new Date(Date.now() - 60000), // 1分鐘前
        metadata: { size: 245760, duration: 15 }
      }
    ];
  }
  private initConsoleActivation() {
    // 添加控制台啟用方式，需要密碼 5168
    (window as any).DevMode_7cAT = (password?: number) => {
      if (password !== 5168) {
        console.error('❌ 密碼錯誤！請使用正確的密碼。');
        return false;
      }
      
      console.log('🛠️ 密碼正確，正在啟用開發者模式...');
      this.enableDeveloperMode();
      return true;
    };

    // 添加直接連接本地後端的選項
    (window as any).ConnectLocal = () => {
      console.log('🔌 切換到本地後端模式...');
      localStorage.setItem('fastransfer_use_local', 'true');
      localStorage.removeItem('fastransfer_dev_mode');
      location.reload();
      return true;
    };

    // 添加切換回雲端後端的選項
    (window as any).ConnectCloud = () => {
      console.log('☁️ 切換到雲端後端模式...');
      localStorage.removeItem('fastransfer_use_local');
      localStorage.removeItem('fastransfer_dev_mode');
      location.reload();
      return true;
    };

    // 檢查是否已經從 localStorage 啟用
    if (localStorage.getItem('fastransfer_dev_mode') === 'true') {
      this.enableDeveloperMode();
    }
  }

  private enableDeveloperMode() {
    this.enabled = true;
    this.initMockData();
    this.showSuccessMessage();
    this.createDebugPanel();
    
    // 保存到 localStorage
    localStorage.setItem('fastransfer_dev_mode', 'true');
    
    console.log('🚀 Developer Mode Activated!');
  }

  private showSuccessMessage() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
        <div class="text-6xl mb-4">🛠️</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">開發者模式已啟用！</h2>
        <p class="text-gray-600 mb-4">所有 API 請求將使用模擬數據</p>
        <div class="flex justify-center space-x-2 mb-4">
          <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">API 模擬</span>
          <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">檔案模擬</span>
          <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">除錯面板</span>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                class="btn-primary px-6 py-2">
          開始開發
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  }  private initMockData() {
    this.mockData = {
      id: 'DEV12345',
      hostId: 'dev-host-001',
      participants: 3,
      files: [
        {
          id: 'file-001',
          originalName: '測試文件.txt',
          size: 1024,
          uploadedAt: new Date().toISOString(),
          downloadUrl: 'blob:mock-file-1',
          mimetype: 'text/plain'
        },
        {
          id: 'file-002',
          originalName: '示範圖片.jpg',
          size: 2048000,
          uploadedAt: new Date(Date.now() - 60000).toISOString(),
          downloadUrl: 'blob:mock-file-2',
          mimetype: 'image/jpeg'
        }
      ]
    };
    
    // 為所有模擬檔案添加 filename 和 previewUrl 屬性
    this.mockData.files.forEach(file => {
      (file as any).filename = file.id;
      (file as any).previewUrl = `/api/rooms/DEV12345/files/${file.id}`;
    });
  }  private createDebugPanel() {
    this.debugPanel = document.createElement('div');
    // 使用與現有應用一致的顏色方案
    this.debugPanel.className = 'fixed bottom-4 right-4 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 rounded-2xl shadow-2xl z-50 min-w-80 max-w-sm border border-blue-200 backdrop-blur-sm';
    this.debugPanel.style.background = 'linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(224, 231, 255, 0.95) 100%)';
    this.debugPanel.innerHTML = `
      <div class="p-4">
        <!-- 標題區域 - 與Layout風格一致 -->
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-blue-200">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-primary-600 rounded-full animate-pulse shadow-lg"></div>
            <span class="font-bold text-lg text-gray-900">🛠️ 開發者面板</span>
          </div>
          <button onclick="this.parentElement.parentElement.style.display='none'" 
                  class="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <!-- 當前模式指示 -->
        <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div class="flex items-center justify-center space-x-2">
            <div class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span class="text-amber-800 text-sm font-semibold">模擬開發模式</span>
          </div>
          <div class="text-center text-xs text-amber-700 mt-1">
            所有 API 和 Socket 連接已模擬
          </div>
        </div>

        <!-- 後端連接模式切換 -->
        <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div class="text-sm text-green-800 mb-3 font-semibold">🔌 後端連接模式</div>
          <div class="flex space-x-2 mb-2">
            <button onclick="window.ConnectLocal()" 
                    class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all transform hover:scale-105 ${localStorage.getItem('fastransfer_use_local') === 'true' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}">
              🔌 本地後端
            </button>
            <button onclick="window.ConnectCloud()" 
                    class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all transform hover:scale-105 ${localStorage.getItem('fastransfer_use_local') !== 'true' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}">
              ☁️ 雲端後端
            </button>
          </div>
          <div class="text-xs text-center text-green-700">
            ${localStorage.getItem('fastransfer_use_local') === 'true' ? '🔌 localhost:3001' : '☁️ Railway 雲端服務'}
          </div>
        </div>

        <!-- 角色切換區域 -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="text-sm text-blue-800 mb-3 font-semibold">👤 當前視角</div>
          <div class="flex space-x-2">
            <button onclick="window.devMode.setRole(true)" 
                    class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all transform hover:scale-105 ${this.isHost ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}">
              👑 房主
            </button>
            <button onclick="window.devMode.setRole(false)" 
                    class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all transform hover:scale-105 ${!this.isHost ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}">
              👥 訪客
            </button>
          </div>
          <div class="mt-2 text-xs text-center text-blue-700">
            ${this.isHost ? '📤 可上傳檔案、管理房間' : '📥 只能下載檔案、查看內容'}
          </div>
        </div>

        <!-- 狀態資訊 -->
        <div class="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <div class="text-sm text-indigo-800 mb-3 font-semibold">📊 狀態資訊</div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">🏠 房間代碼</span>
              <span class="text-indigo-700 font-mono bg-indigo-100 px-2 py-1 rounded">${this.mockData?.id || 'DEV12345'}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">👥 在線用戶</span>
              <span class="text-emerald-700 font-semibold bg-emerald-100 px-2 py-1 rounded">${this.mockData?.participants || 3}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">📁 檔案數量</span>
              <span class="text-purple-700 font-semibold bg-purple-100 px-2 py-1 rounded">${this.mockData?.files.length || 2}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">💬 分享訊息</span>
              <span class="text-pink-700 font-semibold bg-pink-100 px-2 py-1 rounded">${this.mockMessages.length}</span>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="space-y-2 mb-4">
          <button onclick="window.devMode.addMockFile()" 
                  class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-sm">
            📁 添加測試檔案
          </button>
          <button onclick="window.devMode.addMockMessage()" 
                  class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-sm">
            💬 添加測試訊息
          </button>
          <button onclick="window.devMode.clearMockData()" 
                  class="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-sm">
            🗑️ 清空測試數據
          </button>
        </div>

        <!-- 開發工具 -->
        <div class="space-y-2 mb-4">
          <button onclick="window.devMode.exportMockData()" 
                  class="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-sm">
            📤 匯出測試數據
          </button>
          <button onclick="window.devMode.toggleDebugLogs()" 
                  class="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-sm">
            🐛 ${this.shouldShowDebugLogs() ? '關閉' : '開啟'}除錯日誌
          </button>
        </div>

        <!-- 退出按鈕 -->
        <button onclick="window.devMode.exitDeveloperMode()" 
                class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-sm">
          🚪 退出開發者模式
        </button>
      </div>
    `;
    document.body.appendChild(this.debugPanel);
    
    // 讓面板可拖拽
    this.makeDraggable(this.debugPanel);
  }
  private makeDraggable(element: HTMLElement) {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;

    const header = element.querySelector('.flex.items-center.justify-between') as HTMLElement;
    
    header.style.cursor = 'move';
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        element.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
  // 新增方法
  setRole(isHost: boolean) {
    this.isHost = isHost;
    localStorage.setItem('fastransfer_dev_role', isHost ? 'host' : 'guest');
    this.updateDebugPanel();
    
    // 觸發頁面重新渲染
    const event = new CustomEvent('devModeRoleChanged', { 
      detail: { isHost, timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
    
    // 顯示角色切換通知
    this.showRoleChangeNotification(isHost);
    
    console.log(`🛠️ 開發者模式角色切換為: ${isHost ? '👑 房主' : '👥 訪客'}`);
  }
  private showRoleChangeNotification(isHost: boolean) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-xl z-50';
    notification.style.animation = 'slideInFromTop 0.5s ease-out forwards';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-xl">${isHost ? '👑' : '👥'}</span>
        <span class="font-medium">已切換為 ${isHost ? '房主' : '訪客'} 模式</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    // 添加動畫樣式
    if (!document.querySelector('#devmode-animations')) {
      const style = document.createElement('style');
      style.id = 'devmode-animations';
      style.textContent = `
        @keyframes slideInFromTop {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate(-50%, 0);
          }
          40%, 43% {
            transform: translate(-50%, -10px);
          }
          70% {
            transform: translate(-50%, -5px);
          }
          90% {
            transform: translate(-50%, -2px);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.5s ease-out forwards';
      setTimeout(() => notification.remove(), 500);
    }, 2000);
  }

  getRole(): boolean {
    const savedRole = localStorage.getItem('fastransfer_dev_role');
    return savedRole ? savedRole === 'host' : this.isHost;
  }

  clearMockData() {
    if (this.mockData) {
      this.mockData.files = [];
    }
    this.mockMessages = [];
    this.updateDebugPanel();
    
    // 觸發清空事件
    const event = new CustomEvent('devModeDataCleared', { 
      detail: { timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
    
    console.log('🛠️ 已清空所有測試數據');
    
    // 顯示清空通知
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-xl z-50';
    notification.innerHTML = '🗑️ 測試數據已清空';
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
  }
  addMockFile() {
    if (!this.mockData) this.initMockData();
    
    const fileTypes = [
      { name: '測試文檔.pdf', mime: 'application/pdf', size: 1024000 },
      { name: '示例圖片.png', mime: 'image/png', size: 2048000 },
      { name: '音頻檔案.mp3', mime: 'audio/mpeg', size: 3072000 },
      { name: '壓縮檔案.zip', mime: 'application/zip', size: 5120000 },
    ];
    
    const randomFile = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const fileId = `file-${Date.now()}`;
    const newFile = {
      id: fileId,
      originalName: randomFile.name,
      size: randomFile.size,
      uploadedAt: new Date().toISOString(),
      downloadUrl: `blob:mock-file-${Date.now()}`,
      mimetype: randomFile.mime
    };
    
    // 添加必要的屬性
    (newFile as any).filename = fileId;
    (newFile as any).previewUrl = `/api/rooms/DEV12345/files/${fileId}`;
    
    this.mockData!.files.push(newFile);
    this.updateDebugPanel();
    
    // 觸發檔案更新事件
    const event = new CustomEvent('devModeFileAdded', { 
      detail: { file: newFile } 
    });
    window.dispatchEvent(event);
    
    console.log('🛠️ 已添加測試檔案:', newFile.originalName);
  }

  addMockMessage() {
    const messageTypes = [
      { type: 'text', content: '這是一條新的測試訊息！' },
      { type: 'url', content: 'https://example.com/new-link' },
      { type: 'clipboard', content: '新的剪貼簿內容:\n密碼: newpass123' },
    ];
    
    const randomMsg = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    const newMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      type: randomMsg.type as any,
      content: randomMsg.content,
      timestamp: new Date(),
    };
    
    this.mockMessages.push(newMessage);
    this.updateDebugPanel();
    
    // 觸發訊息更新事件
    const event = new CustomEvent('devModeMessageAdded', { 
      detail: { message: newMessage } 
    });
    window.dispatchEvent(event);
    
    console.log('🛠️ 已添加測試訊息:', newMessage.content.substring(0, 20) + '...');
  }
  updateDebugPanel() {
    if (this.debugPanel) {
      this.debugPanel.remove();
      this.createDebugPanel();
    }
  }

  // 新增：匯出測試數據
  exportMockData() {
    const data = {
      room: this.mockData,
      messages: this.mockMessages,
      settings: {
        isHost: this.isHost,
        debugLogs: this.debugLogs,
        useLocal: localStorage.getItem('fastransfer_use_local') === 'true'
      },
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fastransfer-devmode-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📤 開發者模式數據已匯出');
    
    // 顯示成功通知
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50';
    notification.innerHTML = '📤 測試數據已匯出';
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
  }

  // 新增：切換除錯日誌
  toggleDebugLogs() {
    this.debugLogs = !this.debugLogs;
    localStorage.setItem('fastransfer_debug_logs', this.debugLogs.toString());
    this.updateDebugPanel();
    
    console.log(`🐛 除錯日誌已${this.debugLogs ? '開啟' : '關閉'}`);
    
    // 顯示狀態通知
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${this.debugLogs ? 'bg-blue-500' : 'bg-gray-500'} text-white px-6 py-3 rounded-lg shadow-xl z-50`;
    notification.innerHTML = `🐛 除錯日誌已${this.debugLogs ? '開啟' : '關閉'}`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
  }

  // 新增：檢查是否應該顯示除錯日誌
  shouldShowDebugLogs(): boolean {
    const saved = localStorage.getItem('fastransfer_debug_logs');
    return saved ? saved === 'true' : this.debugLogs;
  }

  exitDeveloperMode() {
    localStorage.removeItem('fastransfer_dev_mode');
    localStorage.removeItem('fastransfer_dev_role');
    localStorage.removeItem('fastransfer_debug_logs');
    
    // 顯示退出確認
    const confirmed = confirm('確定要退出開發者模式嗎？頁面將會重新載入。');
    if (confirmed) {
      location.reload();
    }
  }

  isEnabled(): boolean {
    return this.enabled || localStorage.getItem('fastransfer_dev_mode') === 'true';
  }

  getMockRoom(): MockRoom | null {
    if (!this.mockData && this.isEnabled()) {
      this.initMockData();
    }
    return this.mockData;
  }

  // Mock API 方法
  async mockCreateRoom(): Promise<{ roomId: string; hostId: string }> {
    await this.delay(500); // 模擬網路延遲
    return {
      roomId: this.mockData?.id || 'DEV12345',
      hostId: this.mockData?.hostId || 'dev-host-001'
    };
  }

  async mockJoinRoom(_roomId: string): Promise<{ success: boolean; files: MockFile[] }> {
    await this.delay(300);
    return {
      success: true,
      files: this.mockData?.files || []
    };
  }  async mockUploadFile(file: File): Promise<MockFile> {
    await this.delay(1000); // 模擬上傳時間
    const fileId = `mock-${Date.now()}`;
    const mockFile: MockFile = {
      id: fileId,
      originalName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      downloadUrl: URL.createObjectURL(file),
      mimetype: file.type || 'application/octet-stream'
    };
    
    // 確保檔案有 filename 屬性（用於 API 路徑）
    (mockFile as any).filename = fileId;
    (mockFile as any).previewUrl = `/api/rooms/DEV12345/files/${fileId}`;
    
    this.mockData?.files.push(mockFile);
    this.updateDebugPanel();
    
    // 觸發檔案上傳事件
    const event = new CustomEvent('devModeFileAdded', { 
      detail: { file: mockFile } 
    });
    window.dispatchEvent(event);
    
    console.log('🛠️ 開發者模式: 模擬上傳檔案', mockFile.originalName);
    return mockFile;
  }
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Socket.IO 模擬
  mockSocketEvents = {
    emit: (event: string, data: any) => {
      if (this.isEnabled()) {
        console.log(`🔌 Mock Socket Emit: ${event}`, data);
      }
    },
    on: (event: string, callback: Function) => {
      if (this.isEnabled()) {
        console.log(`🔌 Mock Socket On: ${event}`);
        // 模擬一些事件
        if (event === 'connect') {
          setTimeout(() => callback(), 100);
        } else if (event === 'participantCountUpdate') {
          setTimeout(() => callback(Math.floor(Math.random() * 5) + 1), 1000);
        }
      }
    },    off: (event: string) => {
      if (this.isEnabled()) {
        console.log(`🔌 Mock Socket Off: ${event}`);
      }
    }
  };
}

// 在文件最後初始化開發者模式實例
const devModeInstance = DeveloperMode.getInstance();
export default devModeInstance;
