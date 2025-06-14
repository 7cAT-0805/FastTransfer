import axios from 'axios';
import { DeveloperMode } from './developerMode';

// 只用雲端 API
const getApiBaseUrl = () => 'https://fasttransfer-production.up.railway.app';

// 初始化開發者模式
const devMode = DeveloperMode.getInstance();

// 除錯資訊 - 只在開發者模式下顯示
if (devMode.isEnabled()) {
  console.log('🔧 API Configuration:');
  console.log('Environment:', import.meta.env.MODE);
  console.log('API_BASE_URL:', getApiBaseUrl());
  console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
  console.log('Developer Mode:', devMode.isEnabled() ? '🛠️ ENABLED' : '❌ DISABLED');  console.log('Local Backend:', '☁️ DISABLED (Force Cloud)');
}

export const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  timeout: 30000,
  withCredentials: false,
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    return response;
  },  async (error) => {
    if (devMode.isEnabled()) {
      console.error('🚨 API Error:', error);
    }
    
    // 如果是連接錯誤，Railway 可能在休眠，嘗試重試
    if ((error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') && !error.config._retry) {
      error.config._retry = true;
      if (devMode.isEnabled()) {
        console.log('🔄 Server might be sleeping, retrying in 5 seconds...');
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
      return api.request(error.config);
    }
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
);

// 開發者模式 API 包裝函數
export const apiWrapper = {
  async post(url: string, data?: any, config?: any) {
    if (devMode.isEnabled()) {
      console.log('🛠️ Dev Mode API Call:', 'POST', url, data);
      
      // 模擬上傳進度
      if (url.includes('/upload') && config?.onUploadProgress) {
        // 模擬上傳進度回調
        const progressCallback = config.onUploadProgress;
        const simulateProgress = () => {
          for (let i = 0; i <= 100; i += 10) {
            setTimeout(() => {
              progressCallback({ loaded: i, total: 100 });
            }, i * 10);
          }
        };
        simulateProgress();
      }
      
      // 模擬 API 響應
      if (url === '/rooms') {
        return { data: await devMode.mockCreateRoom() };
      } else if (url.includes('/join')) {
        const roomId = url.split('/')[2];
        return { data: await devMode.mockJoinRoom(roomId) };      } else if (url.includes('/upload')) {
        const uploadedFile = await devMode.mockUploadFile(data.get ? data.get('file') : data.file);
        return { 
          data: { 
            success: true, 
            message: '檔案上傳成功', 
            file: uploadedFile 
          } 
        };
      }
      
      // 默認模擬響應
      return { data: { success: true, message: 'Mock API Response' } };
    }
    
    return api.post(url, data, config);
  },

  async get(url: string) {
    if (devMode.isEnabled()) {
      console.log('🛠️ Dev Mode API Call:', 'GET', url);
      
      if (url.includes('/files')) {
        const mockRoom = devMode.getMockRoom();
        return { data: { files: mockRoom?.files || [] } };
      } else if (url === '/health') {
        return { data: { status: 'OK (Mock)', timestamp: new Date().toISOString() } };
      }
      
      return { data: { success: true, message: 'Mock API Response' } };
    }
    
    return api.get(url);
  }
};

// 臨時解決 CORS 問題的 wrapper
const apiWithFallback = {
  ...api,
  post: api.post.bind(api),
  get: api.get.bind(api),
  put: api.put.bind(api),
  delete: api.delete.bind(api),
  async request(config: any) {
    try {
      return await api.request(config);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' && window.location.hostname === 'localhost') {
        // 本地開發時 CORS 問題，直接使用 fetch 嘗試
        const response = await fetch(`https://fasttransfer-production.up.railway.app${config.url}`, {
          method: config.method || 'GET',
          headers: config.headers,
          body: config.data ? JSON.stringify(config.data) : undefined,
        });
        return { data: await response.json() };
      }
      throw error;
    }
  }
};

export default apiWithFallback;
