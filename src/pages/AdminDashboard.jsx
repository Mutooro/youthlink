import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Building2, CheckCircle2, FileText, Check, AlertCircle } from 'lucide-react'
import './Dashboard.css' // Reuse dashboard styles

export default function AdminDashboard() {
  const [tab, setTab] = useState('employers')
  const [employers, setEmployers] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchPendingData()
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function fetchPendingData() {
    setLoading(true)
    const { data: emps } = await supabase
      .from('employers')
      .select('*')
      .eq('is_verified', false)
      .order('created_at', { ascending: false })

    const { data: jobs } = await supabase
      .from('listings')
      .select('*, employers(company_name)')
      .eq('is_active', false)
      .order('created_at', { ascending: false })

    setEmployers(emps || [])
    setListings(jobs || [])
    setLoading(false)
  }

  async function handleVerifyEmployer(id) {
    const { error } = await supabase
      .from('employers')
      .update({ is_verified: true })
      .eq('id', id)

    if (!error) {
      setEmployers(emps => emps.filter(e => e.id !== id))
      showToast('Employer verified successfully.')
    } else {
      showToast('Error verifying employer: ' + error.message, 'error')
    }
  }

  async function handleApproveListing(id) {
    const { error } = await supabase
      .from('listings')
      .update({ is_active: true })
      .eq('id', id)

    if (!error) {
      setListings(jobs => jobs.filter(j => j.id !== id))
      showToast('Listing approved and published.')
    } else {
      showToast('Error approving listing: ' + error.message, 'error')
    }
  }

  if (loading) return <div className="page-loading">Loading admin queue...</div>

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner" style={{ maxWidth: '1000px' }}>
        <div className="dash-greeting">
          <div>
            <h1>Admin Dashboard 🛡️</h1>
            <p>Review and moderate new employers and job listings.</p>
          </div>
        </div>

        <div className="auth-tabs" style={{ marginBottom: '2rem', justifyContent: 'flex-start', borderBottom: '1px solid #e7edf3' }}>
          <button 
            className={`auth-tab ${tab === 'employers' ? 'active' : ''}`} 
            onClick={() => setTab('employers')}
            style={{ width: 'auto', padding: '0 2rem' }}
          >
            Pending Employers ({employers.length})
          </button>
          <button 
            className={`auth-tab ${tab === 'listings' ? 'active' : ''}`} 
            onClick={() => setTab('listings')}
            style={{ width: 'auto', padding: '0 2rem' }}
          >
            Pending Listings ({listings.length})
          </button>
        </div>

        {tab === 'employers' && (
          <div className="dash-panel">
            <h2>Unverified Employers</h2>
            {employers.length > 0 ? (
              <div className="app-list">
                {employers.map(emp => (
                  <div key={emp.id} className="app-item" style={{ alignItems: 'center' }}>
                    <div className="app-logo"><Building2 size={20} color="#fff" /></div>
                    <div className="app-info">
                      <strong>{emp.company_name}</strong>
                      <span>{emp.industry || 'No industry'} · {emp.size || 'Size unknown'}</span>
                    </div>
                    <div className="app-right">
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleVerifyEmployer(emp.id)}
                      >
                        <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Verify Employer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <p>No pending employers to review.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'listings' && (
          <div className="dash-panel">
            <h2>Pending Job Listings</h2>
            {listings.length > 0 ? (
              <div className="app-list">
                {listings.map(job => (
                  <div key={job.id} className="app-item" style={{ alignItems: 'center' }}>
                    <div className="app-logo"><FileText size={20} color="#fff" /></div>
                    <div className="app-info">
                      <strong>{job.title}</strong>
                      <span>{job.employers?.company_name} · {job.type}</span>
                    </div>
                    <div className="app-right">
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleApproveListing(job.id)}
                      >
                        <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Approve Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <p>No pending listings to review.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  )
}
