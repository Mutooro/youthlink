import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function EmployerPublicPage() {
  const { slug } = useParams()
  const [employer, setEmployer] = useState(null)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    async function fetchEmployer() {
      const { data } = await supabase.from('employers').select('*').eq('id', slug).single()
      setEmployer(data)
      if (data) {
        const { data: listings } = await supabase.from('listings').select('*').eq('employer_id', data.id).eq('is_active', true)
        setJobs(listings || [])
      }
    }

    fetchEmployer()
  }, [slug])

  if (!employer) return <div className="page-loading">Loading employer page...</div>

  return (
    <div className="page-loading" style={{ alignItems: 'center' }}>
      <div style={{ maxWidth: 840, width: '100%', background: 'white', borderRadius: 20, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
        <h1>{employer.company_name}</h1>
        <p>{employer.description || 'A trusted employer on YouthLink Uganda.'}</p>
        <p><strong>Industry:</strong> {employer.industry || 'Not listed'}</p>
        <h2 style={{ marginTop: '1.5rem' }}>Open roles</h2>
        {jobs.length > 0 ? jobs.map(job => (
          <div key={job.id} style={{ padding: '1rem 0', borderTop: '1px solid #e7edf3' }}>
            <strong>{job.title}</strong>
            <div>{job.district} · {job.type}</div>
          </div>
        )) : <p>No active jobs right now.</p>}
        <Link to="/auth?mode=signup" className="btn btn-primary" style={{ marginTop: '1rem' }}>Join as a student</Link>
      </div>
    </div>
  )
}
