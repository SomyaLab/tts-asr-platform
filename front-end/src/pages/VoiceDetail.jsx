import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { FaPlay, FaCopy, FaDownload } from 'react-icons/fa'
import { HiChatBubbleLeftRight, HiArrowDownTray, HiMiniHome } from 'react-icons/hi2'
import { IoArrowBack, IoMenuOutline, IoClose } from 'react-icons/io5'
import { IoSunny } from 'react-icons/io5'
import { FaMoon } from 'react-icons/fa'
import { getVoiceData, getVoiceDataById, LANGUAGE_NAMES } from '../data/voiceData.js'
import './VoiceDetail.css'
import '../pages/Playground.css'

export default function VoiceDetail() {
  const { voiceId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { voiceName: initialVoiceName, language: initialLanguage, gender: initialGender } = location.state || {}
  
  // Try to get voice data from voiceId, language/gender, or defaults
  const getInitialVoiceData = () => {
    // Try by voiceId first
    if (voiceId) {
      const byId = getVoiceDataById(voiceId)
      if (byId) return byId
    }
    
    // Try by language and gender from state
    if (initialLanguage && initialGender) {
      const byLangGender = getVoiceData(initialLanguage, initialGender)
      if (byLangGender) return byLangGender
    }
    
    // Try by language only (default to female)
    if (initialLanguage) {
      const byLang = getVoiceData(initialLanguage, 'female')
      if (byLang) return byLang
    }
    
    // Default to English Female
    return getVoiceData('en', 'female') || {}
  }

  const initialVoiceData = getInitialVoiceData()
  
  const [voiceData, setVoiceData] = useState(initialVoiceData)
  const [voiceName, setVoiceName] = useState(initialVoiceData.name || initialVoiceName || 'Voice')
  const [isEditing, setIsEditing] = useState(false)
  const [previewText, setPreviewText] = useState(initialVoiceData.defaultPreviewText || "It's nice to meet you. Hope you're having a great day.")
  const [language, setLanguage] = useState(initialVoiceData.language || initialLanguage || 'en')
  const [gender, setGender] = useState(initialVoiceData.gender || initialGender || 'female')
  const [voiceIdValue, setVoiceIdValue] = useState(initialVoiceData.voiceId || voiceId || 'en-female-001')
  const [isPlaying, setIsPlaying] = useState(false)
  const [theme, setTheme] = useState('light')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  // Update voice data when language or gender changes
  useEffect(() => {
    const newVoiceData = getVoiceData(language, gender)
    if (newVoiceData) {
      setVoiceData(newVoiceData)
      setVoiceName(newVoiceData.name)
      setPreviewText(newVoiceData.defaultPreviewText)
      setVoiceIdValue(newVoiceData.voiceId)
    }
  }, [language, gender])

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
            <Link to="/playground?view=voices" className="breadcrumb-link">Voices</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{voiceName}</span>
          </div>

          {/* Header Section */}
          <div className="voice-detail-header">
            <div className="voice-detail-header-content">
              {/* Voice Image */}
              {voiceData.image && (
                <div className="voice-detail-image-container">
                  <img 
                    src={voiceData.image} 
                    alt={voiceData.displayName || voiceName}
                    className="voice-detail-image"
                    onError={(e) => {
                      e.target.src = '/male.png' // Fallback image
                    }}
                  />
                </div>
              )}
              
              {/* Title and Description */}
              <div className="voice-detail-title-section">
                <div className="voice-detail-title-row">
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
                    <h1 className="voice-detail-title">{voiceData.displayName || voiceName}</h1>
                  )}
                  <button 
                    className="voice-edit-btn"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    Edit
                  </button>
                </div>
                {voiceData.description && (
                  <p className="voice-detail-description">{voiceData.description}</p>
                )}
              </div>
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
                value={voiceData.languageName || LANGUAGE_NAMES[language] || language.toUpperCase()}
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
            <span className="metadata-label">Language Code:</span>
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
                aria-label="Copy language code"
              >
                <FaCopy />
              </button>
            </div>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Gender:</span>
            <div className="metadata-value-container">
              <input
                type="text"
                value={gender.charAt(0).toUpperCase() + gender.slice(1)}
                readOnly
                className="metadata-input"
              />
              <button 
                className="copy-btn"
                onClick={() => handleCopy(gender)}
                aria-label="Copy gender"
              >
                <FaCopy />
              </button>
            </div>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Voice ID:</span>
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
          {voiceData.metadata && (
            <>
              {voiceData.metadata.age && (
                <div className="metadata-item">
                  <span className="metadata-label">Age:</span>
                  <div className="metadata-value-container">
                    <input
                      type="text"
                      value={voiceData.metadata.age}
                      readOnly
                      className="metadata-input"
                    />
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(voiceData.metadata.age)}
                      aria-label="Copy age"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              )}
              {voiceData.metadata.accent && (
                <div className="metadata-item">
                  <span className="metadata-label">Accent:</span>
                  <div className="metadata-value-container">
                    <input
                      type="text"
                      value={voiceData.metadata.accent}
                      readOnly
                      className="metadata-input"
                    />
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(voiceData.metadata.accent)}
                      aria-label="Copy accent"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              )}
              {voiceData.metadata.useCase && (
                <div className="metadata-item">
                  <span className="metadata-label">Use Case:</span>
                  <div className="metadata-value-container">
                    <input
                      type="text"
                      value={voiceData.metadata.useCase}
                      readOnly
                      className="metadata-input"
                    />
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(voiceData.metadata.useCase)}
                      aria-label="Copy use case"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              )}
              {voiceData.metadata.quality && (
                <div className="metadata-item">
                  <span className="metadata-label">Quality:</span>
                  <div className="metadata-value-container">
                    <input
                      type="text"
                      value={voiceData.metadata.quality}
                      readOnly
                      className="metadata-input"
                    />
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(voiceData.metadata.quality)}
                      aria-label="Copy quality"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              )}
              {voiceData.metadata.tone && (
                <div className="metadata-item">
                  <span className="metadata-label">Tone:</span>
                  <div className="metadata-value-container">
                    <input
                      type="text"
                      value={voiceData.metadata.tone}
                      readOnly
                      className="metadata-input"
                    />
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopy(voiceData.metadata.tone)}
                      aria-label="Copy tone"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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
