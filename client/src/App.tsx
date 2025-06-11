import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import TestHome from './pages/TestHome'
import Home from './pages/Home'
import Room from './pages/Room'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/test" element={<TestHome />} />
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Layout>
  )
}

export default App
