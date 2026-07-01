import { supabase } from './supabase'

// Register a new user
export async function signUp(email, password, fullName, role) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } }
  })

  if (!error && data?.user) {
    await supabase.from('profiles').upsert({ user_id: data.user.id, full_name: fullName, role }, { onConflict: 'user_id' })
    if (role === 'employer') {
      await supabase.from('employers').upsert({ user_id: data.user.id, company_name: `${fullName}'s company` }, { onConflict: 'user_id' })
    }
  }

  return { data, error }
}

// Login
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

// Logout
export async function signOut() {
  await supabase.auth.signOut()
}

// Get current user
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}