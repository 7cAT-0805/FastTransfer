export interface Room {
  id: string;
  hostId: string;
  createdAt: Date;
  participants: number;
  files: FileInfo[];
  messages: ShareMessage[];
}

export interface FileInfo {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadedAt: Date;
  mimetype: string;
  previewUrl?: string;
  thumbnailUrl?: string;
}

// 新增分享訊息類型
export interface ShareMessage {
  id: string;
  type: 'text' | 'clipboard' | 'voice' | 'image';
  content: string;
  metadata?: {
    duration?: number; // 語音長度
    size?: number;     // 檔案大小
    fileName?: string; // 原始檔名
  };
  senderName?: string;
  timestamp: Date;
}

export interface CreateRoomResponse {
  roomId: string;
  hostId: string;
  message: string;
}

export interface JoinRoomResponse {
  userId: string;
  roomId: string;
  isHost: boolean;
  files: FileInfo[];
  message: string;
}

export interface ApiError {
  error: string;
}
