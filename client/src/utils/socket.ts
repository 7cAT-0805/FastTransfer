import { io, Socket } from 'socket.io-client';
import { DeveloperMode } from './developerMode';

class SocketService {
  private socket: Socket | null = null;
  private currentRoomId: string | null = null;
  private devMode = DeveloperMode.getInstance();  connect(auth?: { hostId?: string }): Socket {
    // 開發者模式：返回模擬 Socket
    if (this.devMode.isEnabled()) {
      console.log('🛠️ Developer Mode: Using mock socket');
      return this.devMode.mockSocketEvents as any;
    }

    // 如果已經連接，直接返回現有連接
    if (this.socket && this.socket.connected) {
      return this.socket;
    }
    
    // 先斷開舊連接
    this.disconnect();
    
    // 更新為 Railway 後端 URL
    const serverUrl = 'https://fasttransfer-production.up.railway.app';
    if (this.devMode.isEnabled()) {
      console.log('🔌 Socket connecting to:', serverUrl);
    }
      this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      timeout: 30000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      auth: auth || {}
    });    this.socket.on('connect', () => {
      if (this.devMode.isEnabled()) {
        console.log('✅ Socket連接成功');
      }
    });
    
    this.socket.on('disconnect', (reason) => {
      this.currentRoomId = null;
      if (this.devMode.isEnabled()) {
        console.log('🔌 Socket連接斷開:', reason);
      }
    });
    
    this.socket.on('connect_error', (error) => {
      if (this.devMode.isEnabled()) {
        console.error('❌ Socket連接錯誤 (server might be sleeping):', error);
      }
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      if (this.devMode.isEnabled()) {
        console.log('🔄 Socket重新連接成功，嘗試次數:', attemptNumber);
      }
    });
      this.socket.on('reconnect_attempt', (attemptNumber) => {
      if (this.devMode.isEnabled()) {
        console.log('🔄 Socket重新連接嘗試:', attemptNumber);
      }
    });
    
    return this.socket;
  }
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.currentRoomId = null;
    }
  }
  
  getSocket(): Socket | null {
    return this.socket;
  }
  
  isSocketConnected(): boolean {
    return this.socket?.connected === true;
  }
  joinRoom(roomId: string): void {
    // 開發者模式：直接模擬加入房間
    if (this.devMode.isEnabled()) {
      console.log('🛠️ Developer Mode: Simulating room join:', roomId);
      this.currentRoomId = roomId;
      return;
    }    if (this.socket && this.isSocketConnected()) {
      if (this.devMode.isEnabled()) {
        console.log('🚪 Attempting to join room:', roomId);
      }
      // 避免重複加入同一個房間
      if (this.currentRoomId !== roomId) {
        this.currentRoomId = roomId;
        this.socket.emit('joinRoom', roomId);
        if (this.devMode.isEnabled()) {
          console.log('✅ Room join request sent:', roomId);
        }
      } else {
        if (this.devMode.isEnabled()) {
          console.log('⚠️ Already in room:', roomId);
        }
      }
    } else {
      if (this.devMode.isEnabled()) {
        console.error('❌ Socket not connected, cannot join room');
      }
    }
  }
  
  onFileUploaded(callback: (file: any) => void): void {
    if (this.socket) {
      this.socket.on('fileUploaded', callback);
    }
  }
  
  onParticipantCountUpdate(callback: (count: number) => void): void {
    if (this.socket) {
      this.socket.on('participantCountUpdate', callback);
    }
  }
  
  onRoomJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('roomJoined', callback);
    }
  }
  
  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }
  
  // 監聽房間關閉事件
  onRoomClosed(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('roomClosed', callback);
    }
  }
  
  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
  
  // 移除所有監聽器
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
