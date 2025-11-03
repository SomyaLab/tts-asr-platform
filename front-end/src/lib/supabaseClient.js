import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && anonKey) ? createClient(url, anonKey) : null

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn('[Auth] Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your front-end/.env')
}

export function isSupabaseConfigured() {
  return Boolean(url && anonKey)
}


