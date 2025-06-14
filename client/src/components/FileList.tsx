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
  };
  const handleAudioLoaded = (id: string) => {
    const audio = audioRefs.current[id];
    if (audio) {
      setAudioDuration(prev => ({ ...prev, [id]: audio.duration }));
    }  };

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
                          )}                          {/* 圖片：下載 */}
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
                          )}                          {/* 檔案：僅下載按鈕 */}
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
      </div>
        {/* 美化的預覽模態框 */}
      {previewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[85vh] overflow-hidden w-full transform transition-all duration-300 scale-100">
            {/* 標題欄 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  {previewModal.type === 'text' ? (
                    <FileText className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white text-sm">🎵</span>
                  )}
                </div>
                <span>
                  {previewModal.type === 'text' ? '文字內容預覽' : '語音訊息預覽'}
                </span>
              </h3>
              <button
                onClick={() => setPreviewModal(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
              >
                <X className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
              </button>
            </div>

            {/* 內容區域 */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">              {/* 美化的文字預覽 */}
              {previewModal.type === 'text' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                    <div className="bg-white rounded-xl p-6 shadow-inner border border-gray-100">
                      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <pre className="whitespace-pre-wrap break-words text-gray-800 leading-relaxed font-mono text-sm">
{previewModal.content}
                        </pre>
                      </div>
                    </div>
                  </div>
                  
                  {/* 操作按鈕 */}
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => copyToClipboard(previewModal.content)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Copy className="w-5 h-5" />
                      <span>複製文字</span>
                    </button>
                    <button
                      onClick={() => setPreviewModal(null)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-200"
                    >
                      <span>關閉</span>
                    </button>
                  </div>
                </div>
              )}
                {/* 美化的語音預覽 */}
              {previewModal.type === 'voice' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-8 border border-purple-200 shadow-sm">
                    {/* 語音圖示區域 */}
                    <div className="text-center mb-6">
                      <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
                        playingId === previewModal.id 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg scale-110' 
                          : 'bg-gradient-to-br from-purple-200 to-pink-200 hover:scale-105'
                      }`}>
                        <span className="text-2xl">
                          {playingId === previewModal.id ? '🎵' : '🎤'}
                        </span>
                      </div>
                      <p className="text-purple-700 font-medium mt-3">
                        {playingId === previewModal.id ? '正在播放中...' : '點擊播放語音'}
                      </p>
                    </div>
                    
                    {/* 音訊控制器 */}
                    <div className="bg-white rounded-xl p-6 shadow-inner border border-gray-100">
                      <audio
                        ref={el => (audioRefs.current[previewModal.id] = el)}
                        src={previewModal.content.content}
                        preload="auto"
                        onTimeUpdate={() => handleAudioTimeUpdate(previewModal.id)}
                        onLoadedMetadata={() => handleAudioLoaded(previewModal.id)}
                        className="w-full mb-4 rounded-lg"
                        controls
                      />
                      
                      {/* 播放進度資訊 */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">播放進度</span>
                          <span className="font-mono text-sm text-purple-600 font-semibold">
                            {Math.floor(audioProgress[previewModal.id] || 0)}s / {Math.floor(audioDuration[previewModal.id] || previewModal.content.metadata?.duration || 0)}s
                          </span>
                        </div>
                        {(audioDuration[previewModal.id] || previewModal.content.metadata?.duration) && (
                          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-200 shadow-sm"
                              style={{ 
                                width: `${((audioProgress[previewModal.id] || 0) / (audioDuration[previewModal.id] || previewModal.content.metadata?.duration || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 操作按鈕 */}
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => handleVoicePlay(previewModal.id)}
                      className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                        playingId === previewModal.id 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700'
                      }`}
                    >
                      {playingId === previewModal.id ? '⏸️ 暫停播放' : '▶️ 開始播放'}
                    </button>
                    <button
                      onClick={() => handleVoiceDownload(previewModal.content)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Download className="w-5 h-5" />
                      <span>下載</span>
                    </button>
                    <button
                      onClick={() => setPreviewModal(null)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-200"
                    >
                      <span>關閉</span>
                    </button>
                  </div>
                </div>
              )}            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;
