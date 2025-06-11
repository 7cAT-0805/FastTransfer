import axios from 'axios';

// 強制使用 Render 後端 URL
const API_BASE_URL = 'https://fastransfer-backend.onrender.com';

// 除錯資訊
console.log('🔧 API Configuration:');
console.log('Environment:', import.meta.env.MODE);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
  },
  async (error) => {
    console.error('🚨 API Error:', error);
    
    // 如果是連接錯誤，Render 可能在休眠，嘗試重試
    if ((error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') && !error.config._retry) {
      error.config._retry = true;
      console.log('🔄 Server might be sleeping, retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return api.request(error.config);
    }
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
);

export default api;
