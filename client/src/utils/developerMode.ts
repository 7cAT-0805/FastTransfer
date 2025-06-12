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
  }
  private initMockData() {
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
  }  private createDebugPanel() {
    this.debugPanel = document.createElement('div');
    this.debugPanel.className = 'fixed bottom-4 right-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white rounded-2xl shadow-2xl z-50 min-w-80 border border-indigo-500/30 backdrop-blur-sm';
    this.debugPanel.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #3730a3 50%, #1e40af 75%, #1e3a8a 100%)';
    this.debugPanel.innerHTML = `
      <div class="p-6">
        <!-- 標題區域 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span class="font-bold text-lg bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">🛠️ 開發者面板</span>
          </div>
          <button onclick="this.parentElement.parentElement.style.display='none'" 
                  class="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all backdrop-blur-sm">
            ✕
          </button>
        </div>

        <!-- 角色切換區域 -->
        <div class="mb-4 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-500/30 backdrop-blur-sm">
          <div class="text-sm text-blue-200 mb-3 font-medium">👤 當前視角</div>
          <div class="flex space-x-2">
            <button onclick="window.devMode.setRole(true)" 
                    class="flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-lg ${this.isHost ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30' : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'}">
              👑 房主模式
            </button>
            <button onclick="window.devMode.setRole(false)" 
                    class="flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-lg ${!this.isHost ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30' : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'}">
              👥 訪客模式
            </button>
          </div>
          <div class="mt-2 text-xs text-center text-blue-300/80">
            ${this.isHost ? '📤 可上傳檔案、管理房間' : '📥 只能下載檔案、查看內容'}
          </div>
        </div>

        <!-- 狀態資訊 -->
        <div class="space-y-3 mb-4 p-4 bg-gradient-to-r from-indigo-900/50 to-blue-900/50 rounded-xl border border-indigo-500/30">
          <div class="flex justify-between items-center">
            <span class="text-gray-300 text-sm">🔧 API 狀態</span>
            <span class="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-xs font-medium shadow-lg">模擬模式</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-300 text-sm">🏠 房間代碼</span>
            <span class="text-blue-300 font-mono text-sm bg-blue-900/30 px-2 py-1 rounded">${this.mockData?.id || 'DEV12345'}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-300 text-sm">👥 在線用戶</span>
            <span class="text-emerald-300 font-semibold bg-emerald-900/30 px-2 py-1 rounded">${this.mockData?.participants || 3}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-300 text-sm">📁 檔案數量</span>
            <span class="text-purple-300 font-semibold bg-purple-900/30 px-2 py-1 rounded">${this.mockData?.files.length || 2}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-300 text-sm">💬 分享訊息</span>
            <span class="text-pink-300 font-semibold bg-pink-900/30 px-2 py-1 rounded">${this.mockMessages.length}</span>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="space-y-2 mb-4">
          <button onclick="window.devMode.addMockFile()" 
                  class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25">
            📁 添加測試檔案
          </button>
          <button onclick="window.devMode.addMockMessage()" 
                  class="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-lg shadow-green-500/25">
            💬 添加測試訊息
          </button>
          <button onclick="window.devMode.clearMockData()" 
                  class="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-lg shadow-orange-500/25">
            🗑️ 清空測試數據
          </button>
        </div>

        <!-- 退出按鈕 -->
        <button onclick="window.devMode.exitDeveloperMode()" 
                class="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-lg shadow-red-500/25">
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
    const newFile = {
      id: `file-${Date.now()}`,
      originalName: randomFile.name,
      size: randomFile.size,
      uploadedAt: new Date().toISOString(),
      downloadUrl: `blob:mock-file-${Date.now()}`,
      mimetype: randomFile.mime
    };
    
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
  exitDeveloperMode() {
    localStorage.removeItem('fastransfer_dev_mode');
    localStorage.removeItem('fastransfer_dev_role');
    
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
  }
  async mockUploadFile(file: File): Promise<MockFile> {
    await this.delay(1000); // 模擬上傳時間
    const mockFile: MockFile = {
      id: `mock-${Date.now()}`,
      originalName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      downloadUrl: URL.createObjectURL(file),
      mimetype: file.type || 'application/octet-stream'
    };
    
    this.mockData?.files.push(mockFile);
    this.updateDebugPanel();
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
