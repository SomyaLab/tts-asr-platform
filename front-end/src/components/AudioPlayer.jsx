import { useEffect, useMemo, useRef, useState } from 'react'
import { HiSpeakerWave, HiMiniPause } from 'react-icons/hi2'
import { RiPlayLargeLine } from 'react-icons/ri'
import './AudioPlayer.css'

function formatTime(totalSeconds) {
  if (!isFinite(totalSeconds)) return '0:00'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function AudioPlayer({ src, className = '', style, hideControls = false, showLanguage = false, language = '', onLanguageChange = null, theme = 'dark' }) {
  const audioRef = useRef(null)
  const progressRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  
  // Determine if light theme is active based on prop or system preference
  const isLightTheme = theme === 'light';

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !src) {
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)
      return
    }

    const onLoaded = () => setDuration(audio.duration || 0)
    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onEnd = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    
    // Load metadata when src changes
    audio.load()
    
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [src])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      audioRef.current.playbackRate = rate
    }
  }, [volume, rate])

  const progressPercent = useMemo(() => {
    if (!duration) return 0
    return Math.min(100, Math.max(0, (currentTime / duration) * 100))
  }, [currentTime, duration])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  function onSeek(e) {
    const audio = audioRef.current
    if (!audio) return
    const value = Number(e.target.value)
    audio.currentTime = value
    setCurrentTime(value)
  }

  function toggleRate() {
    setRate((r) => (r === 1 ? 1.5 : r === 1.5 ? 2 : 1))
  }

  return (
    <div className={`ap-root ${className}`} style={style}>
      {src && <audio ref={audioRef} src={src} preload="metadata" />}
      {showLanguage && (
        <div className="ap-language-selector">
          <label className="ap-language-label">Language:</label>
          <select
            className="ap-language-select"
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
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
      )}
      <div className={`ap-controls-wrapper ${isLightTheme ? 'ap-light' : 'ap-dark'}`}>
        <div className="ap-row">
          <button 
            className="ap-btn--icon" 
            onClick={togglePlay} 
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={!src}
            style={{ opacity: !src ? 0.5 : 1, cursor: !src ? 'not-allowed' : 'pointer' }}
          >
            {isPlaying ? <HiMiniPause size={22} /> : <RiPlayLargeLine size={24} />}
          </button>
          <input
            ref={progressRef}
            className="ap-seek"
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={onSeek}
            disabled={!src}
            style={{
              background: isLightTheme
                ? `linear-gradient(90deg, #4472cf 0%, #67e6cd ${progressPercent}%, rgba(0,0,0,0.2) ${progressPercent}%, rgba(0,0,0,0.2) 100%)`
                : `linear-gradient(90deg, #4472cf 0%, #67e6cd ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`,
              cursor: !src ? 'not-allowed' : 'pointer'
            }}
            aria-label="Seek"
          />
          <span className="ap-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>

        {!hideControls && (
          <div className="ap-row ap-controls">
            <button className="ap-chip" onClick={toggleRate} disabled={!src} style={{ opacity: !src ? 0.5 : 1 }}>{rate}x</button>
            <div className="ap-vol">
              <span className="ap-vol-icon" style={{ opacity: !src ? 0.5 : 1 }}><HiSpeakerWave size={16} /></span>
              <input
                className="ap-vol-range"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                disabled={!src}
                style={{ opacity: !src ? 0.5 : 1, cursor: !src ? 'not-allowed' : 'pointer' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


