import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, X, FileText, AlertCircle, Sparkles } from 'lucide-react';
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

    // 防止重複上傳    if (isUploading) return;

    setIsUploading(true);

    let successCount = 0;
    let errorCount = 0;

    try {      // 依序上傳每個檔案
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileKey = `${file.name}-${file.size}`;
        
        try {
          const formData = new FormData();
          formData.append('file', file);await apiWrapper.post(`/rooms/${roomId}/upload`, formData, {
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
    <div className="card h-full flex flex-col">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gradient-text">
        <Sparkles className="w-6 h-6 mr-3" />
        檔案上傳
      </h2>

      <div className="flex-1 flex flex-col">        {selectedFiles.length === 0 ? (
          <div>
            <div
              className={`upload-zone transition-all duration-300 transform ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg' 
                  : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 hover:border-blue-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <div className="text-center py-8">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDragging 
                    ? 'bg-blue-500 text-white animate-bounce' 
                    : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-500 hover:from-blue-200 hover:to-purple-200'
                }`}>
                  <Upload className="w-10 h-10" />
                </div>
                <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                  isDragging ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {isDragging ? '放開檔案開始上傳' : '拖拽檔案到此處'}
                </h3>
                <p className="text-gray-600 mb-4 text-lg">
                  或 <span className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700">點擊選擇檔案</span>
                </p>
                <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
                  <span className="bg-gray-200 px-3 py-1 rounded-full">支援多檔案</span>
                  <span className="bg-gray-200 px-3 py-1 rounded-full">最大 100MB</span>
                  <span className="bg-gray-200 px-3 py-1 rounded-full">所有格式</span>
                </div>
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
          </div>        ) : (
          <div className="space-y-6 flex-1 flex flex-col">
            {/* 檔案列表標題 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                已選擇的檔案 
                <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                  {selectedFiles.length}
                </span>
              </h3>
              <button
                onClick={openFileDialog}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                <Upload className="w-4 h-4 mr-1" />
                添加更多
              </button>
            </div>

            {/* 檔案列表 */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-2">
              {selectedFiles.map((file, index) => {
                const fileKey = `${file.name}-${file.size}`;
                const progress = uploadProgress[fileKey] || 0;
                
                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-blue-300">
                    <div className="flex items-center justify-between">                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate text-lg mb-1">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                              {formatFileSize(file.size)}
                            </span>
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                              {file.type || '未知格式'}
                            </span>
                            {isUploading && progress > 0 && (
                              <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">                                {progress}%
                              </span>
                            )}
                          </div>
                          {isUploading && progress > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-sm" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveFile(index)}
                        disabled={isUploading}
                        className="text-gray-400 hover:text-red-500 transition-all duration-200 p-2 hover:bg-red-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        title="移除檔案"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>            {/* 上傳控制按鈕區域 */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span className="text-lg">上傳中...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mr-3" />
                      <span className="text-lg">上傳全部檔案 ({selectedFiles.length})</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setUploadProgress({});
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={isUploading}
                  className="sm:w-auto w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  <span className="text-lg">清空列表</span>
                </button>
              </div>
              
              {/* 檔案統計資訊 */}
              <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    檔案數量: {selectedFiles.length}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                    總大小: {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
                  </span>
                </div>
                <span className="text-gray-500 text-xs mt-2 sm:mt-0">
                  點擊「添加更多」繼續選擇檔案
                </span>
              </div>
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
