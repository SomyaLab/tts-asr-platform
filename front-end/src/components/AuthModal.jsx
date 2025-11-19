import { useEffect, useMemo, useState } from 'react'
import './AuthModal.css'
import { useAuth } from '../AuthContext.jsx'

export default function AuthModal({ open, onClose }) {
  const { emailPasswordSignIn, signUp, resendConfirmationEmail, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (!open) {
      setMode('signin')
      setEmail('')
      setPassword('')
      setDisplayName('')
      setError('')
    }
  }, [open])

  if (!open) return null

  async function onSignIn(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await emailPasswordSignIn(email, password)
      onClose()
    } catch (err) {
      setError(err?.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function onSignUp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setShowResendConfirmation(false)
    setResendSuccess(false)
    try {
      const result = await signUp({ email, password, displayName })
      // If email confirmation is required, show message
      if (result.user && !result.session) {
        setError('Please check your email to confirm your account before signing in.')
        setShowResendConfirmation(true)
        setTimeout(() => {
          setMode('signin')
        }, 5000)
      } else {
        // User is signed up and logged in
        onClose()
      }
    } catch (err) {
      setError(err?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendConfirmation() {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    setResendLoading(true)
    setError('')
    setResendSuccess(false)
    try {
      await resendConfirmationEmail(email)
      setResendSuccess(true)
      setError('')
      setTimeout(() => {
        setResendSuccess(false)
      }, 5000)
    } catch (err) {
      setError(err?.message || 'Failed to resend confirmation email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  async function onGoogleSignIn(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      // Note: OAuth redirects away, so we don't call onClose here
    } catch (err) {
      setError(err?.message || 'Google sign in failed')
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="auth-title">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-sub">{mode === 'signin' ? 'Please enter your details to sign in.' : 'Please enter your details to sign up.'}</p>

        {mode === 'signin' && (
          <>
            <button 
              className="auth-google-btn" 
              onClick={onGoogleSignIn} 
              disabled={loading}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65454 14.4204 4.67181 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48181 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57954C10.3214 3.57954 11.5077 4.03363 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48181 0 2.43818 2.01681 0.957275 4.95818L3.96409 7.29C4.67181 5.16272 6.65454 3.57954 9 3.57954Z" fill="#EA4335"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
            <div className="auth-sep">
              <span>or</span>
            </div>
            <form className="auth-form" onSubmit={onSignIn}>
              <label className="auth-label">E-Mail Address</label>
              <input className="auth-input" type="email" required placeholder="Enter your email..." value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className="auth-label">Password</label>
              <input className="auth-input" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <div className="auth-error">{error}</div>}
              <div className="auth-remember">
                <label><input type="checkbox" /> Remember me</label>
                <button type="button" className="link">Forgot password?</button>
              </div>
              <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            </form>
            <div className="auth-footer">Don't have an account yet? <button className="link" onClick={() => setMode('signup')}>Sign Up</button></div>
          </>
        )}

        {mode === 'signup' && (
          <>
            <button 
              className="auth-google-btn" 
              onClick={onGoogleSignIn} 
              disabled={loading}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65454 14.4204 4.67181 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48181 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57954C10.3214 3.57954 11.5077 4.03363 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48181 0 2.43818 2.01681 0.957275 4.95818L3.96409 7.29C4.67181 5.16272 6.65454 3.57954 9 3.57954Z" fill="#EA4335"/>
              </svg>
              {loading ? 'Signing up...' : 'Continue with Google'}
            </button>
            <div className="auth-sep">
              <span>or</span>
            </div>
            <form className="auth-form" onSubmit={onSignUp}>
              <label className="auth-label">Display Name</label>
              <input className="auth-input" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="John Doe" />
              <label className="auth-label">E-Mail Address</label>
              <input className="auth-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <label className="auth-label">Password</label>
              <input className="auth-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              {error && <div className="auth-error">{error}</div>}
              {resendSuccess && <div style={{ color: 'green', fontSize: '14px', marginTop: '10px' }}>Confirmation email sent! Please check your inbox.</div>}
              {showResendConfirmation && (
                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                  <button 
                    type="button" 
                    className="link" 
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    style={{ padding: 0, background: 'none', border: 'none', cursor: resendLoading ? 'not-allowed' : 'pointer' }}
                  >
                    {resendLoading ? 'Sending...' : "Didn't receive the email? Resend confirmation"}
                  </button>
                </div>
              )}
              <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
            </form>
            <div className="auth-footer">Already have an account? <button className="link" onClick={() => setMode('signin')}>Sign In</button></div>
          </>
        )}
      </div>
    </div>
  )
}


