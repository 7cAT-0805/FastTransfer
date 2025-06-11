import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Users, Upload, Shield, Zap, Globe } from 'lucide-react';
import api from '../utils/api';
import { CreateRoomResponse, JoinRoomResponse } from '../types';

const Home: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const response = await api.post<CreateRoomResponse>('/rooms');
      const { roomId, hostId } = response.data;
      
      // 儲存房主身份
      localStorage.setItem(`room_${roomId}_host`, hostId);
      
      toast.success('房間創建成功！');
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '創建房間失敗');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error('請輸入房間代碼');
      return;
    }    setIsJoining(true);
    try {
      await api.post<JoinRoomResponse>(`/rooms/${joinCode.toUpperCase()}/join`);
      toast.success('成功加入房間！');
      navigate(`/room/${joinCode.toUpperCase()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '加入房間失敗');
    } finally {
      setIsJoining(false);
    }
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 sm:mb-8 animate-float">
              <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              快速
              <span className="gradient-text">檔案傳輸</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              無需註冊，創建房間即可開始安全快速的檔案分享。支援所有檔案格式，讓檔案傳輸變得簡單。
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* 創建房間 */}            <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-4 sm:mb-6">
                  <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">創建房間</h3>
                <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  成為房主，創建專屬房間並上傳檔案供他人下載
                </p>
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="btn-primary w-full text-base sm:text-lg"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      創建中...
                    </div>
                  ) : (
                    '創建新房間'
                  )}
                </button>
              </div>
            </div>
            
            {/* 加入房間 */}
            <div className="card floating-card">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl mx-auto mb-4 sm:mb-6">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">加入房間</h3>
                <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  輸入房間代碼，加入現有房間下載檔案
                </p>
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="輸入房間代碼"
                    className="input-field text-center text-lg sm:text-xl font-mono tracking-wider"
                    maxLength={8}
                  />
                  <button
                    type="submit"
                    disabled={isJoining}
                    className="btn-primary w-full text-base sm:text-lg"
                  >
                    {isJoining ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        加入中...
                      </div>
                    ) : (
                      '加入房間'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">為什麼選擇 FastTransfer？</h2>
            <p className="text-xl text-gray-600">簡單、快速、安全的檔案傳輸解決方案</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">閃電般快速</h3>
              <p className="text-gray-600">
                優化的傳輸協議確保檔案能夠以最快速度傳送，節省您的寶貴時間。
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">安全可靠</h3>
              <p className="text-gray-600">
                檔案自動加密傳輸，30分鐘後自動刪除，確保您的隱私和資料安全。
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-6">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">跨平台支援</h3>
              <p className="text-gray-600">
                支援所有主流瀏覽器和設備，無論您使用何種平台都能輕鬆使用。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">如何使用？</h2>
            <p className="text-xl text-gray-600">三個簡單步驟，立即開始檔案傳輸</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">創建或加入房間</h3>
              <p className="text-gray-600">
                點擊「創建新房間」成為房主，或輸入房間代碼加入現有房間。
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">上傳檔案</h3>
              <p className="text-gray-600">
                房主可以上傳任何格式的檔案，支援拖拽上傳，操作簡單直觀。
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">分享與下載</h3>
              <p className="text-gray-600">
                分享房間代碼給他人，讓他們能夠即時下載您分享的檔案。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
