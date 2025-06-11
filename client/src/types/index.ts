export interface Room {
  id: string;
  hostId: string;
  createdAt: Date;
  participants: number;
  files: FileInfo[];
}

export interface FileInfo {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadedAt: Date;
  mimetype: string;
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
