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
import { useAuth } from './AuthContext.jsx'

function AuthNotification() {
  const { authError, authMessage, clearAuthError, clearAuthMessage, resendConfirmationEmail } = useAuth()
  const [resendLoading, setResendLoading] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [showResendInput, setShowResendInput] = useState(false)

  if (!authError && !authMessage) return null

  const isExpiredError = authError?.includes('expired') || authError?.includes('Expired')

  const handleResend = async () => {
    if (!resendEmail) {
      setShowResendInput(true)
      return
    }
    setResendLoading(true)
    try {
      await resendConfirmationEmail(resendEmail)
      clearAuthError()
      // Show success message briefly
      setTimeout(() => {
        setResendEmail('')
        setShowResendInput(false)
      }, 2000)
    } catch (err) {
      // Error will be handled by authError state
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      maxWidth: '400px',
      padding: '16px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      backgroundColor: authError ? '#fee' : '#efe',
      color: authError ? '#c33' : '#3c3',
      border: `1px solid ${authError ? '#fcc' : '#cfc'}`,
      fontSize: '14px',
      lineHeight: '1.5'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div>{authError || authMessage}</div>
          {isExpiredError && (
            <div style={{ marginTop: '12px' }}>
              {!showResendInput ? (
                <button
                  onClick={() => setShowResendInput(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c33',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '13px'
                  }}
                >
                  Resend confirmation email
                </button>
              ) : (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      border: '1px solid #fcc',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleResend}
                      disabled={resendLoading || !resendEmail}
                      style={{
                        padding: '4px 12px',
                        background: '#c33',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: resendLoading || !resendEmail ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        opacity: resendLoading || !resendEmail ? 0.6 : 1
                      }}
                    >
                      {resendLoading ? 'Sending...' : 'Send'}
                    </button>
                    <button
                      onClick={() => {
                        setShowResendInput(false)
                        setResendEmail('')
                      }}
                      style={{
                        padding: '4px 12px',
                        background: 'none',
                        color: '#c33',
                        border: '1px solid #fcc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={authError ? clearAuthError : clearAuthMessage}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'inherit',
            padding: 0,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            flexShrink: 0
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  )
}

function App() {
  const location = useLocation()
  const showHeader = location.pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  // Track page views for Google Analytics on route changes
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-LN52PD2V48', {
        page_path: location.pathname + location.search
      })
    }
  }, [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      <AuthNotification />
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
