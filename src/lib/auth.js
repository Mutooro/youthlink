import { supabase } from './supabase'

// Register a new user
export async function signUp(email, password, fullName, role) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, role } }
  })
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