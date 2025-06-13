import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Download, 
  FileText, 
  Image as ImageIcon,
  Video,
  Music,
  File,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { FileInfo } from '../types';
import { formatFileSize } from '../utils/helpers';

interface FilePreviewProps {
  file: FileInfo;
  onClose: () => void;
  onDownload: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose, onDownload }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
      if ((e.key === '+' || e.key === '=') && !e.ctrlKey) {
        e.preventDefault();
        handleZoomIn();
      }
      if (e.key === '-' && !e.ctrlKey) {
        e.preventDefault();
        handleZoomOut();
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // 防止頁面滾動並確保全螢幕覆蓋
    document.body.classList.add('preview-active');
    document.documentElement.classList.add('preview-active');
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('preview-active');
      document.documentElement.classList.remove('preview-active');
    };
  }, []);
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  const isAudio = file.mimetype.startsWith('audio/');
  const isText = file.mimetype.startsWith('text/') || file.mimetype.includes('json') || file.mimetype.includes('xml') || file.mimetype.includes('javascript');
  const isPDF = file.mimetype.includes('pdf');
  const isOfficeDoc = file.mimetype.includes('officedocument');
  
  // 根據文件擴展名進行額外判斷
  const extension = file.originalName.toLowerCase().split('.').pop();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
  const textExtensions = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'py', 'java', 'c', 'cpp'];
  
  const isImageByExt = extension && imageExtensions.includes(extension);
  const isVideoByExt = extension && videoExtensions.includes(extension);
  const isAudioByExt = extension && audioExtensions.includes(extension);
  const isTextByExt = extension && textExtensions.includes(extension);
  
  const finalIsImage = isImage || isImageByExt;
  const finalIsVideo = isVideo || isVideoByExt;
  const finalIsAudio = isAudio || isAudioByExt;
  const finalIsText = isText || isTextByExt;
  const getFileIcon = () => {
    if (finalIsImage) return ImageIcon;
    if (finalIsVideo) return Video;
    if (finalIsAudio) return Music;
    if (finalIsText || isPDF) return FileText;
    return File;
  };

  const FileIcon = getFileIcon();  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // 延遲關閉，讓動畫播放完成
  };  const previewContent = (
    <div 
      className={`fullscreen-preview fixed inset-0 backdrop-blur-sm z-[99999] flex flex-col transition-all duration-300 ${
        isClosing 
          ? 'bg-black/0 opacity-0 scale-95' 
          : 'bg-black/95 opacity-100 scale-100'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        background: isClosing 
          ? 'transparent' 
          : 'radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >      {/* 浮動操作欄 - 更加優雅的設計 */}
      <div className={`absolute top-6 left-6 right-6 z-10 flex items-center justify-between transition-all duration-500 ${
        isClosing ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
      }`}>
        {/* 左側檔案資訊 */}
        <div className="flex items-center space-x-4 bg-black/80 backdrop-blur-xl rounded-2xl px-6 py-4 text-white shadow-2xl border border-white/10 transform hover:scale-105 transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-in fade-in-50 duration-500">
            <FileIcon className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white truncate max-w-md mb-1 animate-in slide-in-from-left duration-500">
              {file.originalName}
            </h3>
            <p className="text-sm text-gray-300 font-medium animate-in slide-in-from-left duration-700">
              {formatFileSize(file.size)} • {file.mimetype.split('/')[0].toUpperCase()}
            </p>
          </div>
        </div>        {/* 右側控制按鈕 */}
        <div className="flex items-center space-x-3 bg-black/80 backdrop-blur-xl rounded-2xl px-4 py-4 shadow-2xl border border-white/10 transform hover:scale-105 transition-all duration-300">
          {finalIsImage && (
            <div className="flex items-center space-x-2 border-r border-white/20 pr-3">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className="p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-110"
                title="縮小 (-)"
              >
                <ZoomOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
              <div className="min-w-[3.5rem] text-center">
                <span className="text-sm font-bold text-white bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                  {zoom}%
                </span>
              </div>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 300}
                className="p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-110"
                title="放大 (+)"
              >
                <ZoomIn className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
              <button
                onClick={handleRotate}
                className="p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-200 group hover:scale-110"
                title="旋轉 (R)"
              >
                <RotateCw className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          )}
          
          <button
            onClick={onDownload}
            className="p-3 rounded-xl text-gray-300 hover:text-white hover:bg-blue-500/50 transition-all duration-200 group hover:scale-110 border border-transparent hover:border-blue-400/30"
            title="下載檔案"
          >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
          <button
            onClick={handleClose}
            className="p-3 rounded-xl text-gray-300 hover:text-white hover:bg-red-500/50 transition-all duration-200 group hover:scale-110 border border-transparent hover:border-red-400/30"
            title="關閉 (ESC)"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>      {/* 主要內容區域 - 優化預覽顯示 */}
      <div className={`flex-1 flex items-center justify-center p-4 sm:p-8 pt-24 sm:pt-32 transition-all duration-500 ${
        isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`} style={{ height: 'calc(100vh - 120px)' }}>        {finalIsImage && file.previewUrl && (
          <div className="relative w-full h-full flex items-center justify-center group preview-container">{/* 載入指示器 */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4 text-white">
                  <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <p className="text-lg font-medium opacity-80">載入中...</p>
                  <p className="text-sm opacity-60">正在載入檔案: {file.originalName}</p>
                </div>
              </div>
            )}            {/* 圖片容器 - 完美居中 */}
            <div className={`flex items-center justify-center w-full h-full transition-all duration-700 ${
              imageLoaded 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 translate-y-4'
            }`}>
              <img
                src={file.previewUrl}
                alt={file.originalName}
                className="max-w-full max-h-full object-contain select-none rounded-2xl shadow-2xl transition-all duration-500 ease-out"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  cursor: zoom > 100 ? 'grab' : 'zoom-in',
                  filter: `drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) ${
                    zoom > 100 ? 'brightness(1.05) contrast(1.02)' : ''
                  }`,
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  minHeight: 'auto',
                  minWidth: 'auto'
                }}
                onClick={() => zoom === 100 ? handleZoomIn() : handleZoomOut()}
                draggable={false}onLoad={() => {
                  console.log('✅ 圖片載入成功:', file.originalName);
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  console.error('❌ 圖片載入失敗:', {
                    filename: file.filename,
                    originalName: file.originalName,
                    previewUrl: file.previewUrl,
                    mimetype: file.mimetype
                  });
                  console.error('Error details:', e);
                  setImageLoaded(true);
                  
                  // 嘗試不同的 URL 格式
                  const fallbackUrl = file.previewUrl?.startsWith('/api') 
                    ? `${window.location.origin}${file.previewUrl}`
                    : file.previewUrl;
                  
                  if (fallbackUrl !== file.previewUrl) {
                    console.log('🔄 嘗試使用完整 URL:', fallbackUrl);
                    // 這裡可以設置一個 fallback URL，但要避免無限循環
                  }
                  
                  toast.error(`無法載入圖片: ${file.originalName}`, { duration: 3000 });
                }}
              />
              
              {/* 圖片光暈效果 */}
              {imageLoaded && (
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-20"
                  style={{
                    background: `radial-gradient(circle at center, transparent 60%, rgba(59, 130, 246, 0.3) 100%)`,
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'all 0.5s ease-out'
                  }}
                />
              )}
            </div>
            
            {/* 縮放提示 */}
            {zoom === 100 && imageLoaded && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-full px-6 py-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10">
                <span className="mr-2">💡</span>
                點擊圖片放大 • 按 ESC 關閉
              </div>
            )}

            {/* 放大狀態提示 */}
            {zoom > 100 && imageLoaded && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-500/80 backdrop-blur-sm rounded-full px-6 py-3 text-white text-sm font-medium border border-blue-400/30">
                <span className="mr-2">🔍</span>
                縮放 {zoom}% • 點擊縮小 • R 旋轉
              </div>
            )}
          </div>
        )}

        {finalIsVideo && file.previewUrl && (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              controls
              autoPlay={false}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              src={file.previewUrl}
              style={{ maxHeight: 'calc(100vh - 8rem)' }}
            >
              您的瀏覽器不支援影片播放
            </video>
          </div>
        )}

        {finalIsAudio && file.previewUrl && (
          <div className="w-full max-w-2xl">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Music className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-2">{file.originalName}</h4>
                  <p className="text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <audio
                controls
                className="w-full h-12 rounded-lg"
                src={file.previewUrl}
                style={{ filter: 'invert(1) hue-rotate(180deg)' }}
              >
                您的瀏覽器不支援音頻播放
              </audio>
            </div>
          </div>
        )}

        {isPDF && file.previewUrl && (
          <div className="w-full h-full">
            <iframe
              src={file.previewUrl}
              className="w-full h-full border-0 rounded-lg"
              title={file.originalName}
              style={{ minHeight: 'calc(100vh - 8rem)' }}
            />
          </div>
        )}        {(finalIsText || isOfficeDoc) && file.previewUrl && (
          <div className="w-full h-full max-w-6xl">
            <div className="bg-white rounded-xl shadow-2xl h-full">
              {isOfficeDoc ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <FileText className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">
                    Office 文檔預覽
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">
                    {file.originalName}
                  </p>
                  <p className="text-gray-500 mb-8">
                    此檔案類型需要下載後使用 Office 軟體開啟
                  </p>
                  <button
                    onClick={onDownload}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-lg font-medium">下載檔案</span>
                  </button>
                </div>
              ) : (
                <iframe
                  src={file.previewUrl}
                  className="w-full h-full border-0 rounded-xl"
                  title={file.originalName}
                />
              )}
            </div>
          </div>
        )}

        {!finalIsImage && !finalIsVideo && !finalIsAudio && !isPDF && !finalIsText && !isOfficeDoc && (
          <div className="text-center text-white">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <File className="w-16 h-16 text-gray-400" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-4">
              無法預覽此檔案類型
            </h4>
            <p className="text-gray-300 mb-8 text-lg">
              {file.originalName}
            </p>
            <p className="text-gray-400 mb-8">
              檔案大小: {formatFileSize(file.size)}
            </p>
            <button
              onClick={onDownload}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl flex items-center space-x-3 mx-auto transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span className="text-lg font-medium">下載檔案</span>
            </button>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 text-gray-300 text-sm">
          <span>按 ESC 關閉</span>
          {finalIsImage && <span> • 點擊圖片縮放 • 使用 +/- 鍵縮放 • R 鍵旋轉</span>}        </div>
      </div>
    </div>
  );

  // 使用 Portal 渲染到 body，確保真正的全螢幕覆蓋
  return createPortal(previewContent, document.body);
};

export default FilePreview;
