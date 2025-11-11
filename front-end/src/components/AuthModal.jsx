import { useEffect, useMemo, useState } from 'react'
import './AuthModal.css'
import { useAuth } from '../AuthContext.jsx'

export default function AuthModal({ open, onClose }) {
  const { emailPasswordSignIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    try {
      const result = await signUp({ email, password, displayName })
      // If email confirmation is required, show message
      if (result.user && !result.session) {
        setError('Please check your email to confirm your account before signing in.')
        setTimeout(() => {
          setMode('signin')
        }, 3000)
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

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Please enter your details to sign in.</p>

        {mode === 'signin' && (
          <>
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
              <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
            </form>
            <div className="auth-footer">Already have an account? <button className="link" onClick={() => setMode('signin')}>Sign In</button></div>
          </>
        )}
      </div>
    </div>
  )
}


