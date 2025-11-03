import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { FaPlay, FaCopy, FaDownload } from 'react-icons/fa'
import { HiChatBubbleLeftRight, HiArrowDownTray, HiMiniHome } from 'react-icons/hi2'
import { IoArrowBack, IoMenuOutline, IoClose } from 'react-icons/io5'
import { IoSunny } from 'react-icons/io5'
import { FaMoon } from 'react-icons/fa'
import './VoiceDetail.css'
import '../pages/Playground.css'

export default function VoiceDetail() {
  const { voiceId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { voiceName: initialVoiceName, language: initialLanguage } = location.state || {}
  
  const [voiceName, setVoiceName] = useState(initialVoiceName || 'google')
  const [isEditing, setIsEditing] = useState(false)
  const [previewText, setPreviewText] = useState("It's nice to meet you. Hope you're having a great day.")
  const [language, setLanguage] = useState(initialLanguage || 'en')
  const [voiceIdValue, setVoiceIdValue] = useState(voiceId || '47a3e1f3-3988-4578-adc0-1b9f96b42c16')
  const [isPlaying, setIsPlaying] = useState(false)
  const [theme, setTheme] = useState('light')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    
    const checkMobile = () => {
      const mobile = window.innerWidth <= 900
      const small = window.innerWidth < 1200
      setIsMobile(mobile)
      setIsSmallScreen(small)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSpeak = () => {
    setIsPlaying(!isPlaying)
    // Add actual TTS functionality here
  }

  const handleTryInTTS = () => {
    navigate('/playground?voice=' + voiceIdValue)
  }

  return (
    <div className="playground">
      <div className="playground-navbar-container">
        <nav className="playground-navbar">
          <div className="navbar-left">
            <button 
              className="navbar-btn menu-btn" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Menu"
            >
              {(sidebarOpen && isSmallScreen) ? <IoClose /> : <IoMenuOutline />}
            </button>
            <Link to="/" className="navbar-btn home-btn" title="Home">
              <HiMiniHome />
            </Link>
          </div>
          <div className="navbar-right">
            <div className="theme-toggle-container">
              <button 
                className={`theme-toggle-switch ${theme === 'dark' ? 'dark-active' : 'light-active'}`}
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                <div className="toggle-track">
                  <div className="toggle-thumb">
                    {theme === 'dark' ? <FaMoon /> : <IoSunny />}
                  </div>
                </div>
              </button>
            </div>
            <button className="navbar-btn user-btn" title="User">
              <img src="/male.png" alt="User" className="user-avatar" />
            </button>
          </div>
        </nav>
      </div>
      <div className={`playground-container ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        {/* Mobile Overlay */}
        {sidebarOpen && isMobile && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Left Sidebar */}
        <aside className={`playground-sidebar-left ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">VOICE TOOLS</div>
              <Link to="/playground" className="nav-item">
                Text to Speech
              </Link>
              <Link to="/playground" className="nav-item">
                Instant Clone
              </Link>
              <Link to="/playground" className="nav-item">
                Speech to Text
              </Link>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">LIBRARY</div>
              <button className="nav-item active">Voices</button>
              <button className="nav-item">Pronunciation</button>
            </div>
            
            <div className="nav-section">
              <div className="nav-section-title">PLATFORM</div>
              <button className="nav-item">Usage</button>
              <button className="nav-item">Concurrency</button>
              <button className="nav-item">Subscription</button>
              <button className="nav-item">API Keys</button>
            </div>
          </nav>

          <div className="sidebar-footer">
            <p>© 2025 Somya AI. All rights reserved.</p>
          </div>
        </aside>

        {/* Main Content */}
        <div className="voice-detail-container">
          {/* Breadcrumb Navigation */}
          <div className="voice-detail-breadcrumb">
            <Link to="/playground" className="breadcrumb-link">My Voices</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{voiceName}</span>
          </div>

          {/* Header Section */}
          <div className="voice-detail-header">
        <div className="voice-detail-title-section">
          {isEditing ? (
            <input
              type="text"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(false)
              }}
              className="voice-name-input"
              autoFocus
            />
          ) : (
            <h1 className="voice-detail-title">{voiceName}</h1>
          )}
          <button 
            className="voice-edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="voice-detail-section">
        <h2 className="voice-section-title">Preview</h2>
        <div className="preview-textarea-container">
          <textarea
            className="preview-textarea"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Enter text to preview..."
          />
          <button 
            className="speak-btn"
            onClick={handleSpeak}
          >
            <FaPlay />
            Speak
          </button>
        </div>
      </div>

      {/* Actions Section */}
      <div className="voice-detail-section">
        <h2 className="voice-section-title">Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={handleTryInTTS}>
            <HiChatBubbleLeftRight />
            Try in Text to Speech
          </button>
          <button className="action-btn">
            <HiArrowDownTray />
            Download Source
          </button>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="voice-detail-section">
        <h2 className="voice-section-title">Metadata</h2>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Language:</span>
            <div className="metadata-value-container">
              <input
                type="text"
                value={language}
                readOnly
                className="metadata-input"
              />
              <button 
                className="copy-btn"
                onClick={() => handleCopy(language)}
                aria-label="Copy language"
              >
                <FaCopy />
              </button>
            </div>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">ID:</span>
            <div className="metadata-value-container">
              <input
                type="text"
                value={voiceIdValue}
                readOnly
                className="metadata-input"
              />
              <button 
                className="copy-btn"
                onClick={() => handleCopy(voiceIdValue)}
                aria-label="Copy ID"
              >
                <FaCopy />
              </button>
            </div>
          </div>
        </div>
      </div>

          {/* Footer */}
          <div className="voice-detail-footer">
            <button className="download-footer-btn">
              <FaDownload />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
