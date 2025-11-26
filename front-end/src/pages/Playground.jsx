import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Playground.css'
import { FaPlay, FaMicrophone, FaUser, FaPause } from 'react-icons/fa'
import { HiSpeakerWave, HiSpeakerXMark, HiMiniHome, HiPaperClip, HiChevronDown } from 'react-icons/hi2'
import { IoMdSpeedometer } from 'react-icons/io'
import { IoMenuOutline, IoArrowBack } from 'react-icons/io5'
import { IoClose } from 'react-icons/io5'
import { IoSunny } from 'react-icons/io5'
import { FaMoon, FaCloudUploadAlt } from 'react-icons/fa'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { LiaDownloadSolid } from 'react-icons/lia'
import { CiSearch } from 'react-icons/ci'
import AudioPlayer from '../components/AudioPlayer.jsx'
import { getAllVoices } from '../data/voiceData.js'
import AccountModal from '../components/AccountModal.jsx'
import TutorialModal from '../components/TutorialModal.jsx'
import { getUserAvatarUrl } from '../utils/avatarUtils.js'
import { BsQuestion } from 'react-icons/bs'

export default function Playground() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [textToSpeak, setTextToSpeak] = useState('')
  const [selectedModel, setSelectedModel] = useState('Panini 0.1')
  const [selectedVoice, setSelectedVoice] = useState('') // Start with no voice selected
  const [ttsLanguage, setTtsLanguage] = useState('')
  const [availableVoices, setAvailableVoices] = useState([])
  const [transcriptLanguage, setTranscriptLanguage] = useState('')
  const [speed, setSpeed] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  const [selectedEmotion, setSelectedEmotion] = useState('neutral')
  const [activeTab, setActiveTab] = useState('controls')
  const [isSending, setIsSending] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const [theme, setTheme] = useState('light')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showControlCard, setShowControlCard] = useState(false)
  const [selectedControl, setSelectedControl] = useState(null)
  const [tempControlValue, setTempControlValue] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [activeView, setActiveView] = useState('text-to-speech') // 'text-to-speech', 'instant-clone', 'speech-to-text', or 'voices'
  const [inputMethod, setInputMethod] = useState('record') // 'record' or 'upload'
  const [transcribedText, setTranscribedText] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [asrLanguage, setAsrLanguage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
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
  const [showAccountModal, setShowAccountModal] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const animationFrameRef = useRef(null)
  const startTimeRef = useRef(null)
  const fileInputRef = useRef(null)
  const [showClonePreview, setShowClonePreview] = useState(false)
  const [clonePreviewText, setClonePreviewText] = useState("It's nice to meet you. Hope you're having a great day.")
  const [clonePreviewLanguage, setClonePreviewLanguage] = useState('')
  const [clonePreviewAudio, setClonePreviewAudio] = useState(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('')
  const [playingVoiceId, setPlayingVoiceId] = useState(null)
  const [voicePreviewAudio, setVoicePreviewAudio] = useState(null)
  const voicePreviewAudioRef = useRef(null)
  const [showVoicePreviewModal, setShowVoicePreviewModal] = useState(false)
  const [selectedVoiceForPreview, setSelectedVoiceForPreview] = useState(null)
  const [voicePreviewText, setVoicePreviewText] = useState("Hello, this is a voice preview.")
  const [isGeneratingVoicePreview, setIsGeneratingVoicePreview] = useState(false)
  const [voicePreviewAudioUrl, setVoicePreviewAudioUrl] = useState(null)
  // Fix API base URL - remove trailing /api if present to avoid double /api/api
  // Note: 0.0.0.0 is not accessible from browsers, use localhost or actual hostname
  // When accessed through a domain (like somya.ai), use relative path
  const getApiBase = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    }
    // If accessed via domain (not localhost), use same domain
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin
    }
    // Default to localhost for local development
    return 'http://localhost:8082'
  }
  const API_BASE = getApiBase()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    
    // Check if tutorial should be shown (only for first-time users and in text-to-speech view)
    const tutorialCompleted = localStorage.getItem('playground_tutorial_completed')
    if (!tutorialCompleted && user && activeView === 'text-to-speech') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setShowTutorial(true)
      }, 500)
    }
    
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
  }, [user, activeView])

  // Handle URL parameter for view selection
  useEffect(() => {
    const viewParam = searchParams.get('view')
    if (viewParam && ['text-to-speech', 'instant-clone', 'speech-to-text', 'voices'].includes(viewParam)) {
      setActiveView(viewParam)
    }
  }, [searchParams])

  // Helper function to update view and URL parameter
  const handleViewChange = (view) => {
    setActiveView(view)
    const newSearchParams = new URLSearchParams(searchParams)
    if (view === 'text-to-speech') {
      // Remove view param for default view
      newSearchParams.delete('view')
    } else {
      newSearchParams.set('view', view)
    }
    setSearchParams(newSearchParams, { replace: true })
  }

  // Fetch available voices from API, fallback to local voice data
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/voices/reference`)
        if (response.ok) {
          const data = await response.json()
          if (data.voices && data.voices.length > 0) {
            // Check if any voices are available
            const availableCount = data.voices.filter(v => v.available).length
            if (availableCount > 0) {
              setAvailableVoices(data.voices)
              // Set default voice to first available voice for default language
              const defaultLangVoices = data.voices.filter(v => v.language === ttsLanguage && v.available)
              if (defaultLangVoices.length > 0) {
                setSelectedVoice(defaultLangVoices[0].voice_name)
              }
              return
            }
          }
        }
      } catch (error) {
        console.error('Error fetching voices:', error)
      }
      // Fallback to local voice data if API fails, returns empty, or all voices unavailable
      // Map local voices to match API format with voice_name
      // Use the actual voice name from voiceData.js (which now has patrick, diana, etc.)
      const localVoices = getAllVoices().map(voice => ({
        language: voice.language,
        voice_name: voice.name, // Use the actual name field which now contains patrick, diana, etc.
        available: true,
        voiceId: voice.voiceId
      }))
      setAvailableVoices(localVoices)
      
      // Set default voice to first available voice for default language
      if (localVoices.length > 0) {
        const defaultLangVoices = localVoices.filter(v => v.language === ttsLanguage && v.available)
        if (defaultLangVoices.length > 0) {
          setSelectedVoice(defaultLangVoices[0].voice_name)
        }
      }
    }
    fetchVoices()
  }, [])

  // Get recommended voices for selected language
  const getRecommendedVoices = (language) => {
    if (!language) return []
    return availableVoices.filter(voice => 
      voice.language === language && voice.available
    ).map(v => v.voice_name)
  }

  const recommendedVoices = getRecommendedVoices(ttsLanguage)

  // Get all available voices (no longer filtered by language) and sort: recommended first, then alphabetically
  const filteredVoices = availableVoices
    .filter(voice => voice.available)
    .sort((a, b) => {
      const aIsRecommended = recommendedVoices.includes(a.voice_name)
      const bIsRecommended = recommendedVoices.includes(b.voice_name)
      
      // Recommended voices come first
      if (aIsRecommended && !bIsRecommended) return -1
      if (!aIsRecommended && bIsRecommended) return 1
      
      // Within same category (both recommended or both not), sort alphabetically
      const nameA = a.voice_name.charAt(0).toUpperCase() + a.voice_name.slice(1)
      const nameB = b.voice_name.charAt(0).toUpperCase() + b.voice_name.slice(1)
      return nameA.localeCompare(nameB)
    })

  // Get recommended voices display text
  const getRecommendedText = (language) => {
    if (!language) return ''
    const recommended = getRecommendedVoices(language)
    if (recommended.length === 0) return ''
    const voiceNames = recommended.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(' and ')
    return `${voiceNames} recommended`
  }

  // Cleanup audio preview when component unmounts or view changes
  useEffect(() => {
    return () => {
      if (voicePreviewAudioRef.current) {
        voicePreviewAudioRef.current.pause()
        voicePreviewAudioRef.current = null
      }
      if (voicePreviewAudio) {
        URL.revokeObjectURL(voicePreviewAudio)
        setVoicePreviewAudio(null)
      }
      if (voicePreviewAudioUrl) {
        URL.revokeObjectURL(voicePreviewAudioUrl)
        setVoicePreviewAudioUrl(null)
      }
      setPlayingVoiceId(null)
    }
  }, [activeView, voicePreviewAudio, voicePreviewAudioUrl])

  // Cleanup modal audio when modal closes
  useEffect(() => {
    if (!showVoicePreviewModal) {
      if (voicePreviewAudioRef.current) {
        voicePreviewAudioRef.current.pause()
        voicePreviewAudioRef.current = null
      }
      if (voicePreviewAudioUrl) {
        URL.revokeObjectURL(voicePreviewAudioUrl)
        setVoicePreviewAudioUrl(null)
      }
    }
  }, [showVoicePreviewModal, voicePreviewAudioUrl])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Helper function to convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const handleVoicePreview = async (e, voice) => {
    e.stopPropagation()
    const voiceId = `${voice.language}-${voice.voice_name}`
    
    // If clicking the same voice that's playing, pause it
    if (playingVoiceId === voiceId && voicePreviewAudioRef.current) {
      voicePreviewAudioRef.current.pause()
      setPlayingVoiceId(null)
      setVoicePreviewAudio(null)
      return
    }
    
    // Stop any currently playing preview
    if (voicePreviewAudioRef.current) {
      voicePreviewAudioRef.current.pause()
      voicePreviewAudioRef.current = null
    }
    
    // Start new preview - use audio sample file
    setPlayingVoiceId(voiceId)
    
    try {
      // Try to load audio sample from public folder
      // Map voice names to gender for audio file lookup
      const gender = (voice.voice_name === 'diana' || voice.voice_name === 'pooja' || voice.voice_name === 'bhagya' || voice.voice_name === 'vidhya' || voice.voice_name === 'neha' || voice.voice_name === 'janki') ? 'female' : 'male'
      const audioExtensions = { en: 'mp3', hi: 'wav', kn: 'mp3', mr: 'wav', te: 'wav', sa: 'wav', bn: 'wav', bh: 'wav', mh: 'wav', mg: 'wav', ch: 'wav', gu: 'wav' }
      const ext = audioExtensions[voice.language] || 'mp3'
      const audioSamplePath = `/${voice.language}-${gender}.${ext}`
      const audio = new Audio(audioSamplePath)
      
      audio.onended = () => {
        setPlayingVoiceId(null)
        setVoicePreviewAudio(null)
      }
      
      audio.onerror = () => {
        // If sample file doesn't exist, fallback to generating preview
        console.log('Audio sample not found, generating preview...')
        generateVoicePreview(voice, voiceId)
      }
      
      audio.onloadeddata = () => {
        voicePreviewAudioRef.current = audio
        setVoicePreviewAudio(audioSamplePath)
        audio.play()
      }
      
      // Try to load the audio
      audio.load()
    } catch (error) {
      console.error('Error loading audio sample:', error)
      // Fallback to generating preview
      generateVoicePreview(voice, voiceId)
    }
  }

  const generateVoicePreview = async (voice, voiceId) => {
    const previewText = "Hello, this is a voice preview."
    
    try {
      const requestBody = {
        text: previewText,
        voice: voice.voice_name,
        language: voice.language
      }
      
      const response = await fetch(`${API_BASE}/api/v1/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Voice preview failed:', errorData)
        setPlayingVoiceId(null)
        return
      }
      
      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        setPlayingVoiceId(null)
        setVoicePreviewAudio(null)
        URL.revokeObjectURL(audioUrl)
      }
      
      audio.onerror = () => {
        setPlayingVoiceId(null)
        setVoicePreviewAudio(null)
        URL.revokeObjectURL(audioUrl)
      }
      
      voicePreviewAudioRef.current = audio
      setVoicePreviewAudio(audioUrl)
      audio.play()
    } catch (error) {
      console.error('Error generating voice preview:', error)
      setPlayingVoiceId(null)
    }
  }

  const handleVoiceModalPreview = async () => {
    if (!selectedVoiceForPreview || !voicePreviewText.trim() || isGeneratingVoicePreview) {
      return
    }
    
    setIsGeneratingVoicePreview(true)
    
    // Stop any currently playing preview
    if (voicePreviewAudioRef.current) {
      voicePreviewAudioRef.current.pause()
      voicePreviewAudioRef.current = null
    }
    if (voicePreviewAudioUrl) {
      URL.revokeObjectURL(voicePreviewAudioUrl)
      setVoicePreviewAudioUrl(null)
    }
    
    try {
      const requestBody = {
        text: voicePreviewText.trim(),
        voice: selectedVoiceForPreview.voice_name,
        language: selectedVoiceForPreview.language
      }
      
      const response = await fetch(`${API_BASE}/api/v1/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Voice preview failed:', errorData)
        alert('Failed to generate preview. Please try again.')
        setIsGeneratingVoicePreview(false)
        return
      }
      
      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      setVoicePreviewAudioUrl(audioUrl)
    } catch (error) {
      console.error('Error generating voice preview:', error)
      alert('Failed to generate preview. Please try again.')
    } finally {
      setIsGeneratingVoicePreview(false)
    }
  }

  const handleGoToTextToSpeech = () => {
    if (selectedVoiceForPreview) {
      setActiveView('text-to-speech')
      setTtsLanguage(selectedVoiceForPreview.language)
      setSelectedVoice(selectedVoiceForPreview.voice_name)
      setSearchParams({ view: 'text-to-speech' })
      setShowVoicePreviewModal(false)
    }
  }

  const handleSpeak = async () => {
    if (isSending || !textToSpeak.trim() || !ttsLanguage || !selectedVoice) {
      if (!ttsLanguage) {
        alert('Please select a language first')
      } else if (!selectedVoice) {
        alert('Please select a voice')
      }
      return
    }
    setIsSending(true)
    try {
      const requestBody = { 
        text: textToSpeak.trim(),
        voice: selectedVoice,
        language: ttsLanguage
      }
      console.log('Sending TTS request to:', `${API_BASE}/api/v1/tts`, requestBody)
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout
      
      const response = await fetch(`${API_BASE}/api/v1/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('TTS response status:', response.status, response.statusText)
      console.log('TTS response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`
        try {
          const errorData = await response.json().catch(() => null)
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail
          } else {
            const errorText = await response.text().catch(() => '')
            if (errorText) {
              errorMessage = errorText
            }
          }
        } catch (e) {
          console.error('Error parsing error response:', e)
        }
        console.error('TTS error:', errorMessage)
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      console.log('Received audio blob, size:', blob.size, 'type:', blob.type)
      
      if (blob.size === 0) {
        throw new Error('Received empty audio file from server')
      }
      
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setIsPlaying(false)
      // Reset audio ref when new audio is generated
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      console.log('TTS audio generated successfully')
    } catch (err) {
      console.error('TTS error:', err)
      let errorMessage = 'Failed to generate speech. Please try again.'
      
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. The server is taking too long to respond. Please check if the backend server is running and accessible.'
      } else if (err.message && err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check:\n1. The backend server is running\n2. The API URL is correct\n3. CORS is properly configured\n4. Network connectivity'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleClonePreview = async () => {
    if (isGeneratingPreview || !clonePreviewText.trim() || !clonePreviewLanguage) {
      if (!clonePreviewLanguage) {
        alert('Please select a language first')
      }
      return
    }
    setIsGeneratingPreview(true)
    
    try {
      const audioBase64 = await blobToBase64(recordedBlob)
      
      const requestBody = {
        text: clonePreviewText.trim(),
        voice: cloneName,
        language: clonePreviewLanguage,
        cloneing: true,
        ref_speker_base64: audioBase64,
        ref_speker_name: cloneName
      }
      
      const response = await fetch(`${API_BASE}/api/v1/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || 'Failed to generate preview')
      }
      
      const blob = await response.blob()
      if (blob.size === 0) {
        throw new Error('Received empty audio file from server')
      }
      
      const url = URL.createObjectURL(blob)
      setClonePreviewAudio(url)
      
      // Auto-play preview
      const audio = new Audio(url)
      audio.play().catch(() => {})
      
    } catch (err) {
      console.error('Preview error:', err)
      alert(`Error generating preview: ${err.message}`)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleDownloadClonePackage = async () => {
    if (!recordedBlob && !clonePreviewAudio) {
      alert('No audio available to download')
      return
    }
    
    try {
      // Download reference audio
      if (recordedBlob) {
        const url = URL.createObjectURL(recordedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${cloneName}_reference.webm`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }
      
      // Download preview audio if available (with slight delay to avoid browser blocking)
      if (clonePreviewAudio) {
        setTimeout(async () => {
          const response = await fetch(clonePreviewAudio)
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${cloneName}_preview.wav`
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        }, 100)
      }
      
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download audio files')
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

  const handlePlayPause = () => {
    if (!audioUrl) return

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      // Set up event listeners
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
      })
      audio.addEventListener('pause', () => {
        setIsPlaying(false)
      })
      audio.addEventListener('play', () => {
        setIsPlaying(true)
      })
    }

    const audio = audioRef.current

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      })
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
    } else if (selectedControl === 'language') {
      setTtsLanguage(tempControlValue)
    } else if (selectedControl === 'voice') {
      setSelectedVoice(tempControlValue)
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

  const handleFileUpload = (file) => {
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
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
      e.target.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
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

  // Cleanup audio element when audioUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])


  if (!user) {
    return (
      <div className="playground">
        <div className="login-panel">
          <div className="login-card">
            <h2 className="login-title">Welcome to Playground</h2>
            <p className="login-sub">Sign in to continue</p>
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
              data-tutorial-highlight="menu-btn"
            >
              {(sidebarOpen && isSmallScreen) ? <IoClose /> : <IoMenuOutline />}
            </button>
            <Link to="/" className="navbar-btn home-btn" title="Home">
              <HiMiniHome />
            </Link>
          </div>
          <div className="navbar-right">
            <button 
              className="navbar-btn tutorial-btn" 
              onClick={() => setShowTutorial(true)}
              title="Show Tutorial"
              data-tutorial-highlight="navbar-right"
            >
              <BsQuestion />
            </button>
            <div className="theme-toggle-container">
              <button 
                className={`theme-toggle-switch ${theme === 'dark' ? 'dark-active' : 'light-active'}`}
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                data-tutorial-highlight="navbar-right"
              >
                <div className="toggle-track">
                  <div className="toggle-thumb">
                    {theme === 'dark' ? <FaMoon /> : <IoSunny />}
                  </div>
                </div>
              </button>
            </div>
            {user && (
              <button 
                className="navbar-btn user-btn" 
                onClick={() => setShowAccountModal(true)}
                title={user.name || user.email}
                data-tutorial-highlight="navbar-right"
              >
                <img 
                  src={getUserAvatarUrl(user)} 
                  alt={user.name || user.email} 
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = '/male.png'
                  }}
                />
              </button>
            )}
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
        <aside 
          className={`playground-sidebar-left ${sidebarOpen ? 'open' : 'closed'}`}
          data-tutorial-highlight="sidebar-left"
        >
          

          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">VOICE TOOLS</div>
              <button 
                className={`nav-item ${activeView === 'text-to-speech' ? 'active' : ''}`}
                onClick={() => handleViewChange('text-to-speech')}
              >
                Text to Speech
              </button>
              <button 
                className={`nav-item ${activeView === 'instant-clone' ? 'active' : ''}`}
                onClick={() => handleViewChange('instant-clone')}
              >
                Instant Clone
              </button>
              <button 
                className={`nav-item ${activeView === 'speech-to-text' ? 'active' : ''}`}
                onClick={() => handleViewChange('speech-to-text')}
              >
                Speech to Text
              </button>
            </div>


            <div className="nav-section">
              <div className="nav-section-title">LIBRARY</div>
              <button 
                className={`nav-item ${activeView === 'voices' ? 'active' : ''}`}
                onClick={() => handleViewChange('voices')}
              >
                Voices
              </button>
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

          {user && (
            <div className="sidebar-user-section">
              <div className="nav-section">
                <div className="nav-section-title">USER INFO</div>
                <button 
                  className="nav-item sidebar-user-name"
                  onClick={() => setShowAccountModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <img 
                    src={getUserAvatarUrl(user)} 
                    alt={user.name || user.email} 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/male.png'
                    }}
                  />
                  <span>{user.name || user.email}</span>
                </button>
              </div>
            </div>
          )}

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
                  data-tutorial-highlight="control-card"
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
                  data-tutorial-highlight="text-input"
                />
              </div>

              <div className="main-footer">
                <div className="credits-speak-group">
                  <div className="credits-info">0 credits</div>
                  <div className="word-count-info">{countWords(textToSpeak)} {countWords(textToSpeak) === 1 ? 'word' : 'words'}</div>
                </div>
                {audioUrl && (
                  <div className="audio-controls">
                    <button 
                      className="play-pause-btn" 
                      onClick={handlePlayPause}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button 
                      className="download-btn" 
                      onClick={handleDownload}
                      title="Download audio"
                    >
                      <LiaDownloadSolid />
                    </button>
                  </div>
                )}
                <div className="speak-btn-container">
                <button
                    className="speak-btn"
                    onClick={handleSpeak}
                    disabled={isSending || !textToSpeak.trim() || !ttsLanguage}
                    data-tutorial-highlight="speak-button"
                  >
                    <FaPlay />
                    Speak
                  </button>
                  </div>
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
                            onClick={() => handleControlSelect('language', ttsLanguage)}
                          >
                            Language
                          </button>
                          <button 
                            className="control-card-item"
                            onClick={() => handleControlSelect('voice', selectedVoice)}
                          >
                            Voice
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
                                <option>Panini 0.1</option>
                              </select>
                            </div>
                          )}
                          {selectedControl === 'language' && (
                            <div className="control-group">
                              <label className="control-label">Language</label>
                              <select
                                className="control-select"
                                value={tempControlValue}
                                onChange={(e) => setTempControlValue(e.target.value)}
                              >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="kn">Kannada</option>
                                <option value="te">Telugu</option>
                                <option value="mr">Marathi</option>
                                <option value="sa">Sanskrit</option>
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
                                disabled={filteredVoices.length === 0}
                              >
                                <option value="">Select voice</option>
                                {filteredVoices.length > 0 ? (
                                  filteredVoices.map((voice) => {
                                    const isRecommended = recommendedVoices.includes(voice.voice_name)
                                    const displayName = voice.voice_name.charAt(0).toUpperCase() + voice.voice_name.slice(1)
                                    return (
                                      <option 
                                        key={`${voice.language}-${voice.voice_name}`} 
                                        value={voice.voice_name}
                                        data-recommended={isRecommended ? 'true' : 'false'}
                                        className={isRecommended ? 'recommended-option' : ''}
                                      >
                                        {displayName}{isRecommended ? ' (recommended)' : ''}
                                      </option>
                                    )
                                  })
                                ) : (
                                  <option>No voices available</option>
                                )}
                              </select>
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
            <aside 
              className="playground-sidebar-right"
              data-tutorial-highlight="sidebar-right"
            >
          

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
                  <option>Panini 0.1</option>
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Language</label>
                <select
                  className="control-select"
                  value={ttsLanguage}
                  onChange={(e) => setTtsLanguage(e.target.value)}
                  required
                >
                  <option value="" disabled>Select language</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                  <option value="te">Telugu</option>
                  <option value="mr">Marathi</option>
                  <option value="sa">Sanskrit</option>
                  <option value="bn">Bengali</option>
                  <option value="bh">Bhojpuri</option>
                  <option value="mh">Maithili</option>
                  <option value="mg">Magahi</option>
                  <option value="ch">Chhattisgarhi</option>
                  <option value="gu">Gujarati</option>
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Voice</label>
                <select
                  className="control-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  disabled={filteredVoices.length === 0}
                >
                  <option value="">Select voice</option>
                  {filteredVoices.length > 0 ? (
                      filteredVoices.map((voice) => {
                        const isRecommended = recommendedVoices.includes(voice.voice_name)
                        const displayName = voice.voice_name.charAt(0).toUpperCase() + voice.voice_name.slice(1)
                        return (
                          <option 
                            key={`${voice.language}-${voice.voice_name}`} 
                            value={voice.voice_name}
                            data-recommended={isRecommended ? 'true' : 'false'}
                            className={isRecommended ? 'recommended-option' : ''}
                          >
                            {displayName}{isRecommended ? ' (recommended)' : ''}
                          </option>
                        )
                      })
                  ) : (
                    <option>No voices available</option>
                  )}
                </select>
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
        ) : activeView === 'voices' ? (
          <div className="voices-view-container">
            <div className="voices-view-header">
              <div className="voices-view-title-row">
                <h1 className="voices-view-title">Available Voices</h1>
                <div className="voice-search-container">
                  <CiSearch className="voice-search-icon" />
                  <input
                    type="text"
                    className="voice-search-input"
                    placeholder="Search voices by name or language..."
                    value={voiceSearchQuery}
                    onChange={(e) => setVoiceSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <p className="voices-view-subtitle">Explore our collection of voices across multiple languages</p>
            </div>
            <div className="voices-cards-grid">
              {(() => {
                // Use local voice data if API data is empty or unavailable
                let voicesToDisplay = availableVoices.length > 0 
                  ? availableVoices.filter(voice => voice.available)
                  : getAllVoices().map(voice => ({
                      language: voice.language,
                      voice_name: voice.name, // Use the actual name field which now contains patrick, diana, etc.
                      available: true,
                      voiceId: voice.voiceId
                    }))
                
                // Filter by search query
                if (voiceSearchQuery.trim()) {
                  const query = voiceSearchQuery.toLowerCase()
                  voicesToDisplay = voicesToDisplay.filter(voice => {
                    const localVoiceData = getAllVoices().find(v => 
                      v.language === voice.language && 
                      ((v.gender === 'female' && (voice.voice_name === 'diana' || voice.voice_name === 'pooja' || voice.voice_name === 'bhagya' || voice.voice_name === 'vidhya' || voice.voice_name === 'neha' || voice.voice_name === 'janki')) || 
                       (v.gender === 'male' && (voice.voice_name === 'patrick' || voice.voice_name === 'surya' || voice.voice_name === 'arush' || voice.voice_name === 'ranna' || voice.voice_name === 'kabir' || voice.voice_name === 'raghava')))
                    )
                    const displayName = localVoiceData?.displayName || 
                      `${voice.voice_name.charAt(0).toUpperCase() + voice.voice_name.slice(1)}`
                    const languageNames = {
                      en: 'English', hi: 'Hindi', kn: 'Kannada', te: 'Telugu', mr: 'Marathi',
                      sa: 'Sanskrit', bn: 'Bengali', bh: 'Bhojpuri', mh: 'Maithili', mg: 'Magahi',
                      ch: 'Chhattisgarhi', gu: 'Gujarati'
                    }
                    const languageName = languageNames[voice.language] || voice.language.toUpperCase()
                    return displayName.toLowerCase().includes(query) || 
                           voice.voice_name.toLowerCase().includes(query) ||
                           languageName.toLowerCase().includes(query) ||
                           voice.language.toLowerCase().includes(query)
                  })
                }
                
                if (voicesToDisplay.length === 0) {
                  return (
                    <div className="voices-loading">
                      <p>{voiceSearchQuery.trim() ? 'No voices found matching your search.' : 'Loading voices...'}</p>
                    </div>
                  )
                }
                
                const languageNames = {
                  en: 'English',
                  hi: 'Hindi',
                  kn: 'Kannada',
                  te: 'Telugu',
                  mr: 'Marathi',
                  sa: 'Sanskrit',
                  bn: 'Bengali',
                  bh: 'Bhojpuri',
                  mh: 'Maithili',
                  mg: 'Magahi',
                  ch: 'Chhattisgarhi',
                  gu: 'Gujarati'
                }
                
                return voicesToDisplay.map((voice) => {
                  // Get full voice data from local metadata if available
                  const localVoiceData = getAllVoices().find(v => 
                    v.language === voice.language && 
                    ((v.gender === 'female' && (voice.voice_name === 'diana' || voice.voice_name === 'pooja' || voice.voice_name === 'bhagya' || voice.voice_name === 'vidhya' || voice.voice_name === 'neha' || voice.voice_name === 'janki')) || 
                     (v.gender === 'male' && (voice.voice_name === 'patrick' || voice.voice_name === 'surya' || voice.voice_name === 'arush' || voice.voice_name === 'ranna' || voice.voice_name === 'kabir' || voice.voice_name === 'raghava')))
                  )
                  
                  const displayName = localVoiceData?.displayName || 
                    `${voice.voice_name.charAt(0).toUpperCase() + voice.voice_name.slice(1)}`
                  const description = localVoiceData?.description || ''
                  
                  const voiceId = `${voice.language}-${voice.voice_name}`
                  const isPlaying = playingVoiceId === voiceId
                  
                  return (
                    <div 
                      key={voiceId}
                      className="voice-detail-card"
                      onClick={() => {
                        setSelectedVoiceForPreview(voice)
                        setShowVoicePreviewModal(true)
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="voice-card-content">
                        <div className="voice-card-header">
                          <div className="voice-card-info">
                            <h3 className="voice-card-name">
                              {displayName}
                            </h3>
                            {description && (
                              <p className="voice-card-description">
                                {description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>

          

          {/* Voice Preview Modal - shown when clicking a voice */}
          {showVoicePreviewModal && selectedVoiceForPreview && (
            <div className="voice-preview-overlay" onClick={() => setShowVoicePreviewModal(false)}>
              <div className="voice-preview-modal" onClick={(e) => e.stopPropagation()}>
                
                {(() => {
                  const localVoiceData = getAllVoices().find(v => 
                    v.language === selectedVoiceForPreview.language && 
                    ((v.gender === 'female' && (selectedVoiceForPreview.voice_name === 'diana' || selectedVoiceForPreview.voice_name === 'pooja' || selectedVoiceForPreview.voice_name === 'bhagya' || selectedVoiceForPreview.voice_name === 'vidhya' || selectedVoiceForPreview.voice_name === 'neha' || selectedVoiceForPreview.voice_name === 'janki')) || 
                     (v.gender === 'male' && (selectedVoiceForPreview.voice_name === 'patrick' || selectedVoiceForPreview.voice_name === 'surya' || selectedVoiceForPreview.voice_name === 'arush' || selectedVoiceForPreview.voice_name === 'ranna' || selectedVoiceForPreview.voice_name === 'kabir' || selectedVoiceForPreview.voice_name === 'raghava')))
                  )
                  const displayName = localVoiceData?.displayName || 
                    `${selectedVoiceForPreview.voice_name.charAt(0).toUpperCase() + selectedVoiceForPreview.voice_name.slice(1)}`
                  const languageNames = {
                    en: 'English', hi: 'Hindi', kn: 'Kannada', te: 'Telugu', mr: 'Marathi',
                    sa: 'Sanskrit', bn: 'Bengali', bh: 'Bhojpuri', mh: 'Maithili', mg: 'Magahi',
                    ch: 'Chhattisgarhi', gu: 'Gujarati'
                  }
                  const languageName = languageNames[selectedVoiceForPreview.language] || selectedVoiceForPreview.language.toUpperCase()
                  
                  return (
                    <>
                      <div>
                      <h2 className="voice-preview-title">{displayName}</h2>
                      </div>
                      
                      <div>
                      <p className="voice-preview-subtitle"> Language : {languageName}</p>
                      </div>
                      
                      <div className="voice-preview-section">
                        <div className="voice-preview-controls">
                          <textarea
                            className="voice-preview-text"
                            value={voicePreviewText}
                            onChange={(e) => setVoicePreviewText(e.target.value)}
                            placeholder="Enter text to preview..."
                            rows={4}
                          />
                          <button
                            className="voice-preview-speak-btn"
                            onClick={handleVoiceModalPreview}
                            disabled={isGeneratingVoicePreview || !voicePreviewText.trim()}
                          >
                            {isGeneratingVoicePreview ? 'Generating...' : <><FaPlay /> Preview</>}
                          </button>
                        </div>
                        
                        {voicePreviewAudioUrl && (
                          <div className="voice-preview-audio">
                            <AudioPlayer
                              src={voicePreviewAudioUrl}
                              hideControls={false}
                              showLanguage={false}
                              theme={theme}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="voice-preview-actions">
                        <button 
                          className="voice-preview-action-btn primary"
                          onClick={handleGoToTextToSpeech}
                        >
                          Use in Text to Speech
                        </button>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
            )}
          </div>
        ) : activeView === 'speech-to-text' ? (
          <div className="speech-to-text-container">
            <div className="speech-to-text-header">
              <h1 className="speech-to-text-title">Speech to Text</h1>
            </div>

            {/* Three Card Layout */}
            <div className="speech-to-text-layout">
              {/* Top Row: Mic Recording, Upload Cards, and Audio Player */}
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
                  <div 
                    className={`upload-card-dropzone ${isDragging ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
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
                          onChange={handleFileInputChange}
                          style={{ display: 'none' }}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Audio Player Section */}
                <div className="speech-to-text-audio-section">
                  <div className="audio-preview-section">
                    {recordedUrl ? (
                      <AudioPlayer 
                        src={recordedUrl} 
                        hideControls={false}
                        showLanguage={true}
                        language={asrLanguage}
                        onLanguageChange={setAsrLanguage}
                        theme={theme}
                      />
                    ) : (
                      <AudioPlayer 
                        src={null}
                        hideControls={false}
                        showLanguage={true}
                        language={asrLanguage}
                        onLanguageChange={setAsrLanguage}
                        theme={theme}
                      />
                    )}
                  </div>
                  <button 
                    className="transcribe-btn"
                    onClick={async () => {
                      if (!asrLanguage) {
                        alert('Please select a language first')
                        return
                      }
                      if (recordedBlob) {
                        setIsTranscribing(true)
                        try {
                          const formData = new FormData()
                          formData.append('audio', recordedBlob)
                          formData.append('language', asrLanguage)
                          const response = await fetch(`${API_BASE}/api/v1/asr`, {
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
                    disabled={!recordedUrl || isTranscribing || !asrLanguage}
                  >
                    {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                  </button>
                </div>
              </div>

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
                className={`clone-btn ${!cloneName || !recordedBlob ? 'disabled' : ''}`}
                onClick={() => {
                  if (!cloneName || !recordedBlob) return
                  
                  // Store clone data for later use
                  setShowClonePreview(true)
                  // Reset language selection for preview
                  setClonePreviewLanguage('')
                  setClonePreviewText("It's nice to meet you. Hope you're having a great day.")
                }}
                disabled={!cloneName || !recordedBlob}
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
                          <AudioPlayer src={recordedUrl} hideControls={true} theme={theme} />
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
                                <AudioPlayer src={recordedUrl} theme={theme} />
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
                            onChange={(e) => {
                              const file = e.target.files[0]
                              if (file) {
                                handleFileUpload(file)
                                e.target.value = ''
                              }
                            }}
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
              </div>
            </div>
          </div>
        )}

        {/* Clone Preview Modal */}
        {showClonePreview && (
          <div className="clone-preview-overlay" onClick={() => setShowClonePreview(false)}>
            <div className="clone-preview-modal" onClick={(e) => e.stopPropagation()}>
              <div className="clone-preview-header">
                <div className="clone-preview-breadcrumb">
                  <span>My Voices</span>
                  <span className="breadcrumb-separator">›</span>
                  <span>{cloneName}</span>
                </div>
                <button 
                  className="clone-preview-edit-btn"
                  onClick={() => setShowClonePreview(false)}
                >
                  Edit
                </button>
              </div>
              
              <h2 className="clone-preview-title">{cloneName}</h2>
              
              <div className="clone-preview-section">
                <h3 className="clone-preview-section-title">Preview</h3>
                <div className="clone-preview-controls">
                  <div className="clone-preview-language">
                    <label className="clone-preview-label">Language</label>
                    <select
                      className="clone-preview-select"
                      value={clonePreviewLanguage}
                      onChange={(e) => setClonePreviewLanguage(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select language</option>
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="kn">Kannada</option>
                      <option value="te">Telugu</option>
                      <option value="mr">Marathi</option>
                      <option value="sa">Sanskrit</option>
                      <option value="bn">Bengali</option>
                      <option value="bh">Bhojpuri</option>
                      <option value="mh">Maithili</option>
                      <option value="mg">Magahi</option>
                      <option value="ch">Chhattisgarhi</option>
                      <option value="gu">Gujarati</option>
                    </select>
                  </div>
                  
                  <textarea
                    className="clone-preview-text"
                    value={clonePreviewText}
                    onChange={(e) => setClonePreviewText(e.target.value)}
                    placeholder="Enter text to preview..."
                    rows={3}
                  />
                  
                  <button
                    className="clone-preview-speak-btn"
                    onClick={handleClonePreview}
                    disabled={isGeneratingPreview || !clonePreviewText.trim() || !clonePreviewLanguage}
                  >
                    <FaPlay />
                    {isGeneratingPreview ? 'Generating...' : 'Speak'}
                  </button>
                </div>
              </div>
              
              <div className="clone-preview-actions">
                <button 
                  className="clone-preview-action-btn"
                  onClick={handleDownloadClonePackage}
                >
                  <LiaDownloadSolid />
                  Download Source
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Modal */}
      <AccountModal 
        isOpen={showAccountModal} 
        onClose={() => setShowAccountModal(false)} 
      />

      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)}
        activeView={activeView}
      />
    </div>
  )
}

