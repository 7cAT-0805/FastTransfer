import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { apiWrapper } from '../utils/api';
import { formatFileSize } from '../utils/helpers';

interface FileUploaderProps {
  roomId: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ roomId }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilesSelect(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelect(Array.from(files));
    }
  };
  const handleFilesSelect = (files: File[]) => {
    // 檢查檔案大小並過濾 (100MB)
    const validFiles = files.filter(file => {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`檔案 ${file.name} 大小不能超過 100MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    // 防止重複上傳
    if (isUploading) return;

    setIsUploading(true);
    const hostId = localStorage.getItem(`room_${roomId}_host`);
    
    if (!hostId) {
      toast.error('無法驗證房主身份');
      setIsUploading(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    try {      // 依序上傳每個檔案
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileKey = `${file.name}-${file.size}`;
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('hostId', hostId);          await apiWrapper.post(`/rooms/${roomId}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: any) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(prev => ({
                  ...prev,
                  [fileKey]: percentCompleted
                }));
              }
            },
          });

          successCount++;
          setUploadProgress(prev => ({
            ...prev,
            [fileKey]: 100
          }));
        } catch (error) {
          console.error(`上傳檔案 ${file.name} 失敗:`, error);
          errorCount++;
        }
      }      // 顯示上傳結果
      if (successCount > 0) {
        toast.success(`成功上傳 ${successCount} 個檔案！`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} 個檔案上傳失敗`);
      }

      // 清理
      setSelectedFiles([]);
      setUploadProgress({});
      
      // 重置檔案輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('批量上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card h-full flex flex-col">      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center text-gray-800">
        <Upload className="w-6 h-6 mr-3" />
        上傳檔案
      </h2>

      <div className="flex-1 flex flex-col">        {selectedFiles.length === 0 ? (
          <div>
            <div
              className={`upload-zone ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >              <div className="text-center">
                <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors duration-200 ${
                  isDragging ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {isDragging ? '放開以上傳檔案' : '拖拽檔案到此處'}
                </h3>
                <p className="text-gray-500 mb-4">
                  或 <span className="text-blue-600 cursor-pointer">點擊選擇檔案</span>
                </p>
                <p className="text-sm text-gray-400">
                  支援多個檔案，最大 100MB
                </p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept="*/*"
              multiple
            />
          </div>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col">            {/* 檔案列表標題 */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                已選擇的檔案 ({selectedFiles.length})
              </h3>
            </div>{/* 檔案列表 */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-80">
              {selectedFiles.map((file, index) => {
                const fileKey = `${file.name}-${file.size}`;
                const progress = uploadProgress[fileKey] || 0;
                
                return (                  <div key={index} className="file-item">
                    <div className="flex items-center justify-between">                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="file-icon">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-base">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                            <span className="font-medium">{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{file.type || '未知格式'}</span>
                            {isUploading && progress > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 font-semibold">{progress}%</span>
                              </>
                            )}
                          </div>
                          {isUploading && progress > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>                      <button
                        onClick={() => handleRemoveFile(index)}
                        disabled={isUploading}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-md disabled:opacity-50"
                        title="移除檔案"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>            {/* 上傳控制按鈕 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="btn-primary flex-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span>上傳中...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-3" />
                    <span>上傳全部檔案 ({selectedFiles.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 上傳提示 */}
        <div className="mt-6 glass-effect p-4 rounded-xl border border-yellow-200/50">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mr-3 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-800 mb-1">重要提醒</p>
              <p className="text-yellow-700">
                檔案將在房主離開時立即刪除，請確保接收方及時下載。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
