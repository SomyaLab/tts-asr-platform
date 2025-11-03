import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth.user')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (user) localStorage.setItem('auth.user', JSON.stringify(user))
      else localStorage.removeItem('auth.user')
    } catch {}
  }, [user])

  const signInWithGoogle = async () => {
    // Mocked sign-in; integrate real OAuth later
    const name = 'Google User'
    setUser({ name, provider: 'google' })
  }

  const signInWithApple = async () => {
    const name = 'Apple User'
    setUser({ name, provider: 'apple' })
  }

  // Email/password sign in (Supabase)
  const emailPasswordSignIn = async (email, password) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase is not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const profileName = email.split('@')[0]
    setUser({ name: profileName, email, provider: 'password', id: data.user?.id })
  }

  // Start sign up: send OTP to email and temporarily store password/displayName in session only
  const signUpStart = async ({ email, password, displayName }) => {
    if (!email || !password || !displayName) throw new Error('Missing fields')
    if (!isSupabaseConfigured()) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: window.location.origin } })
    if (error) throw error
    sessionStorage.setItem('otp.pending', JSON.stringify({ email, password, displayName }))
  }

  // Complete sign-up: verify OTP token then set password and profile name
  const verifyOtpAndCreateUser = async ({ email, otp }) => {
    const raw = sessionStorage.getItem('otp.pending')
    if (!raw) throw new Error('No pending verification')
    const pending = JSON.parse(raw)
    if (pending.email !== email) throw new Error('Email mismatch')
    // verify OTP
    if (!isSupabaseConfigured()) throw new Error('Supabase is not configured')
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    if (error) throw error
    // Now set password by updating user
    const { error: updateError } = await supabase.auth.updateUser({ password: pending.password, data: { name: pending.displayName } })
    if (updateError) throw updateError
    const userEmail = email
    setUser({ name: pending.displayName, email: userEmail, provider: 'password', id: data.user?.id })
    sessionStorage.removeItem('otp.pending')
  }

  const signOut = () => setUser(null)

  const value = useMemo(() => ({
    user,
    signInWithGoogle,
    signInWithApple,
    emailPasswordSignIn,
    signUpStart,
    verifyOtpAndCreateUser,
    signOut
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


