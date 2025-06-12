import React, { useState } from 'react';
import { Download, FileText, Clock, Eye } from 'lucide-react';
import { FileInfo } from '../types';
import { formatFileSize, getFileIcon } from '../utils/helpers';
import FilePreview from './FilePreview';

interface FileListProps {
  files: FileInfo[];
  roomId: string;
}

const FileList: React.FC<FileListProps> = ({ files, roomId }) => {
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);

  const handleDownload = (file: FileInfo) => {
    const downloadUrl = `/api/rooms/${roomId}/files/${file.filename}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (file: FileInfo) => {
    // 為預覽設置檔案 URL
    const fileWithPreview = {
      ...file,
      previewUrl: `/api/rooms/${roomId}/files/${file.filename}`
    };
    setPreviewFile(fileWithPreview);
  };

  const canPreview = (file: FileInfo) => {
    const previewableTypes = [
      'image/', 'video/', 'audio/', 'text/', 'application/pdf',
      'application/json', 'application/xml'
    ];
    return previewableTypes.some(type => file.mimetype.startsWith(type) || file.mimetype.includes(type));
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
  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gradient-text">
        <FileText className="w-6 h-6 mr-3" />
        檔案列表
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({files.length} 個檔案)
        </span>
      </h2>

      <div className="flex-1 flex flex-col">
        {files.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">尚無檔案</p>
              <p className="text-gray-400 text-sm mt-2">
                等待房主上傳檔案
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* 檔案圖示 */}
                    <div className="text-2xl flex-shrink-0">
                      {getFileIcon(file.mimetype)}
                    </div>
                    
                    {/* 檔案資訊 */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {file.originalName}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{formatDate(file.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>                  {/* 操作按鈕 */}
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    {canPreview(file) && (
                      <button
                        onClick={() => handlePreview(file)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>預覽</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>下載</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>        )}
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
