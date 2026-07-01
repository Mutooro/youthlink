import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Dashboard.css' // Reuse dashboard styles for panels/badges

export default function ManageJob() {
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [applicants, setApplicants] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchJobAndApplicants()
    }, [id])

    async function fetchJobAndApplicants() {
        // 1. Fetch Job Info
        const { data: jobData } = await supabase
            .from('listings')
            .select('*')
            .eq('id', id)
            .single()
        setJob(jobData)

        // 2. Fetch Applicants with their Profiles
        const { data: apps } = await supabase
            .from('applications')
            .select('*, profiles(*)')
            .eq('listing_id', id)
            .order('applied_at', { ascending: false })

        setApplicants(apps || [])
        setLoading(false)
    }

    async function updateStatus(appId, newStatus) {
        const { error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', appId)

        if (!error) {
            setApplicants(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus } : a))
        }
    }

    if (loading) return <div className="page-loading">Loading applicants...</div>
    if (!job) return <div className="not-found">Job listing not found.</div>

    return (
        <div className="dashboard-page">
            <div className="dashboard-inner" style={{ maxWidth: '1000px' }}>
                <div className="dash-greeting">
                    <div>
                        <Link to="/dashboard" className="back-link" style={{ marginBottom: '1rem', display: 'block' }}>← Back to Dashboard</Link>
                        <h1>Manage: <span style={{ color: '#059669' }}>{job.title}</span></h1>
                        <p>{applicants.length} total applicants for this position.</p>
                    </div>
                </div>

                <div className="dash-panel">
                    <div className="dash-panel-header">
                        <h2>Applicants</h2>
                    </div>

                    {applicants.length > 0 ? (
                        <div className="app-list">
                            {applicants.map(app => {
                                const p = app.profiles || {}
                                return (
                                    <div key={app.id} className="app-item" style={{ padding: '1.5rem' }}>
                                        <div className="app-info">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="app-logo" style={{ borderRadius: '50%' }}>
                                                    {p.full_name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: '1.1rem' }}>{p.full_name}</strong>
                                                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                        {p.district} · {p.phone}
                                                    </div>
                                                </div>
                                            </div>

                                            {app.cover_letter && (
                                                <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                                                    <strong>Cover Letter:</strong> {app.cover_letter}
                                                </div>
                                            )}

                                            <div className="skill-tags" style={{ marginTop: '0.8rem' }}>
                                                {(p.skills || []).map(s => <span key={s} className="skill-chip" style={{ fontSize: '0.75rem' }}>{s}</span>)}
                                            </div>
                                        </div>

                                        <div className="app-right" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <select
                                                    className="input input-sm"
                                                    value={app.status}
                                                    onChange={(e) => updateStatus(app.id, e.target.value)}
                                                    style={{ width: 'auto', height: '36px', padding: '0 0.5rem' }}
                                                >
                                                    <option value="submitted">Submitted</option>
                                                    <option value="shortlisted">Shortlisted</option>
                                                    <option value="accepted">Accepted</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>

                                                {p.cv_url && (
                                                    <a
                                                        href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/cvs/${p.cv_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-ghost btn-sm"
                                                    >
                                                        View CV 📄
                                                    </a>
                                                )}
                                            </div>
                                            <span className="app-date">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="dash-empty">
                            <p>No one has applied for this position yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
