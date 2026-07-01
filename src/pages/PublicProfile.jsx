import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PublicProfile() {
  const { slug } = useParams()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', slug)
        .single()
      setProfile(data)
    }

    fetchProfile()
  }, [slug])

  if (!profile) return <div className="page-loading">Loading profile...</div>

  return (
    <div className="page-loading" style={{ alignItems: 'center' }}>
      <div style={{ maxWidth: 720, width: '100%', background: 'white', borderRadius: 20, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
        <h1>{profile.full_name}</h1>
        <p>{profile.headline || 'Student seeking opportunities in Uganda.'}</p>
        <p><strong>District:</strong> {profile.district || 'Not shared'}</p>
        <p><strong>Skills:</strong> {profile.skills?.join(', ') || 'No skills listed yet.'}</p>
        <Link to="/auth?mode=signup" className="btn btn-primary" style={{ marginTop: '1rem' }}>Join YouthLink</Link>
      </div>
    </div>
  )
}
