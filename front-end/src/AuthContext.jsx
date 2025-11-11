import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // Initialize session and listen for auth changes
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          phone: session.user.user_metadata?.phone || null,
          provider: session.user.app_metadata?.provider || 'email',
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
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          phone: session.user.user_metadata?.phone || null,
          provider: session.user.app_metadata?.provider || 'email',
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: displayName
        }
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

  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    signInWithGoogle,
    signInWithApple,
    emailPasswordSignIn,
    signUp,
    signOut
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


