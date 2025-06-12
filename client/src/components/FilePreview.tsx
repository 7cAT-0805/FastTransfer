import React, { useState } from 'react';
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

  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  const isAudio = file.mimetype.startsWith('audio/');
  const isText = file.mimetype.startsWith('text/') || file.mimetype.includes('json');
  const isPDF = file.mimetype.includes('pdf');

  const getFileIcon = () => {
    if (isImage) return ImageIcon;
    if (isVideo) return Video;
    if (isAudio) return Music;
    if (isText || isPDF) return FileText;
    return File;
  };

  const FileIcon = getFileIcon();

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileIcon className="w-6 h-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {file.originalName}
              </h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {file.mimetype}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isImage && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  disabled={zoom <= 25}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  disabled={zoom >= 300}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </>
            )}
            
            <button
              onClick={onDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="flex items-center justify-center min-h-full">
            {isImage && file.previewUrl && (
              <div className="overflow-auto max-w-full max-h-full">
                <img
                  src={file.previewUrl}
                  alt={file.originalName}
                  className="max-w-none h-auto block"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </div>
            )}

            {isVideo && file.previewUrl && (
              <video
                controls
                className="max-w-full max-h-full"
                src={file.previewUrl}
              >
                您的瀏覽器不支援影片播放
              </video>
            )}

            {isAudio && file.previewUrl && (
              <div className="w-full max-w-md">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Music className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{file.originalName}</h4>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <audio
                    controls
                    className="w-full"
                    src={file.previewUrl}
                  >
                    您的瀏覽器不支援音頻播放
                  </audio>
                </div>
              </div>
            )}

            {isPDF && file.previewUrl && (
              <iframe
                src={file.previewUrl}
                className="w-full h-full min-h-[500px] border-0"
                title={file.originalName}
              />
            )}

            {isText && file.previewUrl && (
              <div className="w-full max-w-4xl">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <iframe
                    src={file.previewUrl}
                    className="w-full h-96 border border-gray-200 rounded"
                    title={file.originalName}
                  />
                </div>
              </div>
            )}

            {!isImage && !isVideo && !isAudio && !isPDF && !isText && (
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <File className="w-12 h-12 text-gray-500" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  無法預覽此檔案類型
                </h4>
                <p className="text-gray-600 mb-4">
                  {file.originalName} ({formatFileSize(file.size)})
                </p>
                <button
                  onClick={onDownload}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>下載檔案</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作區 */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              上傳時間: {new Date(file.uploadedAt).toLocaleString('zh-TW')}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                關閉
              </button>
              <button
                onClick={onDownload}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>下載</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
