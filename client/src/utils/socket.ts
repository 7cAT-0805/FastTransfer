import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private currentRoomId: string | null = null;
    connect(auth?: { hostId?: string }): Socket {
    // 如果已經連接，直接返回現有連接
    if (this.socket && this.socket.connected) {
      return this.socket;
    }
    
    // 先斷開舊連接
    this.disconnect();
    
    // 強制使用 Render 後端 URL
    const serverUrl = 'https://fastransfer-backend.onrender.com';
    console.log('🔌 Socket connecting to:', serverUrl);
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      timeout: 20000,
      auth: auth || {}
    });
      this.socket.on('connect', () => {
      console.log('Socket連接成功');
    });
    
    this.socket.on('disconnect', (reason) => {
      this.currentRoomId = null;
      console.log('Socket連接斷開:', reason);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket連接錯誤:', error);
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
    if (this.socket && this.isSocketConnected()) {
      // 避免重複加入同一個房間
      if (this.currentRoomId !== roomId) {
        this.currentRoomId = roomId;
        this.socket.emit('joinRoom', roomId);
        console.log('加入房間:', roomId);
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
