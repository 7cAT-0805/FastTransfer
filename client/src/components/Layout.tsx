import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Shield, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              <span className="text-lg sm:text-2xl font-bold text-gray-900">FastTransfer</span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                首頁
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-primary-600 transition-colors">
                隱私政策
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-primary-600 transition-colors">
                使用條款
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>      {/* Footer */}
      <footer className="bg-white border-t mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                <span className="text-lg sm:text-xl font-bold text-gray-900">FastTransfer</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                快速、安全、簡單的檔案傳輸平台。無需註冊，即可開始分享檔案。
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>快速傳輸</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>安全可靠</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3 sm:mb-4">
                功能特色
              </h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li>即時檔案傳輸</li>
                <li>房間管理系統</li>
                <li>支援所有檔案格式</li>
                <li>無需註冊使用</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3 sm:mb-4">
                法律資訊
              </h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link to="/privacy" className="hover:text-primary-600 transition-colors">
                    隱私政策
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary-600 transition-colors">
                    使用條款
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              © 2024 FastTransfer. 保留所有權利。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
