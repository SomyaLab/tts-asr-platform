import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { Link, useNavigate } from 'react-router-dom'
import './Playground.css'
import { FaPlay, FaMicrophone, FaUser, FaPause } from 'react-icons/fa'
import { HiSpeakerWave, HiSpeakerXMark, HiMiniHome, HiPaperClip, HiChevronDown } from 'react-icons/hi2'
import { IoMdSpeedometer } from 'react-icons/io'
import { IoMenuOutline, IoArrowBack } from 'react-icons/io5'
import { IoClose } from 'react-icons/io5'
import { IoSunny } from 'react-icons/io5'
import { FaMoon, FaCloudUploadAlt } from 'react-icons/fa'
import { BsThreeDotsVertical } from 'react-icons/bs'
import AudioPlayer from '../components/AudioPlayer.jsx'

export default function Playground() {
  const { user, signInWithGoogle, signInWithApple } = useAuth()
  const navigate = useNavigate()
  const [textToSpeak, setTextToSpeak] = useState('')
  const [selectedModel, setSelectedModel] = useState('Sonic 3.0')
  const [selectedVoice, setSelectedVoice] = useState('Tessa')
  const [transcriptLanguage, setTranscriptLanguage] = useState('')
  const [speed, setSpeed] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  const [selectedEmotion, setSelectedEmotion] = useState('neutral')
  const [activeTab, setActiveTab] = useState('controls')
  const [isSending, setIsSending] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [theme, setTheme] = useState('light')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showControlCard, setShowControlCard] = useState(false)
  const [selectedControl, setSelectedControl] = useState(null)
  const [tempControlValue, setTempControlValue] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [activeView, setActiveView] = useState('text-to-speech') // 'text-to-speech', 'instant-clone', or 'speech-to-text'
  const [inputMethod, setInputMethod] = useState('record') // 'record' or 'upload'
  const [transcribedText, setTranscribedText] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const speechToTextFileInputRef = useRef(null)
  const [cloneName, setCloneName] = useState('')
  const [cloneDescription, setCloneDescription] = useState('')
  const [cloneLanguage, setCloneLanguage] = useState('')
  const [showExperimental, setShowExperimental] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [noiseSuppressionLevel, setNoiseSuppressionLevel] = useState(0.5)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [useEntireClip, setUseEntireClip] = useState(true)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const animationFrameRef = useRef(null)
  const startTimeRef = useRef(null)
  const fileInputRef = useRef(null)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    
    // Set sidebar to collapsed by default on mobile
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

  const handleSpeak = async () => {
    if (isSending || !textToSpeak.trim()) return
    setIsSending(true)
    try {
      const response = await fetch(`${API_BASE}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak.trim() })
      })
      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw new Error(errText || `Request failed with status ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      const audio = new Audio(url)
      audio.play().catch(() => {
        // Fall back to triggering a download if autoplay is blocked
        const a = document.createElement('a')
        a.href = url
        a.download = 'tts.wav'
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      audio.onended = () => URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Failed to generate speech. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = 'tts.wav'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }

  const handleControlSelect = (controlType, currentValue) => {
    setSelectedControl(controlType)
    setTempControlValue(currentValue)
    setShowControlCard(true)
  }

  const handleControlDone = () => {
    if (selectedControl === 'model') {
      setSelectedModel(tempControlValue)
    } else if (selectedControl === 'voice') {
      setSelectedVoice(tempControlValue)
    } else if (selectedControl === 'language') {
      setTranscriptLanguage(tempControlValue)
    } else if (selectedControl === 'speed') {
      setSpeed(tempControlValue)
    } else if (selectedControl === 'volume') {
      setVolume(tempControlValue)
    }
    // Go back to control selection menu instead of closing
    setSelectedControl(null)
    setTempControlValue(null)
  }

  const handleControlClose = () => {
    setShowControlCard(false)
    setSelectedControl(null)
    setTempControlValue(null)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setRecordedUrl(url)
      setRecordedBlob(file)
      
      const audio = new Audio(url)
      audio.onloadedmetadata = () => {
        setRecordingDuration(audio.duration)
      }
    } else {
      alert('Please upload an audio file only.')
      e.target.value = ''
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setRecordedUrl(null)
    setRecordedBlob(null)
    setRecordingDuration(0)
    setUseEntireClip(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setRecordedBlob(audioBlob)
        setRecordedUrl(url)
        
        // Get duration
        const audio = new Audio(url)
        audio.onloadedmetadata = () => {
          setRecordingDuration(audio.duration)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      startTimeRef.current = Date.now()
      
      // Update duration
      const updateDuration = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          setRecordingDuration((Date.now() - startTimeRef.current) / 1000)
          animationFrameRef.current = requestAnimationFrame(updateDuration)
        }
      }
      updateDuration()
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const countWords = (text) => {
    if (!text || !text.trim()) return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }


  useEffect(() => {
    return () => {
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [recordedUrl])


  if (!user) {
    return (
      <div className="playground">
        <div className="login-panel">
          <div className="login-card">
            <h2 className="login-title">Welcome to Playground</h2>
            <p className="login-sub">Sign in to continue</p>
            <div className="login-actions">
              <button className="btn btn-primary" onClick={signInWithGoogle}>Continue with Google</button>
              <button className="btn" onClick={signInWithApple}>Continue with Apple</button>
            </div>
          </div>
        </div>
      </div>
    )
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
              <button 
                className={`nav-item ${activeView === 'text-to-speech' ? 'active' : ''}`}
                onClick={() => setActiveView('text-to-speech')}
              >
                Text to Speech
              </button>
              <button 
                className={`nav-item ${activeView === 'instant-clone' ? 'active' : ''}`}
                onClick={() => setActiveView('instant-clone')}
              >
                Instant Clone
              </button>
              <button 
                className={`nav-item ${activeView === 'speech-to-text' ? 'active' : ''}`}
                onClick={() => setActiveView('speech-to-text')}
              >
                Speech to Text
              </button>
            </div>


            <div className="nav-section">
              <div className="nav-section-title">LIBRARY</div>
              <button className="nav-item">Voices</button>
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
        {activeView === 'text-to-speech' ? (
          <>
            <main className="playground-main">
              <div className="main-title-container">
                <h1 className="main-title">Text to Speech</h1>
                <button 
                  className="dots-btn"
                  onClick={() => setShowControlCard(!showControlCard)}
                  title="Control Options"
                >
                  <BsThreeDotsVertical />
                </button>
              </div>
              
              <div className="text-input-container">
                <textarea
                  className="text-input"
                  placeholder="Write something to say..."
                  value={textToSpeak}
                  onChange={(e) => setTextToSpeak(e.target.value)}
                  rows={8}
                />
              </div>

              <div className="main-footer">
                <div className="credits-speak-group">
                  <div className="credits-info">0 credits</div>
                  <div className="word-count-info">{countWords(textToSpeak)} {countWords(textToSpeak) === 1 ? 'word' : 'words'}</div>
                </div>
                <div className="speak-btn-container">
                <button
                    className="speak-btn"
                    onClick={handleSpeak}
                    disabled={isSending || !textToSpeak.trim()}
                  >
                    <FaPlay />
                    Speak
                  </button>
                  </div>
                {audioUrl && (
                  <div className="audio-actions">
                    <button className="play-btn-small" onClick={() => {
                      const audio = new Audio(audioUrl)
                      audio.play()
                    }}>
                      <FaPlay />
                    </button>
                    <button className="download-link" onClick={handleDownload}>
                      Download
                    </button>
                  </div>
                )}
              </div>

              {/* Control Card */}
              {showControlCard && (
                <div className="control-card-overlay" onClick={handleControlClose}>
                  <div className="control-card" onClick={(e) => e.stopPropagation()}>
                    <div className="control-card-header">
                      <h3>Select Control</h3>
                      <button className="control-card-close" onClick={handleControlClose}>×</button>
                    </div>
                    <div className="control-card-content">
                      {!selectedControl ? (
                        <>
                          <button 
                            className="control-card-item"
                            onClick={() => handleControlSelect('model', selectedModel)}
                          >
                            Model
                          </button>
                          <button 
                            className="control-card-item"
                            onClick={() => handleControlSelect('voice', selectedVoice)}
                          >
                            Voice
                          </button>
                          <button 
                            className="control-card-item"
                            onClick={() => handleControlSelect('language', transcriptLanguage)}
                          >
                            Transcript Language
                          </button>
                          <button 
                            className="control-card-item"
                            onClick={() => handleControlSelect('speed', speed)}
                          >
                            Speed
                          </button>
                          <button 
                            className="control-card-item"
                            onClick={() => handleControlSelect('volume', volume)}
                          >
                            Volume
                          </button>
                        </>
                      ) : (
                        <div className="control-card-control">
                          {selectedControl === 'model' && (
                            <div className="control-group">
                              <label className="control-label">Model</label>
                              <select
                                className="control-select"
                                value={tempControlValue}
                                onChange={(e) => setTempControlValue(e.target.value)}
                              >
                                <option>Sonic 3.0</option>
                              </select>
                            </div>
                          )}
                          {selectedControl === 'voice' && (
                            <div className="control-group">
                              <label className="control-label">Voice</label>
                              <select
                                className="control-select"
                                value={tempControlValue}
                                onChange={(e) => setTempControlValue(e.target.value)}
                              >
                                <option>Tessa</option>
                                <option>John</option>
                                <option>Emma</option>
                              </select>
                            </div>
                          )}
                          {selectedControl === 'language' && (
                            <div className="control-group">
                              <label className="control-label">Transcript Language</label>
                              <select
                                className="control-select"
                                value={tempControlValue}
                                onChange={(e) => setTempControlValue(e.target.value)}
                              >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="kn">Kannada</option>
                                <option value="te">Telugu</option>
                                <option value="ma">Marathi</option>
                                <option value="sa">Sanskrit</option>
                              </select>
                            </div>
                          )}
                          {selectedControl === 'speed' && (
                            <div className="control-group">
                              <label className="control-label">
                                Speed
                                <span className="control-value">{tempControlValue}x</span>
                              </label>
                              <div className="horizontal-slider-wrapper">
                                <div className="horizontal-slider-container">
                                  <div className="slider-icon-left">
                                    <IoMdSpeedometer />
                                  </div>
                                  <div className="horizontal-slider-track">
                                    <div 
                                      className="horizontal-slider-fill speed-fill"
                                      style={{ width: `${Math.max(0, Math.min(100, ((tempControlValue - 0.5) / 1.5) * 100))}%` }}
                                    ></div>
                                  </div>
                                  <input
                                    type="range"
                                    className="horizontal-slider"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={tempControlValue}
                                    onChange={(e) => setTempControlValue(parseFloat(e.target.value))}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {selectedControl === 'volume' && (
                            <div className="control-group">
                              <label className="control-label">
                                Volume
                                <span className="control-value">{tempControlValue}x</span>
                              </label>
                              <div className="horizontal-slider-wrapper">
                                <div className="horizontal-slider-container">
                                  <div className="slider-icon-left">
                                    {tempControlValue === 0 ? <HiSpeakerXMark /> : <HiSpeakerWave />}
                                  </div>
                                  <div className="horizontal-slider-track">
                                    <div 
                                      className="horizontal-slider-fill volume-fill"
                                      style={{ width: `${Math.max(0, Math.min(100, (tempControlValue / 2) * 100))}%` }}
                                    ></div>
                                  </div>
                                  <input
                                    type="range"
                                    className="horizontal-slider"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={tempControlValue}
                                    onChange={(e) => setTempControlValue(parseFloat(e.target.value))}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <button className="control-card-done" onClick={handleControlDone}>
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* Right Sidebar */}
            <aside className="playground-sidebar-right">
          

          <div className="sidebar-tabs">
            <h2 className="sidebar-tab-title">Controls</h2>
          </div>

          {activeTab === 'controls' && (
            <div className="controls-panel">
              <div className="control-group">
                <label className="control-label">Model</label>
                <select
                  className="control-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option>Sonic 3.0</option>
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Voice</label>
                <select
                  className="control-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  <option>Tessa</option>
                  <option>John</option>
                  <option>Emma</option>
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Transcript Language</label>
                <select
                  className="control-select"
                  value={transcriptLanguage}
                  onChange={(e) => setTranscriptLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                  <option value="te">Telugu</option>
                  <option value="ma">Marathi</option>
                  <option value="sa">Sanskrit</option>
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">
                  Speed
                  <span className="control-value">{speed}x</span>
                </label>
                <div className="horizontal-slider-wrapper">
                  <div className="horizontal-slider-container">
                    <div className="slider-icon-left">
                      <IoMdSpeedometer />
                    </div>
                    <div className="horizontal-slider-track">
                      <div 
                        className="horizontal-slider-fill speed-fill"
                        style={{ width: `${Math.max(0, Math.min(100, ((speed - 0.5) / 1.5) * 100))}%` }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      className="horizontal-slider"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="control-group">
                <label className="control-label">
                  Volume
                  <span className="control-value">{volume}x</span>
                </label>
                <div className="horizontal-slider-wrapper">
                  <div className="horizontal-slider-container">
                    <div className="slider-icon-left">
                      {volume === 0 ? <HiSpeakerXMark /> : <HiSpeakerWave />}
                    </div>
                    <div className="horizontal-slider-track">
                      <div 
                        className="horizontal-slider-fill volume-fill"
                        style={{ width: `${Math.max(0, Math.min(100, (volume / 2) * 100))}%` }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      className="horizontal-slider"
                      min="0"
                      max="2"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-panel">
              <p className="empty-state">No history yet</p>
            </div>
          )}
        </aside>
          </>
        ) : activeView === 'speech-to-text' ? (
          <div className="speech-to-text-container">
            <div className="speech-to-text-header">
              <h1 className="speech-to-text-title">Speech to Text</h1>
            </div>

            {/* Three Card Layout */}
            <div className="speech-to-text-layout">
              {/* Top Row: Mic Recording and Upload Cards */}
              <div className="speech-to-text-top-row">
                {/* Mic Recording Card */}
                <div className="speech-to-text-card mic-card">
                  <div className="mic-card-content">
                    <div className="mic-ring-container">
                      <div className={`mic-ring ${isRecording ? 'active' : ''}`}>
                        <div className="mic-icon-wrapper">
                          <FaMicrophone className="mic-icon" />
                        </div>
                      </div>
                    </div>
                    <div className="mic-card-info">
                      <h3 className="mic-card-title">Microphone Recording</h3>
                      <p className="mic-card-subtitle">Record audio using your microphone</p>
                      <div className="mic-controls">
                        {!recordedUrl && (
                          <button 
                            className={`mic-record-btn ${isRecording ? 'recording' : ''}`}
                            onClick={isRecording ? stopRecording : startRecording}
                          >
                            {isRecording ? (
                              <>
                                <FaPause />
                                <span>Stop Recording</span>
                              </>
                            ) : (
                              <>
                                <FaMicrophone />
                                <span>Start Recording</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Audio Files Card */}
                <div className="speech-to-text-card upload-card">
                  <div className="upload-card-header">
                    <div className="upload-folder-icon">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M8 12C8 10.8954 8.89543 10 10 10H22L26 16H38C39.1046 16 40 16.8954 40 18V36C40 37.1046 39.1046 38 38 38H10C8.89543 38 8 37.1046 8 36V12Z" fill="#3b82f6" fillOpacity="0.9"/>
                        <path d="M10 10H22L26 16H38C39.1046 16 40 16.8954 40 18V20H10V10Z" fill="#60a5fa" fillOpacity="0.9"/>
                      </svg>
                    </div>
                    <div className="upload-card-header-text">
                      <h2 className="upload-card-title">Upload files</h2>
                      <p className="upload-card-subtitle">Select and upload the files of your choice</p>
                    </div>
                  </div>
                  <div className="upload-card-dropzone">
                    {uploadedFile ? (
                      <div className="uploaded-file-display">
                        <div className="uploaded-file-info">
                          <FaCloudUploadAlt className="upload-icon" />
                          <div className="uploaded-file-details">
                            <span className="uploaded-file-name">{uploadedFile.name}</span>
                            <span className="uploaded-file-size">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <button className="remove-file-btn" onClick={() => {
                          setUploadedFile(null)
                          setRecordedUrl(null)
                          setRecordedBlob(null)
                          if (speechToTextFileInputRef.current) {
                            speechToTextFileInputRef.current.value = ''
                          }
                        }}>
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="upload-icon-text">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M7 10L12 5L17 10M12 19V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="3" y="17" width="18" height="4" rx="1" fill="currentColor"/>
                          </svg>
                          <span>Choose a file or drag & drop it here</span>
                        </div>
                        <p className="upload-formats">MP3, WAV, M4A, and other audio formats, up to 50MB</p>
                        <button 
                          className="browse-file-btn"
                          onClick={() => speechToTextFileInputRef.current?.click()}
                        >
                          Browse File
                        </button>
                        <input
                          ref={speechToTextFileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            if (file && file.type.startsWith('audio/')) {
                              setUploadedFile(file)
                              const url = URL.createObjectURL(file)
                              setRecordedUrl(url)
                              setRecordedBlob(file)
                              const audio = new Audio(url)
                              audio.onloadedmetadata = () => {
                                setRecordingDuration(audio.duration)
                              }
                            } else {
                              alert('Please upload an audio file only.')
                              e.target.value = ''
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Audio Player Section */}
              {recordedUrl && (
                <div className="speech-to-text-audio-section">
                  <div className="audio-preview-section">
                    <AudioPlayer src={recordedUrl} hideControls={true} />
                  </div>
                  <button 
                    className="transcribe-btn"
                    onClick={async () => {
                      if (recordedBlob) {
                        setIsTranscribing(true)
                        try {
                          const formData = new FormData()
                          formData.append('audio', recordedBlob)
                          const response = await fetch(`${API_BASE}/asr`, {
                            method: 'POST',
                            body: formData
                          })
                          if (response.ok) {
                            const data = await response.json()
                            setTranscribedText(data.text || data.transcript || '')
                          } else {
                            alert('Failed to transcribe audio')
                          }
                        } catch (error) {
                          console.error('Transcription error:', error)
                          alert('Failed to transcribe audio')
                        } finally {
                          setIsTranscribing(false)
                        }
                      }
                    }}
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                  </button>
                </div>
              )}

              {/* Bottom Row: Text Box Card */}
              <div className="speech-to-text-card text-card">
                <div className="text-card-header">
                  <h3 className="text-card-title">Transcribed Text</h3>
                </div>
                <div className="text-card-content">
                  <textarea
                    className="transcribed-text-input"
                    placeholder="Transcribed text will appear here..."
                    value={transcribedText}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    rows={8}
                  />
                  {transcribedText && (
                    <div className="text-card-actions">
                      <button 
                        className="copy-text-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(transcribedText)
                          alert('Text copied to clipboard')
                        }}
                      >
                        Copy Text
                      </button>
                      <button 
                        className="clear-text-btn"
                        onClick={() => setTranscribedText('')}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="instant-clone-container">
            {/* Instant Clone Header */}
            <div className="instant-clone-header">
              <div className="instant-clone-header-left">
                <h1 className="instant-clone-title">Instant Clone</h1>
              </div>
              <button 
                className={`clone-btn ${!cloneName || !cloneLanguage || !recordedUrl ? 'disabled' : ''}`}
                onClick={() => {
                  if (!cloneName || !cloneLanguage || !recordedUrl) return
                  // Generate a unique ID for the voice
                  const voiceId = '47a3e1f3-3988-4578-adc0-1b9f96b42c16' // In real app, this would come from API
                  navigate(`/voices/${voiceId}`, {
                    state: {
                      voiceName: cloneName || 'google',
                      language: cloneLanguage || 'en',
                      description: cloneDescription
                    }
                  })
                }}
                disabled={!cloneName || !cloneLanguage || !recordedUrl}
              >
                <FaUser />
                Clone
              </button>
            </div>

            {/* Two Card Layout */}
            <div className="instant-clone-cards">
              {/* Input Card */}
              <div className="instant-clone-card">
                <div className="instant-clone-card-header">
                  <span className="card-step">1</span>
                  <span className="card-step-label">Input</span>
                </div>
                
                <div className="input-method-selector">
                  <button 
                    className={`method-btn ${inputMethod === 'record' ? 'active' : ''}`}
                    onClick={() => {
                      setInputMethod('record')
                      setUploadedFile(null)
                    }}
                  >
                    <FaMicrophone />
                    Record
                  </button>
                  <button 
                    className={`method-btn ${inputMethod === 'upload' ? 'active' : ''}`}
                    onClick={() => setInputMethod('upload')}
                  >
                    <HiPaperClip />
                    Upload
                  </button>
                </div>

                {inputMethod === 'record' ? (
                  <>
                    <h2 className="section-title">Record a voice clip</h2>
                    
                    <div className="record-button-container">
                      <button 
                        className={`record-btn ${isRecording ? 'recording' : ''}`}
                        onClick={isRecording ? stopRecording : startRecording}
                      >
                        {isRecording ? <FaPause /> : <FaMicrophone />}
                        {isRecording ? 'Stop' : 'Record'}
                      </button>
                    </div>

                    {recordedUrl && (
                      <div className="audio-preview-section">
                        <p className="preview-instruction">Preview your audio recording</p>
                        <div className="audio-player-container">
                          <AudioPlayer src={recordedUrl} hideControls={true} />
                        </div>
                      </div>
                    )}

                    {!recordedUrl && (
                      <>
                        <div className="best-practices">
                          <h3 className="best-practices-title">Recording Tips:</h3>
                          <ul className="best-practices-list">
                            <li>Provide 10-20 seconds of continuous speech.</li>
                            <li>Avoid prolonged silences, pauses, or background noise.</li>
                            <li>The sample must match the desired pace, volume, and projection for the cloned voice.</li>
                          </ul>
                        </div>

                        <div className="sample-text-section">
                          <h3 className="sample-text-title">Need something to read? Try this for English.</h3>
                          <div className="sample-text-box">
                            <div className="sample-text-border"></div>
                            <div className="sample-text-content">
                            I'm in the process of recording some audio so I can create a digital clone of my voice. Once it's ready, I’ll be able to generate speech that sounds exactly like me — same tone, rhythm, and personality.
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="section-title">Upload a voice clip</h2>
                    
                    <div className="upload-area">
                      {uploadedFile ? (
                        <>
                          <div className="uploaded-file-display">
                            <div className="uploaded-file-info">
                              <FaCloudUploadAlt className="upload-icon" />
                              <div className="uploaded-file-details">
                                <span className="uploaded-file-name">{uploadedFile.name}</span>
                                <span className="uploaded-file-size">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            </div>
                            <button className="remove-file-btn" onClick={handleRemoveFile}>
                              ×
                            </button>
                          </div>
                          
                          {recordedUrl && (
                            <div className="audio-preview-section">
                              <p className="preview-instruction">Preview your uploaded audio</p>
                              <div className="audio-player-container">
                                <AudioPlayer src={recordedUrl} />
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <label className="upload-label">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="upload-input"
                          />
                          <div className="upload-placeholder">
                            <FaCloudUploadAlt className="upload-icon-large" />
                            <span className="upload-text">Click to upload or drag and drop</span>
                            <span className="upload-hint">Audio files only</span>
                          </div>
                        </label>
                      )}
                    </div>

                    <div className="best-practices">
                      <h3 className="best-practices-title">Recording Tips:</h3>
                      <ul className="best-practices-list">
                        <li>5-10 seconds of speech</li>
                        <li>Avoid long silences and pauses</li>
                        <li>Pacing and volume you'd like the cloned voice to match</li>
                      </ul>
                    </div>
                  </>
                )}

                <button 
                  className="experimental-toggle"
                  onClick={() => setShowExperimental(!showExperimental)}
                >
                  <span>Advanced Settings</span>
                  <HiChevronDown className={showExperimental ? 'rotated' : ''} />
                </button>

                {showExperimental && (
                  <div className="experimental-controls">
                    <div className="control-group">
                      <label className="control-label">
                        Noise Suppression Level
                        <span className="control-value">{Math.round(noiseSuppressionLevel * 100)}%</span>
                      </label>
                      <div className="horizontal-slider-wrapper">
                        <div className="horizontal-slider-container">
                          <div className="slider-icon-left">
                            <HiSpeakerWave />
                          </div>
                          <div className="horizontal-slider-track">
                            <div 
                              className="horizontal-slider-fill volume-fill"
                              style={{ width: `${noiseSuppressionLevel * 100}%` }}
                            ></div>
                          </div>
                          <input
                            type="range"
                            className="horizontal-slider"
                            min="0"
                            max="1"
                            step="0.01"
                            value={noiseSuppressionLevel}
                            onChange={(e) => setNoiseSuppressionLevel(parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Details Card */}
              <div className="instant-clone-card">
                <div className="instant-clone-card-header">
                  <span className="card-step">2</span>
                  <span className="card-step-label">Details</span>
                </div>

                <div className="clone-form-group">
                  <label className="clone-form-label">
                    Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="clone-form-input"
                    value={cloneName}
                    onChange={(e) => setCloneName(e.target.value)}
                    placeholder="Enter name"
                  />
                </div>

                <div className="clone-form-group">
                  <label className="clone-form-label">Description</label>
                  <textarea
                    className="clone-form-textarea"
                    value={cloneDescription}
                    onChange={(e) => setCloneDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={4}
                  />
                </div>

                <div className="clone-form-group">
                  <label className="clone-form-label">
                    Language<span className="required">*</span>
                  </label>
                  <select
                    className="clone-form-select"
                    value={cloneLanguage}
                    onChange={(e) => setCloneLanguage(e.target.value)}
                  >
                    <option value="">Select language</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="kn">Kannada</option>
                    <option value="te">Telugu</option>
                    <option value="ma">Marathi</option>
                    <option value="sa">Sanskrit</option>
                  </select>
                </div>

                <p className="language-note">
                  Note that the language of the speech used for cloning must match the language used for generation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
