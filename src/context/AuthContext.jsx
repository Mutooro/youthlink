import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function ensureUserRecords(userId, fullName, role) {
    const profilePayload = {
      user_id: userId,
      full_name: fullName,
      role,
      onboarding_completed: role === 'employer' || role === 'admin'
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingProfile?.id) {
      await supabase.from('profiles').update(profilePayload).eq('id', existingProfile.id)
    } else {
      await supabase.from('profiles').insert(profilePayload)
    }

    if (role === 'employer') {
      const { data: existingEmployer } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      const employerPayload = { user_id: userId, company_name: `${fullName}'s company` }
      if (existingEmployer?.id) {
        await supabase.from('employers').update(employerPayload).eq('id', existingEmployer.id)
      } else {
        await supabase.from('employers').insert(employerPayload)
      }
    }
  }

  async function signUp(email, password, fullName, role) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth?mode=signin`
      }
    })

    if (!error && data?.user) {
      await ensureUserRecords(data.user.id, fullName, role)
    }

    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
