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
    }
  };  // 判斷檔案是否可預覽
  const canPreview = (item: any) => {
    if (item.type === 'message') {
      return ['text', 'image', 'voice'].includes(item.data.type);
    } else if (item.type === 'file') {
      const mimetype = item.data.mimetype;
      return mimetype.startsWith('text/') || 
             mimetype === 'application/json' ||
             mimetype.startsWith('image/') ||
             mimetype === 'application/pdf';
    }
    return false;
  };

  // 預覽圖片/文字/語音/PDF
  const handlePreview = (item: any) => {
    const id = item.type === 'file' ? item.data.id : item.data.id;
    if (item.type === 'message' && item.data.type === 'text') {
      setPreviewModal({ type: 'text', content: item.data.content, id });
    } else if (item.type === 'message' && item.data.type === 'image') {
      setPreviewModal({ type: 'image', content: item.data.content, id });
    } else if (item.type === 'message' && item.data.type === 'voice') {
      setPreviewModal({ type: 'voice', content: item.data, id });
    } else if (item.type === 'file') {
      const mimetype = item.data.mimetype;
      if (mimetype.startsWith('text/') || mimetype === 'application/json') {
        setPreviewModal({ type: 'file-text', content: item.data, id });
      } else if (mimetype.startsWith('image/')) {
        setPreviewModal({ type: 'file-image', content: item.data, id });
      } else if (mimetype === 'application/pdf') {
        setPreviewModal({ type: 'file-pdf', content: item.data, id });
      } else {
        setPreviewModal({ type: 'unsupported', content: item.data, id });
      }
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
                          )}
                          {/* 圖片：預覽與下載 */}
                          {item.type === 'message' && item.data.type === 'image' && (
                            <>
                              <button
                                onClick={() => handlePreview(item)}
                                className="bg-gray-200 hover:bg-gray-300 text-blue-600 px-4 py-3 rounded-xl flex items-center space-x-2 font-medium"
                              >
                                <Eye className="w-5 h-5" />
                                <span>預覽</span>
                              </button>
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
                            </>
                          )}                          {/* 檔案：預覽與下載 */}
                          {item.type === 'file' && (
                            <>
                              {canPreview(item) && (
                                <button
                                  onClick={() => handlePreview(item)}
                                  className="bg-gray-200 hover:bg-gray-300 text-blue-600 px-4 py-3 rounded-xl flex items-center space-x-2 font-medium"
                                >
                                  <Eye className="w-5 h-5" />
                                  <span>預覽</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(item.data)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium"
                              >
                                <Download className="w-5 h-5" />
                                <span>下載</span>
                              </button>
                            </>
                          )}                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}
      </div>
      
      {/* 浮動預覽模態框 */}
      {previewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[80vh] overflow-auto w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">內容預覽</h3>
              <button
                onClick={() => setPreviewModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">              {/* 圖片預覽（訊息或檔案） */}
              {(previewModal.type === 'image' || previewModal.type === 'file-image') && (
                <img 
                  src={previewModal.type === 'image' ? previewModal.content : `/api/rooms/${roomId}/files/${previewModal.content.filename}`}
                  alt="圖片預覽" 
                  className="max-w-full max-h-[60vh] rounded-lg mx-auto"
                />
              )}
              {/* PDF 檔案預覽 */}
              {previewModal.type === 'file-pdf' && (
                <iframe
                  src={`/api/rooms/${roomId}/files/${previewModal.content.filename}`}
                  title="PDF 預覽"
                  className="w-full min-h-[60vh] max-h-[80vh] rounded-lg border"
                />
              )}
              {/* 文字預覽 */}
              {previewModal.type === 'text' && (
                <pre className="whitespace-pre-wrap break-all text-gray-800 bg-gray-50 p-4 rounded-lg">
                  {previewModal.content}
                </pre>
              )}
              {/* 語音預覽 */}
              {previewModal.type === 'voice' && (
                <div className="text-center">
                  <audio
                    ref={el => (audioRefs.current[previewModal.id] = el)}
                    src={previewModal.content.content}
                    preload="auto"
                    onTimeUpdate={() => handleAudioTimeUpdate(previewModal.id)}
                    onLoadedMetadata={() => handleAudioLoaded(previewModal.id)}
                    controls
                    className="mb-4"
                  />
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => handleVoicePlay(previewModal.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                      {playingId === previewModal.id ? '暫停' : '播放'}
                    </button>
                    <span className="text-gray-700">
                      {Math.floor(audioProgress[previewModal.id] || 0)} / {Math.floor(audioDuration[previewModal.id] || previewModal.content.metadata?.duration || 0)} 秒
                    </span>
                  </div>
                </div>
              )}
              {/* 文字檔案預覽 */}
              {previewModal.type === 'file-text' && (
                <FilePreview file={previewModal.content} />
              )}
              {/* 不支援預覽 */}
              {previewModal.type === 'unsupported' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">無法預覽此檔案</h3>
                  <p className="text-gray-500 mb-4">
                    檔案類型：{previewModal.content.mimetype || '未知'}
                  </p>
                  <p className="text-sm text-gray-400">
                    請下載檔案以查看內容
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 文字檔案預覽元件
const FilePreview: React.FC<{ file: FileInfo }> = ({ file }) => {
  const [content, setContent] = useState<string>('');
  React.useEffect(() => {
    fetch(`/api/rooms/${file.id}/preview`)
      .then(res => res.text())
      .then(setContent)
      .catch(() => setContent('預覽失敗'));
  }, [file.id]);
  return <pre className="whitespace-pre-wrap break-all text-gray-800 max-h-64 overflow-y-auto">{content}</pre>;
};

export default FileList;
