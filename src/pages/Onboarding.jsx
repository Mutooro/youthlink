import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    User,
    MapPin,
    Briefcase,
    CheckCircle2,
    ArrowRight,
    ChevronLeft,
    Sparkles,
    Smartphone,
    Rocket
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { UGANDA_DISTRICTS } from '../data/uganda_districts'
import './Onboarding.css'

const LOOKING_FOR_OPTIONS = [
    { id: 'internship', label: 'Internship' },
    { id: 'fulltime', label: 'Full-time' },
    { id: 'contract', label: 'Contract' },
    { id: 'parttime', label: 'Part-time' },
    { id: 'program', label: 'Empowerment Programs' }
]

export default function Onboarding() {
    const { user, profile, fetchProfile } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        district: '',
        bio: '',
        skills: '',
        looking_for: [],
    })

    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                district: profile.district || '',
                bio: profile.bio || '',
                skills: (profile.skills || []).join(', '),
                looking_for: profile.looking_for || [],
            })

            // If already complete, maybe skip?
            // But let's allow them to finish it if they are here.
        }
    }, [profile])

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    function toggleLookingFor(val) {
        setForm(f => ({
            ...f,
            looking_for: f.looking_for.includes(val)
                ? f.looking_for.filter(v => v !== val)
                : [...f.looking_for, val]
        }))
    }

    async function handleComplete() {
        setLoading(true)
        const skillsArr = form.skills.split(',').map(s => s.trim()).filter(Boolean)

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: form.full_name,
                phone: form.phone,
                district: form.district,
                bio: form.bio,
                skills: skillsArr,
                looking_for: form.looking_for,
                onboarding_completed: true
            })
            .eq('user_id', user.id)

        if (!error) {
            await fetchProfile(user.id)
            navigate('/dashboard')
        } else {
            alert('Error saving profile: ' + error.message)
        }
        setLoading(false)
    }

    return (
        <div className="onboarding-page">
            <div className="onboarding-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <div className="onboarding-container">
                <div className="onboarding-progress">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`progress-dot ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                            {step > s ? <CheckCircle2 size={16} /> : s}
                        </div>
                    ))}
                </div>

                <div className="onboarding-card">
                    {step === 1 && (
                        <div className="ob-step animate-fade-in">
                            <div className="ob-icon-header">
                                <User size={32} />
                            </div>
                            <h2>Let's get to know you</h2>
                            <p>Start by telling us your name and how we can reach you.</p>

                            <div className="input-wrap">
                                <label className="input-label">Full Name</label>
                                <input
                                    className="input"
                                    value={form.full_name}
                                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                                    placeholder="Sarah Nalweyiso"
                                />
                            </div>

                            <div className="input-wrap">
                                <label className="input-label">Phone Number</label>
                                <div className="input-icon-wrap">
                                    <Smartphone size={18} className="input-icon" />
                                    <input
                                        className="input"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+256 700 000000"
                                    />
                                </div>
                            </div>

                            <button className="btn btn-primary ob-next" onClick={nextStep} disabled={!form.full_name}>
                                Next <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="ob-step animate-fade-in">
                            <div className="ob-icon-header">
                                <MapPin size={32} />
                            </div>
                            <h2>Where are you located?</h2>
                            <p>This helps us find opportunities near you.</p>

                            <div className="input-wrap">
                                <label className="input-label">Select District</label>
                                <select
                                    className="input"
                                    value={form.district}
                                    onChange={e => setForm({ ...form, district: e.target.value })}
                                >
                                    <option value="">Select your district</option>
                                    {UGANDA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div className="input-wrap">
                                <label className="input-label">Brief Bio (Optional)</label>
                                <textarea
                                    className="input"
                                    rows={4}
                                    placeholder="Tell employers a little about your background..."
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                />
                            </div>

                            <div className="ob-actions">
                                <button className="btn btn-ghost" onClick={prevStep}><ChevronLeft size={18} /> Back</button>
                                <button className="btn btn-primary" onClick={nextStep} disabled={!form.district}>Next <ArrowRight size={18} /></button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="ob-step animate-fade-in">
                            <div className="ob-icon-header">
                                <Briefcase size={32} />
                            </div>
                            <h2>Skills & Interests</h2>
                            <p>What are you good at? What are you looking for?</p>

                            <div className="input-wrap">
                                <label className="input-label">Skills (separated by commas)</label>
                                <input
                                    className="input"
                                    placeholder="e.g. Graphic Design, Excel, Python"
                                    value={form.skills}
                                    onChange={e => setForm({ ...form, skills: e.target.value })}
                                />
                            </div>

                            <div className="input-wrap">
                                <label className="input-label">I am looking for...</label>
                                <div className="pills-grid">
                                    {LOOKING_FOR_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            className={`pill-btn ${form.looking_for.includes(opt.id) ? 'active' : ''}`}
                                            onClick={() => toggleLookingFor(opt.id)}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="ob-actions">
                                <button className="btn btn-ghost" onClick={prevStep}><ChevronLeft size={18} /> Back</button>
                                <button className="btn btn-primary" onClick={nextStep} disabled={!form.skills}>Next <ArrowRight size={18} /></button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="ob-step animate-fade-in ob-final">
                            <div className="ob-icon-header">
                                <Rocket size={40} />
                            </div>
                            <h2>Ready to launch!</h2>
                            <p>You're all set. You can upload your CV now or do it later from your profile dashboard.</p>

                            <div className="ob-success-card">
                                <Sparkles className="sparkle-icon" />
                                <h3>Your profile is 85% ready</h3>
                                <p>Complete this onboarding to start matching with employers in {form.district}.</p>
                            </div>

                            <div className="ob-actions-final">
                                <button className="btn btn-primary btn-lg" onClick={handleComplete} disabled={loading}>
                                    {loading ? 'Finalizing...' : 'Take me to my Dashboard'}
                                </button>
                                <p className="skip-hint" onClick={handleComplete}>I'll finish this later</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
