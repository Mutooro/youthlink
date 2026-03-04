import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './JobDetail.css'

export default function JobDetail() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApply, setShowApply] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchJob()
    if (user && profile) checkApplied()
  }, [id, user])

  async function fetchJob() {
    const { data } = await supabase
      .from('listings')
      .select('*, employers(company_name, logo_url, industry, website, description)')
      .eq('id', id)
      .single()
    setJob(data)
    setLoading(false)
  }

  async function checkApplied() {
    const { data } = await supabase
      .from('applications')
      .select('id')
      .eq('listing_id', id)
      .eq('profile_id', profile?.id)
      .single()
    if (data) setApplied(true)
  }

  async function handleApply() {
    if (!user) { navigate('/auth?mode=signup'); return }
    if (!profile) { navigate('/profile'); return }
    setApplying(true)
    const { error } = await supabase.from('applications').insert({
      listing_id: id,
      profile_id: profile.id,
      cover_note: coverLetter,
    })
    setApplying(false)
    if (!error) {
      setApplied(true)
      setShowApply(false)
      showToast('✅ Application submitted!')
    } else {
      showToast('❌ Error submitting. Try again.', 'error')
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  if (loading) return <div className="page-loading"><div className="spinner" /></div>
  if (!job) return <div className="not-found">Job not found. <Link to="/jobs">Browse all jobs →</Link></div>

  const employer = job.employers || {}

  return (
    <div className="job-detail-page">
      <div className="job-detail-inner">
        {/* BACK */}
        <Link to="/jobs" className="back-link">← Back to listings</Link>

        <div className="job-detail-layout">
          {/* MAIN */}
          <article className="job-main">
            <div className="job-detail-header">
              <div className="jd-company-logo">
                {employer.company_name?.[0] || '?'}
              </div>
              <div>
                <h1 className="jd-title">{job.title}</h1>
                <p className="jd-company">{employer.company_name}</p>
              </div>
            </div>

            <div className="jd-meta-row">
              {job.type && <span className="badge badge-green">{job.type}</span>}
              {job.district && <span className="badge badge-grey">📍 {job.district}</span>}
              {job.duration && <span className="badge badge-grey">⏱ {job.duration}</span>}
              {job.category && <span className="badge badge-blue">{job.category}</span>}
            </div>

            {job.salary_min && (
              <div className="jd-salary">
                💰 UGX {job.salary_min.toLocaleString()}
                {job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : '+'}
                <span>/month</span>
              </div>
            )}

            <div className="divider" />

            <h2 className="jd-section-title">About this role</h2>
            <div className="jd-description">
              {job.description || 'No description provided.'}
            </div>

            {job.skills_required?.length > 0 && (
              <>
                <h2 className="jd-section-title">Skills required</h2>
                <div className="skill-tags">
                  {job.skills_required.map(s => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                </div>
              </>
            )}

            {job.deadline && (
              <div className="jd-deadline">
                🗓 Application deadline: <strong>{new Date(job.deadline).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </div>
            )}

            {/* APPLY FORM */}
            {showApply && (
              <div className="apply-form">
                <h3>Apply for this position</h3>
                <div className="input-wrap">
                  <label className="input-label">Cover letter (optional)</label>
                  <textarea
                    className="input"
                    rows={5}
                    placeholder="Tell the employer why you're a great fit..."
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                  />
                </div>
                <div className="apply-form-actions">
                  <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                    {applying ? 'Submitting...' : 'Submit application'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowApply(false)}>Cancel</button>
                </div>
              </div>
            )}
          </article>

          {/* SIDEBAR */}
          <aside className="job-sidebar">
            <div className="apply-card">
              {applied ? (
                <div className="applied-state">
                  <div className="applied-icon">✓</div>
                  <h3>Applied!</h3>
                  <p>Track your application in your <Link to="/dashboard">dashboard</Link>.</p>
                </div>
              ) : (
                <>
                  <h3>Interested?</h3>
                  <p>Apply now and hear back from {employer.company_name || 'the employer'} directly.</p>
                  {!showApply ? (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                      onClick={() => user ? setShowApply(true) : navigate('/auth?mode=signup')}
                    >
                      {user ? 'Apply now →' : 'Sign up to apply →'}
                    </button>
                  ) : null}
                </>
              )}
            </div>

            <div className="employer-card">
              <h3>About {employer.company_name}</h3>
              {employer.industry && <p className="employer-industry">{employer.industry}</p>}
              {employer.description && <p className="employer-desc">{employer.description}</p>}
              {employer.website && (
                <a href={employer.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  Visit website ↗
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  )
}
