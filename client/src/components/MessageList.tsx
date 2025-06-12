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
  Download
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };if (messages.length === 0) {
    return (
      <div className={`card flex flex-col ${className}`}>        <h2 className="text-xl md:text-2xl font-bold mb-6 text-left">
          分享內容
          <span className="ml-2 text-sm font-normal text-gray-500">
            (0 個項目)
          </span>
        </h2>
        
        <div className="min-h-0 flex items-center justify-center">
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
  }  return (
    <div className={`card flex flex-col ${className}`}>      <h2 className="text-xl md:text-2xl font-bold mb-6 text-left">
        分享內容
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({messages.length} 個項目)
        </span>
      </h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map((message) => {
          const Icon = getMessageIcon(message.type);
          
          return (
            <div
              key={message.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {getMessageTitle(message.type)}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {/* 內容渲染 */}
                  {message.type === 'text' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        複製
                      </button>
                    </div>
                  )}
                  
                  {message.type === 'url' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-800 break-all">
                        {message.content}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openUrl(message.content)}
                          className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          開啟
                        </button>
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          複製
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {message.type === 'clipboard' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-20 overflow-y-auto">
                        {message.content}
                      </p>
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        複製
                      </button>
                    </div>
                  )}
                  
                  {message.type === 'voice' && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAudio(message.id, message.content)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                            playingAudio === message.id 
                              ? 'bg-blue-600' 
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          {playingAudio === message.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full w-0 transition-all"></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {playingAudio === message.id ? '正在播放...' : '語音訊息'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(message.content, '語音訊息.wav')}
                        className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        下載
                      </button>
                    </div>
                  )}
                  
                  {message.type === 'image' && (
                    <div className="space-y-2">
                      <img
                        src={message.content}
                        alt="分享的照片"
                        className="max-w-full h-auto rounded-lg max-h-32 object-cover border border-gray-200"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {message.metadata?.fileName && `${message.metadata.fileName}`}
                          {message.metadata?.size && ` (${formatFileSize(message.metadata.size)})`}
                        </span>
                        <button
                          onClick={() => downloadFile(message.content, message.metadata?.fileName || '照片.jpg')}
                          className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          下載
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
