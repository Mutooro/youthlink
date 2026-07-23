import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function CreateAdmin() {
  const [status, setStatus] = useState('Click a button below.')
  const [done, setDone] = useState(false)

  async function handleCreate() {
    setStatus('Creating admin account...')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@youthlink.com',
        password: 'admin@1234',
        options: {
          data: { full_name: 'YouthLink Admin', role: 'admin' }
        }
      })

      if (error) {
        setStatus('❌ Signup error: ' + error.message)
        return
      }

      const userId = data.user?.id
      if (!userId) {
        setStatus('❌ No user ID returned from signup.')
        return
      }

      await ensureAdminProfile(userId)
    } catch (err) {
      setStatus('❌ Unexpected error: ' + err.message)
    }
  }

  async function handleFix() {
    setStatus('Fixing existing admin profile...')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@youthlink.com',
        password: 'admin@1234'
      })

      if (error) {
        setStatus('❌ Sign-in error: ' + error.message)
        return
      }

      await ensureAdminProfile(data.user.id)
      await supabase.auth.signOut()
    } catch (err) {
      setStatus('❌ Unexpected error: ' + err.message)
    }
  }

  async function ensureAdminProfile(userId) {
    // Check if a profile row already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin', onboarding_completed: true, full_name: 'YouthLink Admin' })
        .eq('id', existing.id)

      if (error) {
        setStatus('⚠️ Profile update failed: ' + error.message)
        return
      }
    } else {
      // Insert new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: 'YouthLink Admin',
          role: 'admin',
          onboarding_completed: true
        })

      if (error) {
        setStatus('⚠️ Profile insert failed: ' + error.message)
        return
      }
    }

    setStatus('🎉 Admin profile is ready! Sign in with admin@youthlink.com / admin@1234 and you will land on /admin.')
    setDone(true)
  }

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <h1 style={{ marginBottom: '1rem' }}>🛡️ Admin Account Setup</h1>
      <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
        Create or fix the admin account (<strong>admin@youthlink.com</strong> / <strong>admin@1234</strong>).
      </p>
      <div style={{ padding: '1rem', background: done ? '#f0fdf4' : '#f8fafc', borderRadius: 12, marginBottom: '1.5rem', border: done ? '1px solid #86efac' : '1px solid #e2e8f0' }}>
        {status}
      </div>
      {!done && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleCreate}
            style={{ padding: '0.75rem 2rem', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
          >
            Create New Admin
          </button>
          <button
            onClick={handleFix}
            style={{ padding: '0.75rem 2rem', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
          >
            Fix Existing Admin
          </button>
        </div>
      )}
    </div>
  )
}
