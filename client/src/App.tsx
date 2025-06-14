import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Room from './pages/Room'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import { DeveloperMode } from './utils/developerMode'

function App() {
  useEffect(() => {
    // 初始化開發者模式
    const devMode = DeveloperMode.getInstance();
    
    // 如果已經啟用，顯示開發者模式面板
    if (devMode.isEnabled()) {
      console.log('🛠️ Developer Mode already enabled');
    }
  }, []);
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Layout>
  )
}

export default App
