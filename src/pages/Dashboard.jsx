import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useMatches } from '../hooks/useMatches'
import './Dashboard.css'

const STATUS_COLORS = {
  submitted: 'badge-grey',
  viewed: 'badge-blue',
  shortlisted: 'badge-yellow',
  accepted: 'badge-green',
  rejected: 'badge-grey',
}
const STATUS_ICONS = {
  submitted: '📤', viewed: '👁', shortlisted: '⭐',
  accepted: '✅', rejected: '✗',
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [applications, setApplications] = useState([]) // For students
  const [myListings, setMyListings] = useState([])     // For employers
  const { matches, loading: matchesLoading } = useMatches(profile)
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false) // New: for first-time employers

  const isEmployer = profile?.role === 'employer'

  useEffect(() => {
    if (profile) {
      if (isEmployer) {
        fetchEmployerData()
      } else {
        fetchStudentData()
      }
    } else {
      setLoading(false)
    }
  }, [profile])

  async function fetchStudentData() {
    // 1. Fetch applications
    const { data: apps } = await supabase
      .from('applications')
      .select('*, listings(title, type, district, employers(company_name))')
      .eq('profile_id', profile.id)
      .order('applied_at', { ascending: false })
    setApplications(apps || [])
    setLoading(false)
  }

  async function fetchEmployerData() {
    const { data: employerRecord, error } = await supabase
      .from('employers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (error || !employerRecord) {
      setShowSetup(true)
      setLoading(false)
      return
    }

    const { data: listings } = await supabase
      .from('listings')
      .select('*, applications(count)')
      .eq('employer_id', employerRecord.id)
      .order('created_at', { ascending: false })

    setMyListings(listings || [])
    setLoading(false)
  }

  const firstName = profile?.full_name?.split(' ')?.[0] || 'there'

  if (loading) return <div className="page-loading">Loading dashboard...</div>

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        <div className="dash-greeting">
          <div>
            <h1>Welcome back, <span className="hl-green">{firstName}</span> 👋</h1>
            <p>
              {showSetup
                ? "Let's get your company set up on YouthLink."
                : `Here's what's happening with your ${isEmployer ? 'recruitment' : 'activity'} on YouthLink.`
              }
            </p>
          </div>
          {!showSetup && (
            <div className="dash-actions">
              {isEmployer && <Link to="/post-job" className="btn btn-primary">Post a job +</Link>}
              <Link to="/profile" className="btn btn-ghost">Edit profile →</Link>
            </div>
          )}
        </div>

        {isEmployer ? (
          showSetup ? <EmployerSetup user={user} onComplete={() => { setShowSetup(false); fetchEmployerData() }} />
            : <EmployerDashboard myListings={myListings} />
        ) : (
          <StudentDashboard applications={applications} matches={matches} profile={profile} />
        )}
      </div>
    </div>
  )
}

function EmployerSetup({ user, onComplete }) {
  const [name, setName] = useState('')
  const [web, setWeb] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSetup(e) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase
      .from('employers')
      .insert({
        user_id: user.id,
        company_name: name,
        website: web
      })
    if (!error) onComplete()
    else alert('Error creating company profile')
    setBusy(false)
  }

  return (
    <div className="dash-panel setup-panel">
      <h2>Complete your Employer Profile</h2>
      <p>Before you can post jobs, we need a few details about your organization.</p>
      <form onSubmit={handleSetup} style={{ marginTop: '1.5rem', maxWidth: '400px' }}>
        <div className="input-wrap">
          <label className="input-label">Company Name</label>
          <input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Corp Uganda" />
        </div>
        <div className="input-wrap">
          <label className="input-label">Website (Optional)</label>
          <input className="input" value={web} onChange={e => setWeb(e.target.value)} placeholder="https://example.com" />
        </div>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Setting up...' : 'Create Company Profile'}
        </button>
      </form>
    </div>
  )
}

function StudentDashboard({ applications, matches, profile }) {
  const profilePct = profile ? [profile.full_name, profile.district, profile.phone, profile.bio, profile.skills?.length, profile.availability, profile.cv_url].filter(Boolean).length / 7 * 100 : 0

  return (
    <>
      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-icon">📤</div>
          <div className="dash-stat-val">{applications.length}</div>
          <div className="dash-stat-label">Applications sent</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">⭐</div>
          <div className="dash-stat-val">{applications.filter(a => a.status === 'shortlisted').length}</div>
          <div className="dash-stat-label">Shortlisted</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">✅</div>
          <div className="dash-stat-val">{applications.filter(a => a.status === 'accepted').length}</div>
          <div className="dash-stat-label">Offers received</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">🎯</div>
          <div className="dash-stat-val">{matches.length}</div>
          <div className="dash-stat-label">New matches</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2>My applications</h2>
            <Link to="/jobs" className="btn btn-ghost btn-sm">Browse more →</Link>
          </div>
          {applications.length > 0 ? (
            <div className="app-list">
              {applications.map(app => {
                const listing = app.listings || {}
                const employer = listing.employers || {}
                const daysAgo = Math.floor((Date.now() - new Date(app.applied_at)) / 86400000)
                return (
                  <div key={app.id} className="app-item">
                    <div className="app-logo">{employer.company_name?.[0] || '?'}</div>
                    <div className="app-info">
                      <strong>{listing.title || 'Untitled'}</strong>
                      <span>{employer.company_name} {listing.district ? `· ${listing.district}` : ''}</span>
                    </div>
                    <div className="app-right">
                      <span className={`badge ${STATUS_COLORS[app.status]}`}>
                        {STATUS_ICONS[app.status]} {app.status}
                      </span>
                      <span className="app-date">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="dash-empty">
              <p>No applications yet.</p>
              <Link to="/jobs" className="btn btn-ghost btn-sm">Browse jobs →</Link>
            </div>
          )}
        </div>

        <div>
          <div className="dash-panel" style={{ marginBottom: '1.2rem' }}>
            <h2>Profile strength</h2>
            <div className="profile-strength-bar">
              <div className="profile-strength-fill" style={{ width: `${profilePct}%` }} />
            </div>
            <p className="profile-strength-label">{Math.round(profilePct)}% complete</p>
          </div>

          <div className="dash-panel">
            <h2>Suggested for you</h2>
            {matches.length > 0 ? (
              <div className="match-list">
                {matches.map(job => {
                  // simple pct calculation: score of 10+ is high match
                  const matchPct = Math.min(Math.round((job.matchScore / 12) * 100), 99)

                  return (
                    <Link key={job.id} to={`/jobs/${job.id}`} className="match-item">
                      <div className="match-logo">{job.employers?.company_name?.[0] || '?'}</div>
                      <div className="match-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>{job.title}</strong>
                          {job.matchScore > 0 && <span className="match-pct">{matchPct}% match</span>}
                        </div>
                        <span>{job.employers?.company_name}</span>
                      </div>
                      <span className={`badge ${job.type === 'internship' ? 'badge-green' : 'badge-grey'}`}>{job.type}</span>
                    </Link>
                  )
                })}
              </div>
            ) : <p className="dash-empty">Complete profile for matches.</p>}
          </div>
        </div>
      </div>
    </>
  )
}

function EmployerDashboard({ myListings }) {
  const totalApps = myListings.reduce((acc, curr) => acc + (curr.applications?.[0]?.count || 0), 0)

  return (
    <>
      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-icon">📋</div>
          <div className="dash-stat-val">{myListings.length}</div>
          <div className="dash-stat-label">Active listings</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">👥</div>
          <div className="dash-stat-val">{totalApps}</div>
          <div className="dash-stat-label">Total applicants</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">📈</div>
          <div className="dash-stat-val">{Math.round(totalApps / (myListings.length || 1))}</div>
          <div className="dash-stat-label">Avg apps per job</div>
        </div>
      </div>

      <div className="dash-panel">
        <div className="dash-panel-header">
          <h2>My Job Postings</h2>
          <Link to="/post-job" className="btn btn-primary btn-sm">New Posting</Link>
        </div>

        {myListings.length > 0 ? (
          <div className="employer-job-list">
            {myListings.map(job => (
              <div key={job.id} className="app-item">
                <div className="app-info">
                  <strong>{job.title}</strong>
                  <span>{job.district} · {job.type}</span>
                </div>
                <div className="app-right">
                  <div className="app-stat">
                    <strong>{job.applications?.[0]?.count || 0}</strong>
                    <span>Applicants</span>
                  </div>
                  <Link to={`/manage-job/${job.id}`} className="btn btn-ghost btn-sm">Manage</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dash-empty">
            <p>You haven't posted any jobs yet.</p>
            <Link to="/post-job" className="btn btn-primary btn-sm">Create your first post</Link>
          </div>
        )}
      </div>
    </>
  )
}

