import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import Blogs from './pages/Blogs.jsx'
import AllContent from './pages/AllContent.jsx'
import Playground from './pages/Playground.jsx'
import Pricing from './pages/Pricing.jsx'
import AboutUs from './pages/AboutUs.jsx'
import Contact from './pages/Contact.jsx'
import VoiceDetail from './pages/VoiceDetail.jsx'
import UserProfile from './pages/UserProfile.jsx'

function App() {
  const location = useLocation()
  const showHeader = location.pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      {showHeader && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all" element={<AllContent />} />
        <Route path="/blogs/:blogId" element={<Blogs />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/voices/:voiceId" element={<VoiceDetail />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </>
  )
}

export default App
