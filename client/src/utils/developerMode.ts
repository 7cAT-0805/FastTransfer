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

export class DeveloperMode {
  private static instance: DeveloperMode;
  private enabled = false;
  private mockData: MockRoom | null = null;
  private debugPanel: HTMLElement | null = null;

  private constructor() {
    this.initConsoleActivation();
  }

  static getInstance(): DeveloperMode {
    if (!DeveloperMode.instance) {
      DeveloperMode.instance = new DeveloperMode();
    }
    return DeveloperMode.instance;
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
  }

  private createDebugPanel() {
    this.debugPanel = document.createElement('div');
    this.debugPanel.className = 'fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-40 max-w-sm';
    this.debugPanel.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="font-semibold">🛠️ 開發者面板</span>
        <button onclick="this.parentElement.parentElement.style.display='none'" 
                class="text-gray-400 hover:text-white">✕</button>
      </div>
      <div class="text-sm space-y-1">
        <div>模式: <span class="text-green-400">開發者</span></div>
        <div>API: <span class="text-blue-400">模擬</span></div>
        <div>房間: <span class="text-yellow-400">${this.mockData?.id}</span></div>
        <div>檔案: <span class="text-purple-400">${this.mockData?.files.length}</span></div>
      </div>
      <button onclick="localStorage.removeItem('fastransfer_dev_mode'); location.reload()" 
              class="mt-2 text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded">
        退出開發者模式
      </button>
    `;
    document.body.appendChild(this.debugPanel);
  }

  // 公共方法
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

  private updateDebugPanel() {
    if (this.debugPanel) {
      const fileCount = this.debugPanel.querySelector('.text-purple-400');
      if (fileCount) {
        fileCount.textContent = String(this.mockData?.files.length || 0);
      }
    }
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
    },
    off: (event: string) => {
      if (this.isEnabled()) {
        console.log(`🔌 Mock Socket Off: ${event}`);
      }
    }
  };
}
