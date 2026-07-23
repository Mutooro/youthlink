// One-off script to create the admin user account.
// Run with: node scripts/create-admin.mjs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xumlgzgazkbfrqkfmyjc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bWxnemdhemtiZnJxa2ZteWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3ODk0NzksImV4cCI6MjEwMDM2NTQ3OX0.321f33s-7t8Z5E64AnelkmfH-dz7vhIC47dSggvxBig'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔧 Creating admin user...')

  // 1. Sign up the admin account
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@youthlink.com',
    password: 'admin@1234',
    options: {
      data: { full_name: 'YouthLink Admin', role: 'admin' }
    }
  })

  if (error) {
    console.error('❌ Signup error:', error.message)
    process.exit(1)
  }

  const userId = data.user?.id
  if (!userId) {
    console.error('❌ No user ID returned')
    process.exit(1)
  }

  console.log('✅ Auth user created:', userId)

  // 2. Create the profile row with role = 'admin'
  const { error: profileError } = await supabase.from('profiles').upsert({
    user_id: userId,
    full_name: 'YouthLink Admin',
    role: 'admin',
    onboarding_completed: true
  }, { onConflict: 'user_id' })

  if (profileError) {
    console.error('❌ Profile error:', profileError.message)
  } else {
    console.log('✅ Admin profile created')
  }

  console.log('\n🎉 Done! You can now sign in as admin@youthlink.com / admin@1234')
  console.log('   Navigate to /admin to access the admin dashboard.')
}

main()
