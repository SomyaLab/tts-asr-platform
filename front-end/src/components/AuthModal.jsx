import { useEffect, useMemo, useState } from 'react'
import './AuthModal.css'
import { useAuth } from '../AuthContext.jsx'

export default function AuthModal({ open, onClose }) {
  const { signInWithGoogle, signInWithApple, emailPasswordSignIn, signUpStart, verifyOtpAndCreateUser } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'verify'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setMode('signin')
      setEmail('')
      setPassword('')
      setDisplayName('')
      setOtp('')
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
    try {
      await signUpStart({ email, password, displayName })
      setMode('verify')
    } catch (err) {
      setError(err?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  async function onVerify(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtpAndCreateUser({ email, otp })
      onClose()
    } catch (err) {
      setError(err?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Please enter your details to sign in.</p>

        {mode === 'signin' && (
          <>
            <div className="auth-providers">
              <button className="social" onClick={async () => { await signInWithApple(); onClose() }}></button>
              <button className="social" onClick={async () => { await signInWithGoogle(); onClose() }}>G</button>
            </div>
            <div className="auth-sep"><span>OR</span></div>
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
            <h3 className="auth-step">Create your account</h3>
            <form className="auth-form" onSubmit={onSignUp}>
              <label className="auth-label">Display Name</label>
              <input className="auth-input" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="John Doe" />
              <label className="auth-label">E-Mail Address</label>
              <input className="auth-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <label className="auth-label">Password</label>
              <input className="auth-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              {error && <div className="auth-error">{error}</div>}
              <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Sending OTP...' : 'Sign Up'}</button>
            </form>
            <div className="auth-footer">Already have an account? <button className="link" onClick={() => setMode('signin')}>Sign In</button></div>
          </>
        )}

        {mode === 'verify' && (
          <>
            <h3 className="auth-step">Verify your email</h3>
            <p className="auth-sub">We've sent an OTP to {email}. Enter it below to verify.</p>
            <form className="auth-form" onSubmit={onVerify}>
              <label className="auth-label">OTP</label>
              <input className="auth-input" inputMode="numeric" pattern="[0-9]*" required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
              {error && <div className="auth-error">{error}</div>}
              <button className="auth-submit" type="submit" disabled={loading || !otp}>{loading ? 'Verifying...' : 'Verify & Create Account'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}


