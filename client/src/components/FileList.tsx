import React, { useRef, useState } from 'react';
import { Download, FileText, Clock, Eye, Copy, X } from 'lucide-react';
import { FileInfo, ShareMessage } from '../types';
import { formatFileSize, getFileIcon } from '../utils/helpers';
import { toast } from 'react-hot-toast';

interface FileListProps {
  files: FileInfo[];
  messages: ShareMessage[];
  roomId: string;
}

const FileList: React.FC<FileListProps> = ({ files, messages, roomId }) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>({});
  const [audioDuration, setAudioDuration] = useState<{ [key: string]: number }>({});
  const [previewModal, setPreviewModal] = useState<{ type: string; content: any; id: string } | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已複製到剪貼簿');
    } catch (error) {
      toast.error('複製失敗');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = (file: FileInfo) => {
    const downloadUrl = `/api/rooms/${roomId}/files/${file.filename}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 合併檔案和分享內容，按時間排序，並過濾掉 clipboard
  const allItems = [
    ...files.map(file => ({ type: 'file' as const, data: file, timestamp: new Date(file.uploadedAt) })),
    ...messages.filter(msg => msg.type !== 'clipboard').map(message => ({ type: 'message' as const, data: message, timestamp: new Date(message.timestamp) }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // 處理語音訊息下載
  const handleVoiceDownload = (message: ShareMessage) => {
    let url = message.content;
    const a = document.createElement('a');
    a.href = url;
    a.download = message.metadata?.fileName || '語音訊息.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 處理語音播放/暫停
  const handleVoicePlay = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
    } else {
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId]?.pause();
      }
      audio.play();
      setPlayingId(id);
      audio.onended = () => setPlayingId(null);
    }
  };

  // 處理語音進度
  const handleAudioTimeUpdate = (id: string) => {
    const audio = audioRefs.current[id];
    if (audio) {
      setAudioProgress(prev => ({ ...prev, [id]: audio.currentTime }));
    }
  };  const handleAudioLoaded = (id: string) => {
    const audio = audioRefs.current[id];
    if (audio && isFinite(audio.duration)) {
      setAudioDuration(prev => ({ ...prev, [id]: audio.duration }));
    }
  };

  // 預覽文字/語音 - 僅支援這兩種類型
  const handlePreview = (item: any) => {
    const id = item.type === 'file' ? item.data.id : item.data.id;
    if (item.type === 'message' && item.data.type === 'text') {
      setPreviewModal({ type: 'text', content: item.data.content, id });
    } else if (item.type === 'message' && item.data.type === 'voice') {
      setPreviewModal({ type: 'voice', content: item.data, id });
    }
  };

  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-left">
        檔案與內容
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({files.length} 個檔案, {messages.length} 個分享)
        </span>
      </h2>
      
      <div className="flex-1 flex flex-col">
        {allItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">尚無內容</p>
              <p className="text-gray-400 text-sm mt-2">
                開始上傳檔案或分享內容
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
            style={{ height: '524.5px', maxHeight: '524.5px' }}
          >
            <div className="space-y-3">
              {allItems.map((item, index) => {
                const id = item.type === 'file' ? item.data.id : item.data.id;
                return (
                  <div key={index}>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:border-blue-300 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            {/* 檔案用 getFileIcon，內容用 emoji */}
                            {item.type === 'file'
                              ? getFileIcon(item.data.mimetype)
                              : (item.data.type === 'text' ? '📄' 
                                 : item.data.type === 'image' ? '🖼️' 
                                 : item.data.type === 'voice' ? '🎵' 
                                 : '📄')
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-lg mb-1">
                              {item.type === 'file' 
                                ? item.data.originalName 
                                : (item.data.type === 'text' ? '文字訊息' 
                                   : item.data.type === 'image' ? '照片分享' 
                                   : item.data.type === 'voice' ? '語音訊息' 
                                   : '訊息')
                              }
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                                {item.type === 'file'
                                  ? formatFileSize(item.data.size)
                                  : (item.data.type === 'text')
                                    ? formatFileSize(new Blob([item.data.content]).size)
                                    : item.data.metadata?.size
                                      ? formatFileSize(item.data.metadata.size)
                                      : '不明大小'}
                              </span>
                              <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
                                <Clock className="w-3 h-3 mr-1 text-blue-500" />
                                <span className="text-blue-600">
                                  {item.type === 'file' 
                                    ? formatDate(item.data.uploadedAt) 
                                    : formatTime(item.data.timestamp)
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-4 flex-shrink-0">                          {/* 文字訊息：預覽與複製 */}
                          {item.type === 'message' && item.data.type === 'text' && (
                            <>
                              <button
                                onClick={() => handlePreview(item)}
                                className="bg-gray-200 hover:bg-gray-300 text-blue-600 px-4 py-3 rounded-xl flex items-center space-x-2 font-medium"
                              >
                                <Eye className="w-5 h-5" />
                                <span>預覽</span>
                              </button>
                              <button
                                onClick={() => copyToClipboard(item.data.content)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium"
                              >
                                <Copy className="w-5 h-5" />
                                <span>複製</span>
                              </button>
                            </>
                          )}
                          {/* 語音訊息：預覽與下載 */}
                          {item.type === 'message' && item.data.type === 'voice' && (
                            <>
                              <audio
                                ref={el => (audioRefs.current[id] = el)}
                                src={item.data.content}
                                preload="auto"
                                style={{ display: 'none' }}
                                onTimeUpdate={() => handleAudioTimeUpdate(id)}
                                onLoadedMetadata={() => handleAudioLoaded(id)}
                              />
                              <button
                                onClick={() => handlePreview(item)}
                                className="bg-gray-200 hover:bg-gray-300 text-blue-600 px-4 py-3 rounded-xl flex items-center space-x-2 font-medium"
                              >
                                <Eye className="w-5 h-5" />
                                <span>預覽</span>
                              </button>
                              <button
                                onClick={() => handleVoiceDownload(item.data)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium"
                              >
                                <Download className="w-5 h-5" />
                                <span>下載</span>
                              </button>
                            </>
                          )}                          {/* 圖片：僅下載，無預覽 */}
                          {item.type === 'message' && item.data.type === 'image' && (
                            <button
                              onClick={() => handleDownload({
                                id: 'image-' + Date.now(),
                                filename: item.data.content,
                                originalName: item.data.metadata?.fileName || '照片.jpg',
                                size: item.data.metadata?.size || 0,
                                uploadedAt: item.data.timestamp,
                                mimetype: 'image/jpeg',
                              })}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium"
                            >
                              <Download className="w-5 h-5" />
                              <span>下載</span>
                            </button>
                          )}{/* 檔案：僅下載按鈕 */}
                          {item.type === 'file' && (
                            <button
                              onClick={() => handleDownload(item.data)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium"
                            >
                              <Download className="w-5 h-5" />
                              <span>下載</span>
                            </button>
                          )}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}
      </div>        {/* 全螢幕語音與文字預覽模態框 */}
      {previewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md z-50 flex items-center justify-center transition-all duration-300">
          {/* 文字預覽 - 全螢幕覆蓋 */}
          {previewModal.type === 'text' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white">
              {/* 關閉按鈕 */}
              <button
                onClick={() => setPreviewModal(null)}
                className="absolute top-8 right-8 p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 group z-10"
              >
                <X className="w-8 h-8 text-white group-hover:text-gray-200" />
              </button>

              {/* 文字內容區域 */}
              <div className="flex flex-col items-center justify-center space-y-8 max-w-4xl w-full">
                {/* 文字圖示 */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-2xl">
                  <FileText className="w-16 h-16 text-white" />
                </div>

                {/* 文字標題 */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">文字內容</h2>
                  <p className="text-xl text-gray-300">分享的文字訊息</p>
                </div>                {/* 文字內容卡片 - 加強圓邊邊框 */}
                <div className="w-full bg-white bg-opacity-95 backdrop-blur-xl rounded-3xl border-2 border-white border-opacity-60 shadow-2xl p-8 max-h-[60vh] overflow-hidden ring-1 ring-white ring-opacity-25">
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-sm max-h-full overflow-hidden">
                    <div className="bg-white rounded-xl p-6 shadow-inner border border-gray-100 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <pre className="whitespace-pre-wrap break-words text-gray-800 leading-relaxed font-mono text-sm">
{previewModal.content}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* 控制按鈕 */}
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => copyToClipboard(previewModal.content)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 font-bold text-lg transition-all duration-300 shadow-xl transform hover:scale-105"
                  >
                    <Copy className="w-6 h-6" />
                    <span>複製</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 語音預覽 - 全螢幕覆蓋，加圓邊邊框 */}
          {previewModal.type === 'voice' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white">
              {/* 關閉按鈕 */}
              <button
                onClick={() => setPreviewModal(null)}
                className="absolute top-8 right-8 p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 group z-10"
              >
                <X className="w-8 h-8 text-white group-hover:text-gray-200" />
              </button>              {/* 語音播放區域 - 加強圓邊邊框視覺效果 */}
              <div className="flex flex-col items-center justify-center space-y-8 max-w-2xl w-full bg-white bg-opacity-15 backdrop-blur-xl rounded-3xl border-2 border-white border-opacity-50 shadow-2xl p-12 ring-1 ring-white ring-opacity-25">
                {/* 語音圖示 */}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                  playingId === previewModal.id 
                    ? 'bg-gradient-to-br from-purple-400 to-pink-400 shadow-2xl scale-110 animate-pulse' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105 shadow-xl'
                }`}>
                  <span className="text-6xl">
                    {playingId === previewModal.id ? '🎵' : '🎤'}
                  </span>
                </div>

                {/* 語音標題 */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">語音訊息</h2>
                  <p className="text-xl text-gray-300">
                    {playingId === previewModal.id ? '正在播放中...' : '點擊下方按鈕開始播放'}
                  </p>
                </div>

                {/* 隱藏的音頻元素 */}
                <audio
                  ref={el => (audioRefs.current[previewModal.id] = el)}
                  src={previewModal.content.content}
                  preload="auto"
                  onTimeUpdate={() => handleAudioTimeUpdate(previewModal.id)}
                  onLoadedMetadata={() => handleAudioLoaded(previewModal.id)}
                  style={{ display: 'none' }}
                />

                {/* 播放進度條 */}
                <div className="w-full bg-white bg-opacity-20 rounded-full h-4 shadow-inner backdrop-blur-sm border border-white border-opacity-30">
                  <div 
                    className="bg-gradient-to-r from-purple-300 to-pink-300 h-4 rounded-full transition-all duration-200 shadow-lg"
                    style={{ 
                      width: `${(() => {
                        const current = audioProgress[previewModal.id] || 0;
                        const total = audioDuration[previewModal.id] || previewModal.content.metadata?.duration || 1;
                        return isFinite(total) && total > 0 ? (current / total) * 100 : 0;
                      })()}%` 
                    }}
                  />
                </div>{/* 時間顯示 - 改善邏輯 */}
                <div className="text-center">
                  <span className="text-2xl font-mono font-bold text-gray-200">
                    {Math.floor(audioProgress[previewModal.id] || 0)}s / {
                      (() => {
                        const duration = audioDuration[previewModal.id];
                        if (duration && isFinite(duration) && duration > 0) {
                          return Math.floor(duration);
                        }
                        const metaDuration = previewModal.content.metadata?.duration;
                        if (metaDuration && isFinite(metaDuration) && metaDuration > 0) {
                          return Math.floor(metaDuration);
                        }
                        return '--';
                      })()
                    }s
                  </span>
                </div>

                {/* 控制按鈕 */}
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleVoicePlay(previewModal.id)}
                    className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl transform hover:scale-105 ${
                      playingId === previewModal.id 
                        ? 'bg-white text-purple-600 hover:bg-gray-100' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    }`}
                  >
                    {playingId === previewModal.id ? '⏸️ 暫停' : '▶️ 播放'}
                  </button>
                  
                  <button
                    onClick={() => handleVoiceDownload(previewModal.content)}
                    className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-6 py-4 rounded-2xl flex items-center space-x-3 font-medium transition-all duration-300 shadow-lg transform hover:scale-105"
                  >
                    <Download className="w-6 h-6" />
                    <span className="text-lg">下載</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileList;
