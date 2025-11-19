import { useState, useEffect, useRef } from 'react'
import { IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import './TutorialModal.css'

const ALL_TUTORIAL_STEPS = [
  {
    id: 1,
    title: 'Welcome to Playground',
    description: 'The Playground is your workspace for creating text-to-speech, cloning voices, and transcribing audio. Let\'s take a quick tour of the main features.',
    position: 'center',
    highlight: null
  },
  {
    id: 2,
    title: 'Left Sidebar Navigation',
    description: 'Use the left sidebar to navigate between different tools: Text to Speech, Instant Clone, Speech to Text, and explore available Voices. The sidebar can be toggled using the menu button.',
    position: 'right',
    highlight: 'sidebar-left'
  },
  {
    id: 3,
    title: 'Text Input Area',
    description: 'Type or paste your text here. This is where you enter the content you want to convert to speech. The word count is displayed at the bottom.',
    position: 'right',
    highlight: 'text-input'
  },
  {
    id: 4,
    title: 'Right Sidebar Controls',
    description: 'Configure your voice settings here. Select the Model, Language, and Voice. Make sure to select a language before generating speech.',
    position: 'left',
    highlight: 'sidebar-right'
  },
  {
    id: 5,
    title: 'Speak Button & Audio Playback',
    description: 'Click the "Speak" button to generate speech from your text. Once generated, you can play, pause, and download the audio file.',
    position: 'top',
    highlight: 'speak-button'
  },
  {
    id: 6,
    title: 'Control Card Menu',
    description: 'Click the three dots button (⋮) to access quick controls for Model, Language, and Voice selection. This is especially useful on mobile devices.',
    position: 'bottom',
    highlight: 'control-card',
    mobileOnly: true
  }
]

export default function TutorialModal({ isOpen, onClose, activeView = 'text-to-speech' }) {
  const [isMobile, setIsMobile] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightPosition, setHighlightPosition] = useState(null)
  const [cardPosition, setCardPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
  const overlayRef = useRef(null)
  const highlightRef = useRef(null)

  // Don't show tutorial if not in text-to-speech view
  useEffect(() => {
    if (isOpen && activeView !== 'text-to-speech') {
      onClose()
    }
  }, [isOpen, activeView, onClose])

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter steps based on mobile view
  const getTutorialSteps = () => {
    return ALL_TUTORIAL_STEPS.filter(step => {
      if (step.mobileOnly && !isMobile) {
        return false
      }
      return true
    })
  }

  const TUTORIAL_STEPS = getTutorialSteps()

  // Reset to first step when tutorial opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setHighlightPosition(null)
      setCardPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
    }
  }, [isOpen])

  // Update highlight position and card position when step changes
  useEffect(() => {
    if (!isOpen) return
    
    const steps = getTutorialSteps()
    const updatePositions = () => {
      if (currentStep >= steps.length) return
      
      const step = steps[currentStep]
      
      // Handle mobile view - if sidebar is collapsed, show menu button instead
      if (step.highlight === 'sidebar-left' && isMobile) {
        const menuBtn = document.querySelector('[data-tutorial-highlight="menu-btn"]')
        if (menuBtn) {
          const rect = menuBtn.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            setHighlightPosition({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            })
            // Position card to the right of menu button
            setCardPosition({
              top: `${rect.top + rect.height / 2}px`,
              left: `${rect.right + 16}px`,
              transform: 'translateY(-50%)'
            })
            return
          }
        }
      }
      
      if (!step.highlight) {
        setHighlightPosition(null)
        // Center card for steps without highlight
        setCardPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
        return
      }

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(`[data-tutorial-highlight="${step.highlight}"]`)
        if (element) {
          const rect = element.getBoundingClientRect()
          // Only show highlight if element is visible
          if (rect.width > 0 && rect.height > 0) {
            setHighlightPosition({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            })
            
            // Calculate card position based on step and element position
            let newCardPosition = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
            
            if (step.highlight === 'sidebar-left') {
              // Attach to right edge of left sidebar
              newCardPosition = {
                top: `${rect.top + rect.height / 2}px`,
                left: `${rect.right + 16}px`,
                transform: 'translateY(-50%)'
              }
            } else if (step.highlight === 'sidebar-right') {
              // Attach to left edge of right sidebar
              newCardPosition = {
                top: `${rect.top + rect.height / 2}px`,
                left: `${rect.left - 16}px`,
                transform: 'translate(-100%, -50%)'
              }
            } else if (step.highlight === 'text-input') {
              // Center for text input
              newCardPosition = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
            } else if (step.highlight === 'speak-button') {
              // Position above speak button
              newCardPosition = {
                top: `${rect.top - 16}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translate(-50%, -100%)'
              }
            } else if (step.highlight === 'control-card') {
              // Position below control card button
              newCardPosition = {
                top: `${rect.bottom + 16}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)'
              }
            }
            
            setCardPosition(newCardPosition)
          } else {
            setHighlightPosition(null)
          }
        } else {
          setHighlightPosition(null)
        }
      }, 150)
    }

    updatePositions()
  }, [isOpen, currentStep, isMobile])

  // Handle window resize - recalculate positions
  useEffect(() => {
    if (!isOpen) return
    
    const handleResize = () => {
      const steps = getTutorialSteps()
      if (currentStep >= steps.length) return
      
      const step = steps[currentStep]
      
      // Handle mobile view - if sidebar is collapsed, show menu button instead
      if (step.highlight === 'sidebar-left' && isMobile) {
        const menuBtn = document.querySelector('[data-tutorial-highlight="menu-btn"]')
        if (menuBtn) {
          const rect = menuBtn.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            setHighlightPosition({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            })
            setCardPosition({
              top: `${rect.top + rect.height / 2}px`,
              left: `${rect.right + 16}px`,
              transform: 'translateY(-50%)'
            })
            return
          }
        }
      }
      
      if (!step.highlight) {
        setHighlightPosition(null)
        setCardPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
        return
      }

      setTimeout(() => {
        const element = document.querySelector(`[data-tutorial-highlight="${step.highlight}"]`)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            setHighlightPosition({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            })
            
            // Recalculate card position
            let newCardPosition = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
            
            if (step.highlight === 'sidebar-left') {
              newCardPosition = {
                top: `${rect.top + rect.height / 2}px`,
                left: `${rect.right + 16}px`,
                transform: 'translateY(-50%)'
              }
            } else if (step.highlight === 'sidebar-right') {
              newCardPosition = {
                top: `${rect.top + rect.height / 2}px`,
                left: `${rect.left - 16}px`,
                transform: 'translate(-100%, -50%)'
              }
            } else if (step.highlight === 'text-input') {
              newCardPosition = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
            } else if (step.highlight === 'speak-button') {
              newCardPosition = {
                top: `${rect.top - 16}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translate(-50%, -100%)'
              }
            } else if (step.highlight === 'control-card') {
              newCardPosition = {
                top: `${rect.bottom + 16}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)'
              }
            }
            
            setCardPosition(newCardPosition)
          } else {
            setHighlightPosition(null)
          }
        } else {
          setHighlightPosition(null)
        }
      }, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, currentStep, isMobile])

  const handleNext = () => {
    const steps = getTutorialSteps()
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('playground_tutorial_completed', 'true')
    onClose()
  }

  if (!isOpen || activeView !== 'text-to-speech') return null

  const steps = getTutorialSteps()
  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const shouldBlurRest = step.highlight && step.id >= 2 && step.id <= 5

  return (
    <div 
      className={`tutorial-overlay ${shouldBlurRest ? 'tutorial-blur-rest' : ''}`} 
      ref={overlayRef} 
      onClick={handleComplete}
    >
      {/* Highlight overlay */}
      {highlightPosition && (
        <div
          ref={highlightRef}
          className="tutorial-highlight"
          style={{
            top: `${highlightPosition.top}px`,
            left: `${highlightPosition.left}px`,
            width: `${highlightPosition.width}px`,
            height: `${highlightPosition.height}px`
          }}
        />
      )}

      {/* Tutorial Card */}
      <div 
        className="tutorial-card"
        style={cardPosition}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="tutorial-progress-container">
          <div className="tutorial-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Header */}
        <div className="tutorial-header">
          <div className="tutorial-step-indicator">
            Step {currentStep + 1} of {steps.length}
          </div>
          <button className="tutorial-close-btn" onClick={handleComplete} aria-label="Close tutorial">
            <IoClose />
          </button>
        </div>

        {/* Content */}
        <div className="tutorial-content">
          <h2 className="tutorial-title">{step.title}</h2>
          <p className="tutorial-description">
            {step.highlight === 'sidebar-left' && isMobile
              ? 'Use the menu button to open the sidebar and navigate between different tools: Text to Speech, Instant Clone, Speech to Text, and explore available Voices.'
              : step.description}
          </p>
        </div>

        {/* Footer */}
        <div className="tutorial-footer">
          <button className="tutorial-skip-btn" onClick={handleSkip}>
            Skip Tutorial
          </button>
          <div className="tutorial-nav-buttons">
            <button
              className="tutorial-nav-btn tutorial-nav-btn-prev"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <IoChevronBack />
              Previous
            </button>
            <button
              className="tutorial-nav-btn tutorial-nav-btn-next"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && <IoChevronForward />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

