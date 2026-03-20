import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(undefined) // undefined = loading
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)

  // Fetch (or create on first login) the advisor profile for the current user
  async function fetchProfile(userId, userMeta) {
    if (!userId) { setProfile(null); return }
    const { data } = await supabase
      .from('advisor_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
    } else {
      // First login after email confirmation — create profile from signup metadata
      const meta = userMeta ?? {}
      const { data: created } = await supabase
        .from('advisor_profiles')
        .insert({
          id:           userId,
          advisor_name: meta.advisor_name ?? '',
          firm_name:    meta.firm_name    ?? '',
        })
        .select('*')
        .single()
      setProfile(created ?? null)
    }
  }

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      fetchProfile(session?.user?.id, session?.user?.user_metadata)
      setLoading(false)
    })

    // Listen for auth changes (fires on email confirmation redirect too)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      fetchProfile(session?.user?.id, session?.user?.user_metadata)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    refreshProfile: () => fetchProfile(session?.user?.id, session?.user?.user_metadata),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
