import React from 'react';
import { 
  Download,
  FileText
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
      });      audio.onended = () => setPlayingAudio(null);
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
              <FileText className="w-10 h-10 text-gray-400" />
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
          // 統一卡片標題
          const getTitle = () => {
            switch (message.type) {
              case 'text': return '文字訊息';
              case 'clipboard': return '剪貼簿內容';
              case 'image': return '照片分享';
              case 'voice': return '語音訊息';
              default: return '訊息';
            }
          };
          // 統一卡片圖標
          const getIcon = () => {
            switch (message.type) {
              case 'text': return '📄';
              case 'clipboard': return '📋';
              case 'image': return '🖼️';
              case 'voice': return '🎵';
              default: return '📄';
            }
          };
          // 統一卡片大小
          const getSize = () => {
            if (message.type === 'text' || message.type === 'clipboard') {
              return formatFileSize(new Blob([message.content]).size);
            } else if (message.metadata?.size) {
              return formatFileSize(message.metadata.size);
            }
            return '不明大小';
          };
          return (
            <div
              key={message.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="text-3xl flex-shrink-0">
                    {getIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-lg mb-1">
                      {getTitle()}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                        {getSize()}
                      </span>
                      <span className="text-blue-600">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                  <button
                    onClick={() => {
                      if (message.type === 'text' || message.type === 'clipboard') {
                        copyToClipboard(message.content);
                      } else if (message.type === 'voice') {
                        toggleAudio(message.id, message.content);
                      } else if (message.type === 'image') {
                        downloadFile(message.content, message.metadata?.fileName || '照片.jpg');
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium"
                  >
                    <Download className="w-5 h-5" />
                    <span>下載檔案</span>
                  </button>
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
