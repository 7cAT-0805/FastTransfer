import React, { useState } from 'react';
import { Download, FileText, Clock, MessageSquare, Link as LinkIcon, Clipboard, Mic, ExternalLink, Copy, Play, Pause } from 'lucide-react';
import { FileInfo, ShareMessage } from '../types';
import { formatFileSize, getFileIcon } from '../utils/helpers';
import { toast } from 'react-hot-toast';

interface FileListProps {
  files: FileInfo[];
  messages: ShareMessage[];
  roomId: string;
}

const FileList: React.FC<FileListProps> = ({ files, messages, roomId }) => {
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
                {item.type === 'file' ? (                  // 檔案項目
                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:border-blue-300 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          {getFileIcon(item.data.mimetype)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-lg mb-1">
                            {item.data.originalName}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                              {formatFileSize(item.data.size)}
                            </span>
                            <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
                              <Clock className="w-3 h-3 mr-1 text-blue-500" />
                              <span className="text-blue-600">{formatDate(item.data.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleDownload(item.data)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <Download className="w-5 h-5" />
                          <span>下載檔案</span>
                        </button>
                      </div>
                    </div>
                  </div>                ) : (
                  // 分享內容項目
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:from-blue-100 hover:to-purple-100">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                          {React.createElement(getMessageIcon(item.data.type), { className: "w-6 h-6 text-white" })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-semibold text-gray-900">
                            {getMessageTitle(item.data.type)}
                          </h4>
                          <span className="text-sm text-gray-500 bg-white/70 px-3 py-1 rounded-full">
                            {formatTime(item.data.timestamp)}
                          </span>
                        </div>                        
                        {/* 內容渲染 */}
                        {item.data.type === 'text' && (
                          <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed line-clamp-3 mb-3">
                              {item.data.content}
                            </p>
                            <button
                              onClick={() => copyToClipboard(item.data.content)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              複製文字
                            </button>
                          </div>
                        )}
                        
                        {item.data.type === 'url' && (
                          <div className="bg-white/70 rounded-lg p-4 border border-green-100">
                            <p className="text-gray-800 break-all line-clamp-2 mb-3 bg-green-50 rounded-lg p-3 border border-green-200">
                              {item.data.content}
                            </p>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => openUrl(item.data.content)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                開啟連結
                              </button>                              <button
                                onClick={() => copyToClipboard(item.data.content)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                複製
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {item.data.type === 'clipboard' && (
                          <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 mb-3 max-h-32 overflow-y-auto">
                              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {item.data.content}
                              </p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(item.data.content)}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              複製到剪貼簿
                            </button>
                          </div>
                        )}
                          {item.data.type === 'voice' && (
                          <div className="bg-white/70 rounded-lg p-4 border border-red-100">
                            <div className="flex items-center space-x-4 mb-4">
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
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg ${
                                  playingAudio === item.data.id 
                                    ? 'bg-red-600 animate-pulse' 
                                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                                }`}
                              >
                                {playingAudio === item.data.id ? (
                                  <Pause className="w-6 h-6" />
                                ) : (
                                  <Play className="w-6 h-6 ml-1" />
                                )}
                              </button>
                              
                              {/* 進度條和時間 */}
                              <div className="flex-1 space-y-2">
                                <div className="w-full bg-red-200 rounded-full h-3">
                                  <div 
                                    className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: audioProgress[item.data.id] 
                                        ? `${(audioProgress[item.data.id].currentTime / audioProgress[item.data.id].duration) * 100}%` 
                                        : '0%' 
                                    }}
                                  />
                                </div>
                                <div className="text-sm text-red-600 font-mono">
                                  {audioProgress[item.data.id] ? (
                                    <>
                                      {formatAudioTime(audioProgress[item.data.id].currentTime)} / {formatAudioTime(audioProgress[item.data.id].duration)}
                                    </>
                                  ) : (                                    '0:00 / 0:00'
                                  )}
                                </div>
                                <p className="text-sm text-red-600 mt-1">
                                  {playingAudio === item.data.id ? '正在播放語音訊息...' : '點擊播放語音訊息'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(item.data.content)}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                            >
                              <Copy className="w-4 h-4 mr-2" />
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
          </div>        )}
      </div>
    </div>
  );
};

export default FileList;
