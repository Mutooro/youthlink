import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    Calendar,
    MapPin,
    Users,
    Building2,
    CheckCircle2,
    ArrowLeft,
    Clock,
    Tag
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Programs.css'

export default function ProgramDetail() {
    const { id } = useParams()
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [program, setProgram] = useState(null)
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [enrolled, setEnrolled] = useState(false)

    useEffect(() => {
        fetchProgram()
        if (user) checkEnrollment()
    }, [id, user])

    async function fetchProgram() {
        setLoading(true)
        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .eq('id', id)
            .single()

        if (!error && data) {
            setProgram(data)
        }
        setLoading(false)
    }

    async function checkEnrollment() {
        const { data } = await supabase
            .from('program_enrollments')
            .select('*')
            .eq('program_id', id)
            .eq('profile_id', profile?.id)
            .single()
        if (data) setEnrolled(true)
    }

    async function handleApply() {
        if (!user) {
            navigate('/auth?mode=signup')
            return
        }

        setEnrolling(true)
        const { error } = await supabase
            .from('program_enrollments')
            .insert({
                program_id: id,
                profile_id: profile.id,
                status: 'applied'
            })

        if (!error) {
            setEnrolled(true)
        } else {
            alert('Application failed: ' + error.message)
        }
        setEnrolling(false)
    }

    if (loading) return <div className="page-loading">Loading program details...</div>
    if (!program) return (
        <div className="not-found">
            <h2>Program not found</h2>
            <Link to="/programs" className="btn btn-primary">Back to Programs</Link>
        </div>
    )

    return (
        <div className="program-detail-page">
            <div className="detail-header">
                <div className="container">
                    <Link to="/programs" className="back-link"><ArrowLeft size={18} /> All Programs</Link>
                    <div className="header-content">
                        <div className="badge-row">
                            <span className="type-badge">{program.program_type || program.type}</span>
                            <span className="cost-badge">{program.cost === 0 ? 'Free' : `UGX ${program.cost.toLocaleString()}`}</span>
                        </div>
                        <h1>{program.title}</h1>
                        <p className="organizer">Organized by <strong>{program.organizer}</strong></p>
                    </div>
                </div>
            </div>

            <div className="container detail-grid">
                <div className="detail-main">
                    <section>
                        <h2>About the Program</h2>
                        <p>{program.description}</p>
                    </section>

                    {program.requirements && (
                        <section>
                            <h2>Requirements</h2>
                            <ul className="requirements-list">
                                {program.requirements.split(',').map((req, i) => (
                                    <li key={i}><CheckCircle2 size={16} /> {req.trim()}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <div className="detail-side">
                    <div className="info-card">
                        <h3>Key Information</h3>
                        <div className="info-item">
                            <Calendar className="info-icon" size={20} />
                            <div>
                                <span>Start Date</span>
                                <strong>{program.start_date ? new Date(program.start_date).toLocaleDateString() : 'To be announced'}</strong>
                            </div>
                        </div>
                        <div className="info-item">
                            <MapPin className="info-icon" size={20} />
                            <div>
                                <span>Location</span>
                                <strong>{program.district}</strong>
                            </div>
                        </div>
                        <div className="info-item">
                            <Users className="info-icon" size={20} />
                            <div>
                                <span>Seats Available</span>
                                <strong>{program.seats || 'Unlimited'}</strong>
                            </div>
                        </div>

                        {enrolled ? (
                            <div className="enrolled-msg">
                                <CheckCircle2 size={24} />
                                <div>
                                    <strong>Application Submitted</strong>
                                    <p>We'll notify you via email when the organizer reviews your application.</p>
                                </div>
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary btn-lg apply-btn"
                                onClick={handleApply}
                                disabled={enrolling}
                            >
                                {enrolling ? 'Processing...' : (user ? 'Apply Now' : 'Sign in to Apply')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
