import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquare, Clipboard, Mic, Send, Sparkles } from 'lucide-react';
import { ShareMessage } from '../types';

interface QuickShareProps {
  roomId: string;
  onMessageSent: (message: ShareMessage) => void;
}

const QuickShare: React.FC<QuickShareProps> = ({ roomId, onMessageSent }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'clipboard' | 'voice'>('text');
  const [textInput, setTextInput] = useState('');
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
    
    onMessageSent(message);    setTextInput('');
    toast.success(`文字訊息已發送到房間 ${roomId}`);
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
    { id: 'clipboard', label: '剪貼簿', icon: Clipboard },
    { id: 'voice', label: '語音', icon: Mic }
  ];return (
    <div className="card flex flex-col">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gradient-text">
        <Sparkles className="w-6 h-6 mr-3" />
        快速分享
      </h2>      
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex flex-col items-center justify-center py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 transform ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105 border border-blue-400'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:scale-102 bg-white/50'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform duration-300 ${
                  activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                <span className="text-xs font-semibold">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full opacity-80"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'text' && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">文字訊息分享</h3>
                <p className="text-sm text-gray-600">將文字內容即時分享到房間</p>
              </div>
            </div>
            
            <div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="輸入要分享的文字訊息..."
                className="w-full p-4 border-2 border-blue-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm text-sm shadow-sm"
                rows={4}
              />
            </div>
            
            <button
              onClick={sendTextMessage}
              disabled={!textInput.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:shadow-none text-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              發送文字訊息
            </button>          </div>
        )}
        {activeTab === 'clipboard' && (
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clipboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">剪貼簿內容分享</h3>
                <p className="text-sm text-gray-600">將剪貼簿內容同步到房間</p>
              </div>
            </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-purple-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <Clipboard className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-purple-700 font-medium">點擊下方按鈕讀取剪貼簿</p>
                  <p className="text-xs text-purple-600 mt-1">
                    將您剪貼簿中的內容快速分享到房間
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={shareClipboard}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
            >              <Clipboard className="w-4 h-4 mr-2" />
              分享剪貼簿內容
            </button>
          </div>
        )}        {activeTab === 'voice' && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-5 border border-red-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                isRecording 
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 animate-pulse' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">語音訊息錄製</h3>
                <p className="text-sm text-gray-600">
                  {isRecording ? '正在錄音中...' : '錄製語音並即時分享到房間'}
                </p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-red-200 shadow-sm">
              <div className="text-center">
                {isRecording ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div>                      <p className="text-red-600 font-semibold text-sm">正在錄音中...</p>
                      <p className="text-red-500 text-xs">點擊停止按鈕完成錄製</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold text-sm">準備錄製語音</p>
                      <p className="text-gray-600 text-xs">點擊下方按鈕開始錄製語音訊息</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 text-sm animate-pulse"              >
                <div className="w-3 h-3 mr-2 bg-white rounded-full animate-pulse"></div>
                停止錄音
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <Mic className="w-4 h-4 mr-2" />
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
