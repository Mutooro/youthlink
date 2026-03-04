import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
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
  const [applications, setApplications] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) { fetchApplications(); fetchMatches() }
    else setLoading(false)
  }, [profile])

  async function fetchApplications() {
    const { data } = await supabase
      .from('applications')
      .select('*, listings(title, type, district, employers(company_name))')
      .eq('profile_id', profile.id)
      .order('applied_at', { ascending: false })
    setApplications(data || [])
    setLoading(false)
  }

  async function fetchMatches() {
    if (!profile?.skills?.length) return
    const { data } = await supabase
      .from('listings')
      .select('*, employers(company_name)')
      .eq('is_active', true)
      .limit(4)
    setMatches(data || [])
  }

  const firstName = profile?.full_name?.split(' ')?.[0] || 'there'
  const profilePct = profile ? [profile.full_name, profile.district, profile.phone, profile.bio, profile.skills?.length, profile.availability, profile.cv_url].filter(Boolean).length / 7 * 100 : 0

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        {/* GREETING */}
        <div className="dash-greeting">
          <div>
            <h1>Welcome back, <span className="hl-green">{firstName}</span> 👋</h1>
            <p>Here's a summary of your activity on YouthLink.</p>
          </div>
          <Link to="/profile" className="btn btn-ghost">Edit profile →</Link>
        </div>

        {/* STATS ROW */}
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
          {/* APPLICATIONS */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h2>My applications</h2>
              <Link to="/jobs" className="btn btn-ghost btn-sm">Browse more →</Link>
            </div>

            {loading ? (
              <div className="dash-loading">Loading...</div>
            ) : applications.length > 0 ? (
              <div className="app-list">
                {applications.map(app => {
                  const listing = app.listings || {}
                  const employer = listing.employers || {}
                  const daysAgo = Math.floor((Date.now() - new Date(app.applied_at)) / 86400000)
                  return (
                    <div key={app.id} className="app-item">
                      <div className="app-logo">
                        {employer.company_name?.[0] || '?'}
                      </div>
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
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <p>No applications yet.</p>
                <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ marginTop: '0.7rem' }}>Browse jobs →</Link>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* PROFILE COMPLETENESS */}
            <div className="dash-panel" style={{ marginBottom: '1.2rem' }}>
              <h2>Profile strength</h2>
              <div className="profile-strength-bar">
                <div className="profile-strength-fill" style={{ width: `${profilePct}%` }} />
              </div>
              <p className="profile-strength-label">{Math.round(profilePct)}% complete</p>
              {profilePct < 100 && (
                <Link to="/profile" className="btn btn-ghost btn-sm" style={{ marginTop: '0.8rem' }}>
                  Complete profile →
                </Link>
              )}
              {!profile?.cv_url && (
                <div className="cv-nudge">
                  <span>📄</span>
                  <div>
                    <strong>Upload your CV</strong>
                    <p>Get matched with relevant opportunities automatically.</p>
                  </div>
                  <Link to="/profile" className="btn btn-primary btn-sm">Upload →</Link>
                </div>
              )}
            </div>

            {/* SUGGESTED MATCHES */}
            <div className="dash-panel">
              <div className="dash-panel-header">
                <h2>Suggested for you</h2>
              </div>
              {matches.length > 0 ? (
                <div className="match-list">
                  {matches.map(job => (
                    <Link key={job.id} to={`/jobs/${job.id}`} className="match-item">
                      <div className="match-logo">{job.employers?.company_name?.[0] || '?'}</div>
                      <div className="match-info">
                        <strong>{job.title}</strong>
                        <span>{job.employers?.company_name} · {job.district || 'Uganda'}</span>
                      </div>
                      <span className={`badge ${job.type === 'internship' ? 'badge-green' : 'badge-grey'}`}>{job.type}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="dash-empty">
                  <p>Complete your profile to get matched with jobs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
