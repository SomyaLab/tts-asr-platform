import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [authMessage, setAuthMessage] = useState(null)

  // Handle email confirmation and OAuth callbacks from URL hash
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return

    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const error = hashParams.get('error')
      const errorCode = hashParams.get('error_code')
      const errorDescription = hashParams.get('error_description')
      const type = hashParams.get('type')

      // Check if this is an auth callback (email confirmation or OAuth)
      if (type === 'recovery' || type === 'signup' || type === 'oauth' || accessToken || error) {
        if (error || errorCode) {
          // Handle error cases
          let errorMessage = errorDescription || 'An authentication error occurred.'
          
          if (error === 'requested path is invalid') {
            errorMessage = 'Invalid redirect URL. Please check your Supabase configuration.'
          } else if (errorCode === 'otp_expired' || 
                     (error === 'access_denied' && errorDescription?.includes('expired'))) {
            errorMessage = 'This confirmation link has expired. Please request a new confirmation email.'
          } else if (error === 'access_denied') {
            errorMessage = errorDescription || 'Access denied. This link is invalid or has expired.'
          }
          
          setAuthError(errorMessage)
          
          // Clear URL hash after processing error
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          return
        }

        if (accessToken && refreshToken) {
          // Exchange tokens for session
          try {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })

            if (sessionError) {
              setAuthError('Failed to complete authentication. Please try again.')
              window.history.replaceState(null, '', window.location.pathname + window.location.search)
              return
            }

            if (data?.session?.user) {
              if (type === 'oauth') {
                setAuthMessage('Successfully signed in with Google!')
              } else {
                setAuthMessage('Email confirmed successfully! You are now signed in.')
              }
              // Clear URL hash after successful confirmation
              window.history.replaceState(null, '', window.location.pathname + window.location.search)
              
              // Clear message after 5 seconds
              setTimeout(() => {
                setAuthMessage(null)
              }, 5000)
            }
          } catch (err) {
            setAuthError('Failed to complete authentication. Please try again.')
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }
        }
      }
    }

    handleAuthCallback()
  }, [])

  // Initialize session and listen for auth changes
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          phone: session.user.user_metadata?.phone || null,
          provider: session.user.app_metadata?.provider || 'email',
          avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
          createdAt: session.user.created_at
        })
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          phone: session.user.user_metadata?.phone || null,
          provider: session.user.app_metadata?.provider || 'email',
          avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
          createdAt: session.user.created_at
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    try {
      if (user) localStorage.setItem('auth.user', JSON.stringify(user))
      else localStorage.removeItem('auth.user')
    } catch {}
  }, [user])

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) throw new Error('Supabase is not configured')
    
    // Use the current origin without trailing slash for redirect
    const redirectTo = `${window.location.origin}${window.location.pathname}`
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      // Provide more helpful error messages
      if (error.message?.includes('requested path is invalid')) {
        throw new Error('Invalid redirect URL. Please configure the redirect URL in your Supabase dashboard under Authentication > URL Configuration.')
      }
      throw error
    }
    
    // Note: User will be set via onAuthStateChange after OAuth redirect
    // The redirect happens automatically, so we don't need to do anything else here
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
    setUser({ 
      name: profileName, 
      email, 
      provider: 'password', 
      id: data.user?.id,
      createdAt: data.user?.created_at
    })
  }

  // Sign up with email and password
  const signUp = async ({ email, password, displayName }) => {
    if (!email || !password || !displayName) throw new Error('Missing fields')
    if (!isSupabaseConfigured()) throw new Error('Supabase is not configured')
    
    // Get the current origin for redirect URL
    const redirectTo = `${window.location.origin}/`
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: displayName
        },
        emailRedirectTo: redirectTo
      }
    })
    if (error) throw error
    // Set user immediately if email confirmation is disabled, otherwise wait for confirmation
    if (data.user) {
      setUser({ 
        name: displayName, 
        email: data.user.email, 
        provider: 'password', 
        id: data.user.id,
        createdAt: data.user.created_at
      })
    }
    return data
  }

  // Resend confirmation email
  const resendConfirmationEmail = async (email) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase is not configured')
    const redirectTo = `${window.location.origin}/`
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    authError,
    authMessage,
    signInWithGoogle,
    signInWithApple,
    emailPasswordSignIn,
    signUp,
    signOut,
    resendConfirmationEmail,
    clearAuthError: () => setAuthError(null),
    clearAuthMessage: () => setAuthMessage(null)
  }), [user, authError, authMessage])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


