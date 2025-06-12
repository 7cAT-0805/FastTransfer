import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquare, Link, Clipboard, Mic, Send, Sparkles } from 'lucide-react';
import { ShareMessage } from '../types';

interface QuickShareProps {
  roomId: string;
  isHost?: boolean;
  onMessageSent: (message: ShareMessage) => void;
}

const QuickShare: React.FC<QuickShareProps> = ({ roomId, isHost = false, onMessageSent }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'clipboard' | 'voice'>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

  const sendUrlMessage = async () => {
    if (!urlInput.trim()) return;
    
    let formattedUrl = urlInput;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      formattedUrl = 'https://' + urlInput;
    }
    
    const message: ShareMessage = {
      id: generateId(),
      type: 'url',
      content: formattedUrl,
      metadata: { title: urlInput },
      timestamp: new Date()
    };
    
    onMessageSent(message);
    setUrlInput('');
    toast.success('網址已分享到房間');
  };
  const shareClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error('剪貼簿是空的');
        return;
      }
      
      const message: ShareMessage = {
        id: generateId(),
        type: 'clipboard',
        content: text,
        timestamp: new Date()
      };
      
      onMessageSent(message);
      toast.success('剪貼簿內容已分享到房間');
    } catch (error) {
      toast.error('無法讀取剪貼簿');
    }
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const message: ShareMessage = {
          id: generateId(),
          type: 'voice',
          content: audioUrl,
          metadata: { 
            size: audioBlob.size,
            duration: 0
          },
          timestamp: new Date()
        };
        
        onMessageSent(message);
        toast.success('語音訊息已發送');
        
        // 停止所有音軌
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      setIsRecording(true);
      recorder.start();
      toast.success('開始錄音...');
    } catch (error) {
      toast.error('無法訪問麥克風');
      console.error('Error accessing microphone:', error);
    }
  };  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const tabs = [
    { id: 'text', label: '文字', icon: MessageSquare },
    { id: 'url', label: '網址', icon: Link },
    { id: 'clipboard', label: '剪貼簿', icon: Clipboard },
    { id: 'voice', label: '語音', icon: Mic }
  ];  return (
    <div className="card flex flex-col">      <h2 className="text-xl md:text-2xl font-bold mb-6 text-left">
        快速分享
      </h2>
      
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex flex-col items-center justify-center py-2 px-2 rounded-md text-sm font-medium transition-all duration-300 transform ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm scale-101 border border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:scale-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 mb-1 transition-transform duration-300 ${
                  activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                <span className="text-xs font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-primary-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'text' && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-xs">文字訊息</h3>
                <p className="text-xs text-gray-600">分享文字內容到房間</p>
              </div>
            </div>
            
            <div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="輸入要分享的文字訊息..."
                className="w-full p-2.5 border-2 border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-sm"
                rows={3}
              />
            </div>
            
            <button
              onClick={sendTextMessage}
              disabled={!textInput.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2.5 px-3 rounded-md transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-101 disabled:transform-none disabled:shadow-none text-sm"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              發送文字訊息
            </button>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Link className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-xs">網址分享</h3>
                <p className="text-xs text-gray-600">分享網址連結到房間</p>
              </div>
            </div>
            
            <div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2.5 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-sm"
              />
            </div>
            
            <button
              onClick={sendUrlMessage}
              disabled={!urlInput.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2.5 px-3 rounded-md transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-101 disabled:transform-none disabled:shadow-none text-sm"
            >
              <Link className="w-3.5 h-3.5 mr-1.5" />
              分享網址
            </button>
          </div>
        )}

        {activeTab === 'clipboard' && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Clipboard className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-xs">剪貼簿同步</h3>
                <p className="text-xs text-gray-600">分享剪貼簿內容到房間</p>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-md p-2.5 border border-blue-200">
              <div className="flex items-start space-x-2">
                <Clipboard className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-800">一鍵分享</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    將您剪貼簿中的內容快速分享到房間
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={shareClipboard}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-3 rounded-md transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-101 text-sm"
            >
              <Clipboard className="w-3.5 h-3.5 mr-1.5" />
              分享剪貼簿內容
            </button>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 space-y-3">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'bg-blue-500 animate-pulse' 
                  : 'bg-blue-500'
              }`}>
                <Mic className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-xs">語音訊息</h3>
                <p className="text-xs text-gray-600">
                  {isRecording ? '正在錄音中...' : '錄製語音並分享到房間'}
                </p>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-md p-3 border border-blue-200">
              <div className="text-center">
                {isRecording ? (
                  <div className="space-y-2">
                    <div className="w-8 h-8 mx-auto bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium text-xs">正在錄音中...</p>
                      <p className="text-xs text-blue-500">點擊停止按鈕完成錄製</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-8 h-8 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                      <Mic className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium text-xs">準備錄音</p>
                      <p className="text-xs text-gray-600">點擊下方按鈕開始錄製語音訊息</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-3 rounded-md transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-101 text-sm"
              >
                <div className="w-3 h-3 mr-1.5 bg-white rounded-full animate-pulse"></div>
                停止錄音
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-3 rounded-md transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-101 text-sm"
              >
                <Mic className="w-3.5 h-3.5 mr-1.5" />
                開始錄音
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickShare;
