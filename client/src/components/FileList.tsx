import React, { useState } from 'react';
import { Download, FileText, Clock, Eye, MessageSquare, Link as LinkIcon, Clipboard, Mic, ExternalLink, Copy, Play, Pause } from 'lucide-react';
import { FileInfo, ShareMessage } from '../types';
import { formatFileSize, getFileIcon } from '../utils/helpers';
import FilePreview from './FilePreview';
import { toast } from 'react-hot-toast';

interface FileListProps {
  files: FileInfo[];
  messages: ShareMessage[];
  roomId: string;
}

const FileList: React.FC<FileListProps> = ({ files, messages, roomId }) => {
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{[key: string]: {currentTime: number, duration: number}}>({});

  const handleAudioTimeUpdate = (audioId: string, currentTime: number, duration: number) => {
    setAudioProgress(prev => ({
      ...prev,
      [audioId]: { currentTime, duration }
    }));
  };

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已複製到剪貼簿');
    } catch (error) {
      toast.error('複製失敗');
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
      case 'voice': return Mic;
      default: return MessageSquare;
    }
  };

  const getMessageTitle = (type: ShareMessage['type']) => {
    switch (type) {
      case 'text': return '文字訊息';
      case 'url': return '網址分享';
      case 'clipboard': return '剪貼簿內容';
      case 'voice': return '語音訊息';
      default: return '訊息';
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
  };  const handlePreview = (file: FileInfo) => {
    if (!canPreview(file)) {
      toast.error('此檔案類型不支援預覽');
      return;
    }
    // 優先用相對路徑
    const fileWithPreview = {
      ...file,
      previewUrl: `/api/rooms/${roomId}/files/${file.filename}`
    };
    setPreviewFile(fileWithPreview);
  };
  const canPreview = (file: FileInfo) => {
    const previewableTypes = [
      'image/', 
      'video/', 
      'audio/', 
      'text/', 
      'application/pdf',
      'application/json', 
      'application/xml',
      'application/javascript',
      'text/plain',
      'text/html',
      'text/css'
    ];
    
    const isPreviewable = previewableTypes.some(type => 
      file.mimetype.startsWith(type) || file.mimetype.includes(type)
    );
    
    console.log(`🔍 檢查檔案是否可預覽:`, {
      filename: file.originalName,
      mimetype: file.mimetype,
      isPreviewable
    });
    
    return isPreviewable;
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

  // 合併檔案和分享內容，按時間排序
  const allItems = [
    ...files.map(file => ({ type: 'file' as const, data: file, timestamp: new Date(file.uploadedAt) })),
    ...messages.map(message => ({ type: 'message' as const, data: message, timestamp: new Date(message.timestamp) }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-left">
        檔案與內容
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({files.length} 個檔案, {messages.length} 個分享)
        </span>
      </h2>      <div className="flex-1 flex flex-col">
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
              {allItems.map((item, index) => (
                <div key={index}>
                {item.type === 'file' ? (
                  // 檔案項目
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="text-2xl flex-shrink-0">
                          {getFileIcon(item.data.mimetype)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.data.originalName}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatFileSize(item.data.size)}</span>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{formatDate(item.data.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        {canPreview(item.data) && (
                          <button
                            onClick={() => handlePreview(item.data)}
                            className="btn-secondary flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>預覽</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(item.data)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>下載</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 分享內容項目
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors bg-gradient-to-r from-blue-50/30 to-purple-50/30">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          {React.createElement(getMessageIcon(item.data.type), { className: "w-5 h-5 text-white" })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {getMessageTitle(item.data.type)}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(item.data.timestamp)}
                          </span>
                        </div>
                        
                        {/* 內容渲染 */}
                        {item.data.type === 'text' && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed line-clamp-3">
                              {item.data.content}
                            </p>
                            <button
                              onClick={() => copyToClipboard(item.data.content)}
                              className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              複製
                            </button>
                          </div>
                        )}
                        
                        {item.data.type === 'url' && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-800 break-all line-clamp-2">
                              {item.data.content}
                            </p>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => openUrl(item.data.content)}
                                className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                開啟
                              </button>
                              <button
                                onClick={() => copyToClipboard(item.data.content)}
                                className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                複製
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {item.data.type === 'clipboard' && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed line-clamp-3">
                              {item.data.content}
                            </p>
                            <button
                              onClick={() => copyToClipboard(item.data.content)}
                              className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              複製
                            </button>
                          </div>
                        )}
                        
                        {item.data.type === 'voice' && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <audio
                                id={`audio-${item.data.id}`}
                                src={item.data.content}
                                onTimeUpdate={(e) => {
                                  const audio = e.target as HTMLAudioElement;
                                  handleAudioTimeUpdate(item.data.id, audio.currentTime, audio.duration);
                                }}
                                onPlay={() => setPlayingAudio(item.data.id)}
                                onPause={() => setPlayingAudio(null)}
                                onEnded={() => setPlayingAudio(null)}
                                style={{ display: 'none' }}
                              />
                              
                              {/* 播放按鈕 */}
                              <button
                                onClick={() => {
                                  const audio = document.getElementById(`audio-${item.data.id}`) as HTMLAudioElement;
                                  if (playingAudio === item.data.id) {
                                    audio.pause();
                                  } else {
                                    audio.play();
                                  }
                                }}
                                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0"
                              >
                                {playingAudio === item.data.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4 ml-0.5" />
                                )}
                              </button>
                              
                              {/* 進度條和時間 */}
                              <div className="flex-1 space-y-1">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                                    style={{ 
                                      width: audioProgress[item.data.id] 
                                        ? `${(audioProgress[item.data.id].currentTime / audioProgress[item.data.id].duration) * 100}%` 
                                        : '0%' 
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-gray-600 font-mono">
                                  {audioProgress[item.data.id] ? (
                                    <>
                                      {formatAudioTime(audioProgress[item.data.id].currentTime)} / {formatAudioTime(audioProgress[item.data.id].duration)}
                                    </>
                                  ) : (
                                    '0:00 / 0:00'
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(item.data.content)}
                              className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center transition-colors"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              複製連結
                            </button>
                          </div>
                        )}
                      </div>
                    </div>                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 檔案預覽模態框 */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={() => handleDownload(previewFile)}
        />
      )}
    </div>
  );
};

export default FileList;
