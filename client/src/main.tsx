import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

// 初始化開發者模式
import './utils/developerMode'

// PWA Service Worker 註冊
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🚀 Service Worker 註冊成功:', registration.scope);
        
        // 檢查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // 有新版本可用
                  console.log('📦 發現新版本，準備更新...');
                  if (confirm('發現新版本！點擊確定重新載入應用程式。')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                } else {
                  // 首次安裝
                  console.log('✅ 應用程式已快取，可離線使用');
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('❌ Service Worker 註冊失敗:', error);
      });
  });

  // 監聽 Service Worker 控制變更
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker 已更新');
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
