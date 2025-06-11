import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Copy, 
  Users, 
  FileText, 
  Share2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';
import socketService from '../utils/socket';
import { FileInfo } from '../types';
import { copyToClipboard, generateRoomUrl } from '../utils/helpers';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [isHost, setIsHost] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [participants, setParticipants] = useState(0);  const [loading, setLoading] = useState(true);
  const [roomUrl, setRoomUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    const initRoom = async () => {
      try {        // 檢查是否為房主
        const hostId = localStorage.getItem(`room_${roomId}_host`);
        console.log('🏠 Host ID from localStorage:', hostId);
        
        if (hostId) {
          const response = await api.post(`/rooms/${roomId}/verify-host`, { hostId });
          setIsHost(response.data.isHost);
          console.log('✅ Is Host:', response.data.isHost);
        } else {
          // 如果不是房主，嘗試加入房間
          try {
            const joinResponse = await api.post(`/rooms/${roomId}/join`);
            console.log('👥 Joined as guest:', joinResponse.data);
          } catch (error) {
            console.error('❌ Failed to join room:', error);
            toast.error('房間不存在或已關閉');
            navigate('/');
            return;
          }
        }// 獲取房間檔案列表
        const filesResponse = await api.get(`/rooms/${roomId}/files`);
        setFiles(filesResponse.data.files);

        // 設置房間URL
        setRoomUrl(generateRoomUrl(roomId));        // 連接 Socket.IO 並等待連接完成
        console.log('🔌 Connecting to Socket.IO with hostId:', hostId);
        setConnectionStatus('connecting');
        const socket = socketService.connect(hostId ? { hostId } : undefined);

        // 等待 Socket 連接
        const waitForConnection = () => {
          return new Promise<void>((resolve) => {
            if (socket.connected) {
              console.log('✅ Socket already connected');
              setConnectionStatus('connected');
              resolve();
            } else {
              socket.on('connect', () => {
                console.log('✅ Socket connected successfully');
                setConnectionStatus('connected');
                resolve();
              });
              socket.on('connect_error', () => {
                setConnectionStatus('error');
              });
            }
          });
        };

        await waitForConnection();

        // 定義事件處理器
        const handleFileUploaded = (fileInfo: FileInfo) => {
          console.log('收到檔案上傳事件:', fileInfo);
          setFiles(prev => {
            // 避免重複添加同一個檔案
            const exists = prev.find(f => f.id === fileInfo.id);
            if (exists) {
              console.log('檔案已存在，跳過添加:', fileInfo.id);
              return prev;
            }
            console.log('添加新檔案到列表:', fileInfo.id);
            return [...prev, fileInfo];
          });
          // 顯示上傳通知（只對非房主顯示，避免房主看到重複通知）
          if (!isHost) {
            toast.success(`新檔案已上傳: ${fileInfo.originalName}`);
          }
        };

        const handleParticipantCountUpdate = (count: number) => {
          console.log('收到參與者數量更新:', count);
          setParticipants(count);
        };

        const handleRoomJoined = (data: any) => {
          console.log('成功加入房間:', data);
          setFiles(data.files || []);
        };        const handleError = (error: any) => {
          console.error('Socket錯誤:', error);
          toast.error(error.message || '房間連接失敗');
          navigate('/');
        };

        const handleRoomClosed = (data: any) => {
          console.log('房間已關閉:', data);
          toast.error(data.message || '房間已關閉');
          navigate('/');
        };        // 清除之前的監聽器（如果存在）
        socketService.removeAllListeners();

        // 監聽事件
        socketService.onFileUploaded(handleFileUploaded);
        socketService.onParticipantCountUpdate(handleParticipantCountUpdate);
        socketService.onRoomJoined(handleRoomJoined);
        socketService.onError(handleError);
        socketService.onRoomClosed(handleRoomClosed);

        // 加入房間
        console.log('🚪 Joining room:', roomId);
        socketService.joinRoom(roomId);

      } catch (error) {
        toast.error(error instanceof Error ? error.message : '無法加入房間');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    initRoom();    // 清理函數
    return () => {
      socketService.off('fileUploaded');
      socketService.off('participantCountUpdate');
      socketService.off('roomJoined');
      socketService.off('error');
      socketService.off('roomClosed');
      socketService.disconnect();
    };
  }, [roomId, navigate]);

  const handleCopyRoomUrl = async () => {
    const success = await copyToClipboard(roomUrl);
    if (success) {
      toast.success('房間連結已複製到剪貼簿');
    } else {
      toast.error('複製失敗，請手動複製');
    }
  };

  const handleCopyRoomCode = async () => {
    const success = await copyToClipboard(roomId || '');
    if (success) {
      toast.success('房間代碼已複製到剪貼簿');
    } else {
      toast.error('複製失敗，請手動複製');
    }  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">正在載入房間...</p>
          {connectionStatus === 'connecting' && (
            <p className="text-sm text-yellow-600">正在連接服務器，請稍候...</p>
          )}
          {connectionStatus === 'error' && (
            <p className="text-sm text-orange-600">服務器正在啟動中，請稍等片刻...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 房間資訊 */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                房間: {roomId}
                {isHost && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    房主
                  </span>
                )}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{participants} 人在線</span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{files.length} 個檔案</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopyRoomCode}
                className="btn-secondary flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                複製代碼
              </button>
              <button
                onClick={handleCopyRoomUrl}
                className="btn-primary flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                分享連結
              </button>
            </div>
          </div>
          
          {/* 房間說明 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">房間使用說明：</p>                <ul className="space-y-1 list-disc list-inside">
                  <li>只有房主可以上傳檔案</li>
                  <li>所有成員都可以下載檔案</li>
                  <li>房主離開時房間會立即關閉</li>
                  <li>檔案會在房間關閉時立即刪除</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">          {/* 檔案上傳區 (僅房主可見) */}
          {isHost && (
            <div className="lg:col-span-1">
              <FileUploader 
                roomId={roomId!}
              />
            </div>
          )}

          {/* 檔案列表 */}
          <div className={isHost ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <FileList 
              files={files} 
              roomId={roomId!}
            />
          </div>        </div>
      </div>
    </div>
  );
};

export default Room;
