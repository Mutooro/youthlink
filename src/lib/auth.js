import { supabase } from './supabase'

// Register a new user
export async function signUp(email, password, fullName, role) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } }
  })

  if (!error && data?.user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (existingProfile?.id) {
      await supabase.from('profiles').update({ user_id: data.user.id, full_name: fullName, role }).eq('id', existingProfile.id)
    } else {
      await supabase.from('profiles').insert({ user_id: data.user.id, full_name: fullName, role })
    }

    if (role === 'employer') {
      const { data: existingEmployer } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (existingEmployer?.id) {
        await supabase.from('employers').update({ user_id: data.user.id, company_name: `${fullName}'s company` }).eq('id', existingEmployer.id)
      } else {
        await supabase.from('employers').insert({ user_id: data.user.id, company_name: `${fullName}'s company` })
      }
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