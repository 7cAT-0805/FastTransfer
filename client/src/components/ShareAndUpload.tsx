import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, MessageSquare, Mic, Send } from 'lucide-react';
import { ShareMessage } from '../types';
import apiWrapper from '../utils/api';
import ErrorDisplay, { useErrorHandler } from './ErrorDisplay';

interface ShareAndUploadProps {
  roomId: string;
  onMessageSent: (message: ShareMessage) => void;
  onFileUploaded?: (file: any) => void;
}

const ShareAndUpload: React.FC<ShareAndUploadProps> = ({ 
  roomId, 
  onMessageSent,
  onFileUploaded 
}) => {
  const { error: uploadError, handleError: handleUploadError, clearError: clearUploadError } = useErrorHandler();
    const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'voice'>('upload');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 檔案上傳
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await apiWrapper.post(`/rooms/${roomId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },      });      console.log('📤 檔案上傳 API 回應:', response.data);
      
      // 確保檔案數據完整傳遞 - 使用 response.data.file
      if (response.data && response.data.file && onFileUploaded) {
        onFileUploaded(response.data.file);
      } else {
        console.warn('⚠️ 檔案上傳成功但沒有收到完整檔案數據:', {
          hasResponseData: !!response.data,
          hasFileData: !!(response.data && response.data.file),
          hasCallback: !!onFileUploaded,
          responseData: response.data
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : '檔案上傳失敗';
      
      // 檢查是否為網路錯誤
      if (errorMessage.includes('Network') || errorMessage.includes('timeout') || errorMessage.includes('連線')) {
        handleUploadError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // 重置檔案輸入
      event.target.value = '';
    }
  };

  // 快速分享功能
  const sendTextMessage = async () => {
    if (!textInput.trim()) return;
    const message: ShareMessage = {
      id: generateId(),
      type: 'text',
      content: textInput.trim(),
      timestamp: new Date()
    };
    onMessageSent(message);
    setTextInput('');
    toast.success(`文字訊息已發送到房間 ${roomId}`);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        // 取得正確 duration
        const tempAudio = new Audio(audioUrl);
        tempAudio.onloadedmetadata = () => {
          const message: ShareMessage = {
            id: generateId(),
            type: 'voice',
            content: audioUrl,
            metadata: { size: audioBlob.size, duration: tempAudio.duration },
            timestamp: new Date()
          };
          onMessageSent(message);
          toast.success('語音訊息已錄製完成');
          stream.getTracks().forEach(track => track.stop());
        };
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('開始錄音...');
    } catch (error) {
      toast.error('無法訪問麥克風');
    }
  };
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };  const tabs = [
    { id: 'upload', label: '上傳', icon: Upload },
    { id: 'text', label: '文字', icon: MessageSquare },
    { id: 'voice', label: '語音', icon: Mic },
  ] as const;
  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-left">
        上傳檔案
      </h2>
      <div className="flex-1 flex flex-col">
        {/* 錯誤顯示 */}
        {uploadError && (
          <div className="mb-4">
            <ErrorDisplay
              error={uploadError}
              onRetry={() => {
                clearUploadError();
                // 觸發重新上傳邏輯
              }}
              onDismiss={clearUploadError}
              type="error"
              title="上傳失敗"
            />
          </div>
        )}

        {/* 標籤導航 - 手機優化 */}
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1 p-1 bg-white rounded-xl mb-4 sm:mb-6 border border-gray-200 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-1 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex flex-col items-center gap-0.5 sm:gap-1 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Icon className="w-3 sm:w-4 h-3 sm:h-4" />
                <span className="text-[9px] sm:text-[10px] leading-tight">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* 內容區域 - 手機響應式高度 */}
        <div className="h-72 sm:h-80 flex flex-col">
          {activeTab === 'upload' && (
            <div className="h-full flex flex-col space-y-3 sm:space-y-4">
              <div className="flex-1 border-2 border-dashed border-blue-200 rounded-2xl p-4 sm:p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  accept="*/*"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer block text-center w-full ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform duration-200'}`}
                >
                  <div className="mb-2 sm:mb-3">
                    <Upload className="w-10 sm:w-12 h-10 sm:h-12 text-blue-400 mx-auto mb-2 animate-bounce" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                    {isUploading ? '正在上傳...' : '點擊上傳檔案'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                    支援所有檔案格式<br />
                    <span className="text-blue-600 font-medium">最大 100MB</span>
                  </p>
                </label>
              </div>
              
              {isUploading && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-700">上傳進度</span>
                    <span className="text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="輸入要分享的文字內容..."
                  className="w-full h-full p-4 border-0 bg-transparent text-gray-900 placeholder-gray-500 resize-none focus:outline-none text-content"
                  style={{ fontFamily: 'inherit' }}
                />
              </div>
              <button
                onClick={sendTextMessage}
                disabled={!textInput.trim()}
                className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                發送文字訊息              </button>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="h-full flex flex-col justify-center space-y-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200/50">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-red-100'}`}>
                  <Mic className={`w-8 h-8 ${isRecording ? 'text-white animate-pulse' : 'text-red-500'}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {isRecording ? '正在錄音中...' : '語音訊息'}
                </h3>
                <p className="text-gray-600 text-content max-w-sm mx-auto">
                  {isRecording ? '點擊停止按鈕結束錄音' : '點擊下方按鈕開始錄製語音訊息'}
                </p>
              </div>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-4 text-lg flex items-center justify-center font-medium transition-all rounded-xl ${
                  isRecording
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25'
                    : 'btn-primary'
                }`}
              >
                <Mic className={`w-5 h-5 mr-3 ${isRecording ? 'animate-pulse' : ''}`} />
                {isRecording ? '停止錄音' : '開始錄音'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareAndUpload;
