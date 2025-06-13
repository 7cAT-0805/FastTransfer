import React from 'react';
import { 
  MessageSquare, 
  Link as LinkIcon, 
  Clipboard, 
  Image as ImageIcon, 
  Play, 
  Pause,
  ExternalLink,
  Copy,
  Download,
  Sparkles,
  Clock
} from 'lucide-react';
import { ShareMessage } from '../types';
import { toast } from 'react-hot-toast';
import { formatFileSize } from '../utils/helpers';

interface MessageListProps {
  messages: ShareMessage[];
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, className = '' }) => {
  const [playingAudio, setPlayingAudio] = React.useState<string | null>(null);
  const audioRefs = React.useRef<{ [key: string]: HTMLAudioElement }>({});

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已複製到剪貼簿');
    } catch (error) {
      toast.error('複製失敗');
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleAudio = (messageId: string, audioUrl: string) => {
    const audio = audioRefs.current[messageId] || new Audio(audioUrl);
    audioRefs.current[messageId] = audio;

    if (playingAudio === messageId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      // 停止其他正在播放的音頻
      Object.values(audioRefs.current).forEach(a => a.pause());
      setPlayingAudio(messageId);
      
      audio.play().catch(() => {
        toast.error('播放失敗');
        setPlayingAudio(null);
      });
      
      audio.onended = () => setPlayingAudio(null);
    }
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getMessageIcon = (type: ShareMessage['type']) => {
    switch (type) {
      case 'text': return MessageSquare;
      case 'url': return LinkIcon;
      case 'clipboard': return Clipboard;
      case 'image': return ImageIcon;
      case 'voice': return playingAudio ? Pause : Play;
      default: return MessageSquare;
    }
  };

  const getMessageTitle = (type: ShareMessage['type']) => {
    switch (type) {
      case 'text': return '文字訊息';
      case 'url': return '網址分享';
      case 'clipboard': return '剪貼簿內容';
      case 'image': return '照片分享';
      case 'voice': return '語音訊息';
      default: return '訊息';
    }
  };

  const getMessageColor = (type: ShareMessage['type']) => {
    switch (type) {
      case 'text': return 'from-blue-500 to-blue-600';
      case 'url': return 'from-green-500 to-green-600';
      case 'clipboard': return 'from-purple-500 to-purple-600';
      case 'voice': return 'from-red-500 to-pink-600';
      case 'image': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (messages.length === 0) {
    return (
      <div className={`card h-full flex flex-col ${className}`}>
        <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gradient-text">
          <Sparkles className="w-6 h-6 mr-3" />
          分享內容
          <span className="ml-2 text-sm font-normal text-gray-500">
            (0 個項目)
          </span>
        </h2>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">還沒有分享內容</h3>
            <p className="text-gray-500 mb-4">使用左側的快速分享功能開始分享吧！</p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
              <span className="bg-gray-100 px-3 py-1 rounded-full">文字</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">網址</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">剪貼簿</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">語音</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card h-full flex flex-col ${className}`}>
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gradient-text">
        <Sparkles className="w-6 h-6 mr-3" />
        分享內容
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({messages.length} 個項目)
        </span>
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((message) => {
          const Icon = getMessageIcon(message.type);
          const colorClass = getMessageColor(message.type);
          
          return (            <div
              key={message.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:border-blue-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-lg mb-1">
                      {getMessageTitle(message.type)}
                    </p>                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                        {message.type === 'text' && formatFileSize(new Blob([message.content]).size)}
                        {message.type === 'url' && '網址連結'}
                        {message.type === 'clipboard' && formatFileSize(new Blob([message.content]).size)}
                        {message.type === 'voice' && message.metadata?.size ? formatFileSize(message.metadata.size) : '語音檔案'}
                        {message.type === 'image' && message.metadata?.size ? formatFileSize(message.metadata.size) : '圖片檔案'}
                      </span>
                      <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3 mr-1 text-blue-500" />
                        <span className="text-blue-600">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                    
                    {/* 內容預覽 - 與檔案項目風格一致 */}
                    <div className="mt-2 text-sm text-gray-600">
                      {message.type === 'text' && (
                        <p className="truncate">內容: {message.content}</p>
                      )}
                      {message.type === 'url' && (
                        <p className="truncate">網址: {message.content}</p>
                      )}
                      {message.type === 'clipboard' && (
                        <p className="truncate">剪貼簿: {message.content}</p>
                      )}
                      {message.type === 'voice' && (
                        <p className={playingAudio === message.id ? 'text-red-600' : ''}>
                          {playingAudio === message.id ? '正在播放語音訊息...' : '語音訊息'}
                        </p>
                      )}
                      {message.type === 'image' && (
                        <p>圖片: {message.metadata?.fileName || '未命名.jpg'}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 操作按鈕區域 - 與檔案項目風格一致 */}
                <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                  {message.type === 'text' && (
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Copy className="w-5 h-5" />
                      <span>複製文字</span>
                    </button>
                  )}
                  
                  {message.type === 'url' && (
                    <>
                      <button
                        onClick={() => openUrl(message.content)}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span>開啟連結</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Copy className="w-5 h-5" />
                        <span>複製</span>
                      </button>
                    </>
                  )}
                  
                  {message.type === 'clipboard' && (
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Copy className="w-5 h-5" />
                      <span>複製到剪貼簿</span>
                    </button>
                  )}
                  
                  {message.type === 'voice' && (
                    <>
                      <button
                        onClick={() => toggleAudio(message.id, message.content)}
                        className={`px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          playingAudio === message.id 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                        }`}
                      >
                        {playingAudio === message.id ? (
                          <><Pause className="w-5 h-5" /><span>暫停</span></>
                        ) : (
                          <><Play className="w-5 h-5" /><span>播放</span></>
                        )}
                      </button>
                      <button
                        onClick={() => downloadFile(message.content, '語音訊息.wav')}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Download className="w-5 h-5" />
                        <span>下載</span>
                      </button>
                    </>
                  )}
                  
                  {message.type === 'image' && (
                    <button
                      onClick={() => downloadFile(message.content, message.metadata?.fileName || '照片.jpg')}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Download className="w-5 h-5" />
                      <span>下載照片</span>
                    </button>                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageList;
