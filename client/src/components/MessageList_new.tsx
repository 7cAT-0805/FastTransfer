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
  Sparkles
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
          
          return (
            <div
              key={message.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:border-gray-300"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-gray-900">
                      {getMessageTitle(message.type)}
                    </h4>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {/* 內容渲染 */}
                  {message.type === 'text' && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-gray-800 whitespace-pre-wrap mb-3 leading-relaxed">
                        {message.content}
                      </p>
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        複製文字
                      </button>
                    </div>
                  )}
                  
                  {message.type === 'url' && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-gray-800 mb-3 break-all bg-white rounded-lg p-3 border border-green-200">
                        {message.content}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openUrl(message.content)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          開啟連結
                        </button>
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          複製
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {message.type === 'clipboard' && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <div className="bg-white rounded-lg p-3 border border-purple-200 mb-3 max-h-32 overflow-y-auto">
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        複製到剪貼簿
                      </button>
                    </div>
                  )}
                  
                  {message.type === 'voice' && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
                      <div className="flex items-center space-x-4 mb-4">
                        <button
                          onClick={() => toggleAudio(message.id, message.content)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                            playingAudio === message.id 
                              ? 'bg-red-600 animate-pulse' 
                              : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                          }`}
                        >
                          {playingAudio === message.id ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6 ml-1" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="w-full bg-red-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full w-0 transition-all"></div>
                          </div>
                          <p className="text-sm text-red-600 mt-2">
                            {playingAudio === message.id ? '正在播放...' : '點擊播放語音訊息'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-600 bg-white/70 px-3 py-1 rounded-full">
                          語音訊息
                          {message.metadata?.size && ` (${formatFileSize(message.metadata.size)})`}
                        </span>
                        <button
                          onClick={() => downloadFile(message.content, '語音訊息.wav')}
                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          下載
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {message.type === 'image' && (
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                      <img
                        src={message.content}
                        alt="分享的照片"
                        className="max-w-full h-auto rounded-xl mb-4 max-h-64 object-cover border border-yellow-200"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-700 bg-white/70 px-3 py-1 rounded-full">
                          {message.metadata?.fileName && `檔名: ${message.metadata.fileName}`}
                          {message.metadata?.size && ` (${formatFileSize(message.metadata.size)})`}
                        </span>
                        <button
                          onClick={() => downloadFile(message.content, message.metadata?.fileName || '照片.jpg')}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          下載照片
                        </button>
                      </div>
                    </div>
                  )}
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
