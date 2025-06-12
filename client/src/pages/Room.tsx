import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Copy, 
  Users, 
  FileText, 
  AlertCircle,
  QrCode,
  X
} from 'lucide-react';
import apiWrapper from '../utils/api';
import socketService from '../utils/socket';
import { FileInfo, ShareMessage } from '../types';
import { copyToClipboard, generateRoomUrl } from '../utils/helpers';
import FileList from '../components/FileList';
import QRCodeGenerator from '../components/QRCodeGenerator';
import ShareAndUpload from '../components/ShareAndUpload';
import { NetworkError, useErrorHandler } from '../components/ErrorDisplay';
import { DeveloperMode } from '../utils/developerMode';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { error: networkError, handleError: handleNetworkError, clearError: clearNetworkError } = useErrorHandler();
  
  const [isHost, setIsHost] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [participants, setParticipants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roomUrl, setRoomUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [showQRCode, setShowQRCode] = useState(false);
  const [messages, setMessages] = useState<ShareMessage[]>([]);
  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    // 初始化開發者模式
    const devMode = DeveloperMode.getInstance();
    
    // 如果是開發者模式，從開發者模式獲取角色
    if (devMode.isEnabled()) {
      setIsHost(devMode.getRole());
      console.log('🛠️ 開發者模式已啟用，角色:', devMode.getRole() ? '房主' : '訪客');
    }

    const initRoom = async () => {
      try {        // 檢查是否為房主
        const hostId = localStorage.getItem(`room_${roomId}_host`);
        console.log('🏠 Host ID from localStorage:', hostId);
          if (hostId) {
          const response = await apiWrapper.post(`/rooms/${roomId}/verify-host`, { hostId });
          setIsHost(response.data.isHost);
          console.log('✅ Is Host:', response.data.isHost);
        } else {
          // 如果不是房主，嘗試加入房間
          try {
            const joinResponse = await apiWrapper.post(`/rooms/${roomId}/join`);
            console.log('👥 Joined as guest:', joinResponse.data);
          } catch (error) {
            console.error('❌ Failed to join room:', error);
            toast.error('房間不存在或已關閉');
            navigate('/');
            return;
          }
        }// 獲取房間檔案列表
        const filesResponse = await apiWrapper.get(`/rooms/${roomId}/files`);
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

        await waitForConnection();        // 定義事件處理器
        const handleFileUploaded = (fileInfo: FileInfo) => {
          setFiles(prev => {
            // 多重條件去重
            const exists = prev.find(f =>
              f.id === fileInfo.id ||
              f.filename === fileInfo.filename ||
              (f.originalName === fileInfo.originalName && f.size === fileInfo.size)
            );
            if (exists) return prev;
            return [fileInfo, ...prev];
          });
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
          const errorMessage = error.message || '房間連接失敗';
          
          // 檢查是否為網路錯誤
          if (errorMessage.includes('Network') || errorMessage.includes('連線') || errorMessage.includes('網路')) {
            handleNetworkError(errorMessage);
          } else {
            toast.error(errorMessage);
          }
          
          setConnectionStatus('error');
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
    };    initRoom();

    // 開發者模式事件監聽器
    const handleDevModeRoleChanged = (event: CustomEvent) => {
      console.log('🛠️ 開發者模式角色變更:', event.detail);
      setIsHost(event.detail.isHost);
      
      // 顯示角色切換提示
      const roleText = event.detail.isHost ? '房主' : '訪客';
      toast.success(`開發者模式: 已切換為${roleText}視角`, {
        icon: event.detail.isHost ? '👑' : '👥',
        duration: 3000,
      });
    };

    const handleDevModeDataCleared = () => {
      console.log('🛠️ 開發者模式數據已清空');
      setFiles([]);
      setMessages([]);
      toast.success('開發者模式: 測試數據已清空', {
        icon: '🗑️',
      });
    };

    const handleDevModeFileAdded = (event: CustomEvent) => {
      console.log('🛠️ 開發者模式添加檔案:', event.detail.file);
      setFiles(prev => [...prev, event.detail.file]);
      toast.success(`開發者模式: 已添加 ${event.detail.file.originalName}`, {
        icon: '📁',
      });
    };

    const handleDevModeMessageAdded = (event: CustomEvent) => {
      console.log('🛠️ 開發者模式添加訊息:', event.detail.message);
      setMessages(prev => [...prev, event.detail.message]);
      toast.success('開發者模式: 已添加測試訊息', {
        icon: '💬',
      });
    };

    // 添加事件監聽器
    window.addEventListener('devModeRoleChanged', handleDevModeRoleChanged as EventListener);
    window.addEventListener('devModeDataCleared', handleDevModeDataCleared as EventListener);
    window.addEventListener('devModeFileAdded', handleDevModeFileAdded as EventListener);
    window.addEventListener('devModeMessageAdded', handleDevModeMessageAdded as EventListener);

    // 清理函數
    return () => {
      socketService.off('fileUploaded');
      socketService.off('participantCountUpdate');
      socketService.off('roomJoined');
      socketService.off('error');
      socketService.off('roomClosed');
      socketService.disconnect();
      
      // 移除開發者模式事件監聽器
      window.removeEventListener('devModeRoleChanged', handleDevModeRoleChanged as EventListener);
      window.removeEventListener('devModeDataCleared', handleDevModeDataCleared as EventListener);
      window.removeEventListener('devModeFileAdded', handleDevModeFileAdded as EventListener);
      window.removeEventListener('devModeMessageAdded', handleDevModeMessageAdded as EventListener);
    };
  }, [roomId, navigate]);
  // 處理分享訊息
  const handleMessageSent = (message: ShareMessage) => {
    setMessages(prev => [...prev, message]);
    // 這裡可以通過 Socket.IO 廣播訊息給房間其他成員
    // socketService.emit('shareMessage', message);
  };

  const handleCopyRoomUrl = async () => {
    // 顯示 QR Code 模態對話框，而不是直接複製
    setShowQRCode(true);
  };

  const handleCopyRoomCode = async () => {
    const success = await copyToClipboard(roomId || '');
    if (success) {
      toast.success('房間代碼已複製到剪貼簿');
    } else {
      toast.error('複製失敗，請手動複製');
    }  };
  // 重試加入房間的函數
  const retryJoinRoom = async () => {
    if (!roomId) return;
    
    clearNetworkError();
    setLoading(true);
    setConnectionStatus('connecting');
    
    try {
      console.log('🔄 重試加入房間:', roomId);
      socketService.joinRoom(roomId);
      
      // 等待連接結果
      setTimeout(() => {
        if (connectionStatus === 'connecting') {
          setConnectionStatus('connected');
        }
      }, 3000);
    } catch (error) {
      console.error('重試失敗:', error);
      handleNetworkError(error instanceof Error ? error.message : '重試失敗');    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* 房間資訊 */}
        <div className="card mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 text-content">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  房間 {roomId}
                </span>
                {isHost && (
                  <div className="inline-flex items-center ml-2 sm:ml-4 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-1 sm:mr-2 animate-ping"></div>
                    <span className="mr-1">👑</span>
                    房主
                  </div>
                )}
              </h1>
              <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{participants} 人在線</span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{files.length} 個檔案</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleCopyRoomCode}
                className="btn-secondary flex items-center justify-center text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                複製代碼
              </button>
              <button
                onClick={handleCopyRoomUrl}
                className="btn-primary flex items-center justify-center text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4"
              >
                <QrCode className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                分享 QR Code
              </button>
            </div>
          </div>

          {/* 房間說明 - 移動端優化 */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-200/50 shadow-sm">
            <div className="flex">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-0.5 mr-3 sm:mr-4 flex-shrink-0" />
              <div className="text-blue-800">
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-gray-900">房間使用說明</h3>
                <ul className="space-y-1.5 sm:space-y-2 list-none text-xs sm:text-sm text-content">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">所有成員都可以上傳和下載檔案，享受無限制的檔案分享體驗</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">所有成員都可以發送快速分享，包括文字、網址、剪貼簿和語音訊息</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">房主離開時房間會立即關閉，請確保重要檔案已下載完成</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">檔案會在房間關閉時立即刪除，無法恢復，請及時保存</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 網路錯誤顯示 */}
        {networkError && (
          <div className="mb-4 sm:mb-6">
            <NetworkError
              error={networkError}
              onRetry={retryJoinRoom}
              onDismiss={clearNetworkError}
              title="連線問題"
            />
          </div>
        )}

        {/* 主內容區域 - 移動端響應式布局 */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* 左側：統一的上傳和分享區域 */}
          <div className="lg:w-1/3">
            <ShareAndUpload 
              roomId={roomId!}
              onMessageSent={handleMessageSent}
              onFileUploaded={(file) => {
                setFiles(prev => {
                  const exists = prev.find(f =>
                    f.id === file.id ||
                    f.filename === file.filename ||
                    (f.originalName === file.originalName && f.size === file.size)
                  );
                  if (exists) return prev;
                  return [file, ...prev];
                });
              }}
            />
          </div>

          {/* 右側：檔案和內容列表 */}
          <div className="lg:w-2/3">
            <FileList 
              files={files} 
              messages={messages}
              roomId={roomId!}
            />
          </div>
        </div>

        {/* QR Code 模態對話框 */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowQRCode(false)}>            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="text-center relative">
                <button
                  onClick={() => setShowQRCode(false)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">分享房間</h3>
                <QRCodeGenerator roomUrl={roomUrl} roomId={roomId!} />
                <div className="mt-4">
                <button
                    onClick={async () => {
                      const success = await copyToClipboard(roomUrl);
                      if (success) {
                        toast.success('房間連結已複製到剪貼簿');
                      } else {
                        toast.error('複製失敗，請手動複製');
                      }
                    }}
                    className="btn-secondary w-full mb-2 flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    複製房間連結
                  </button>
                  <button
                    onClick={() => setShowQRCode(false)}
                    className="btn-primary w-full"
                  >
                    關閉
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
