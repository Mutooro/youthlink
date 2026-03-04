import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Briefcase,
    Laptop,
    MapPin,
    Calendar,
    Send,
    FileText,
    ListChecks,
    ChevronLeft
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './PostJob.css'

const DISTRICTS = ['Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Gulu', 'Mbarara', 'Entebbe', 'Mbale', 'Fort Portal', 'Masaka']
const CATEGORIES = ['Technology & ICT', 'Health & Medicine', 'Finance & Banking', 'Agriculture', 'Education & NGO', 'Engineering', 'Marketing & Media', 'Legal']

export default function PostJob() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        title: '',
        type: 'internship',
        category: '',
        district: '',
        description: '',
        requirements: '',
        deadline: ''
    })
    const [loading, setLoading] = useState(false)
    const [employerId, setEmployerId] = useState(null)

    useEffect(() => {
        // Immediate redirect if not an employer
        if (profile && profile.role !== 'employer') {
            navigate('/dashboard')
            return
        }

        // Get the employer ID needed for the relation
        async function getEmployer() {
            const { data } = await supabase
                .from('employers')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (data) setEmployerId(data.id)
            else navigate('/dashboard') // Redirect if company profile not setup
        }

        if (user) getEmployer()
    }, [user, profile, navigate])

    async function handleSubmit(e) {
        e.preventDefault()
        if (!employerId) return

        setLoading(true)
        const { error } = await supabase
            .from('listings')
            .insert({
                employer_id: employerId,
                ...form
            })

        setLoading(false)

        if (!error) {
            navigate('/dashboard')
        } else {
            alert('Error posting job: ' + error.message)
        }
    }

    return (
        <div className="post-job-page">
            <div className="post-job-inner">
                <div className="post-job-header">
                    <div className="header-icon-bg">
                        <Briefcase size={32} />
                    </div>
                    <h1>Post a New Opportunity</h1>
                    <p>Fill in the details below to find your next talent.</p>
                </div>

                <form className="post-job-card" onSubmit={handleSubmit}>
                    <div className="input-row">
                        <div className="input-wrap">
                            <label className="input-label">Job Title</label>
                            <div className="input-with-icon">
                                <Briefcase className="field-icon" size={18} />
                                <input
                                    className="input"
                                    required
                                    placeholder="e.g. Graphic Design Intern"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="input-wrap">
                            <label className="input-label">Opportunity Type</label>
                            <div className="input-with-icon">
                                <FileText className="field-icon" size={18} />
                                <select
                                    className="input"
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                >
                                    <option value="internship">Internship</option>
                                    <option value="fulltime">Full-time</option>
                                    <option value="contract">Contract</option>
                                    <option value="parttime">Part-time</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="input-row">
                        <div className="input-wrap">
                            <label className="input-label">Category / Industry</label>
                            <div className="input-with-icon">
                                <Laptop className="field-icon" size={18} />
                                <select
                                    className="input"
                                    required
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="input-wrap">
                            <label className="input-label">Location (District)</label>
                            <div className="input-with-icon">
                                <MapPin className="field-icon" size={18} />
                                <select
                                    className="input"
                                    required
                                    value={form.district}
                                    onChange={e => setForm({ ...form, district: e.target.value })}
                                >
                                    <option value="">Select District</option>
                                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="input-wrap">
                        <label className="input-label">Description</label>
                        <textarea
                            className="input no-icon-padding"
                            rows={5}
                            placeholder="Describe the role and responsibilities..."
                            required
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="input-wrap">
                        <label className="input-label">Requirements</label>
                        <div className="textarea-with-icon">
                            <ListChecks className="field-icon-top" size={18} />
                            <textarea
                                className="input"
                                rows={4}
                                placeholder="e.g. Degree in CS, 1 year experience, etc. (one per line)"
                                value={form.requirements}
                                onChange={e => setForm({ ...form, requirements: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-wrap">
                        <label className="input-label">Application Deadline</label>
                        <div className="input-with-icon">
                            <Calendar className="field-icon" size={18} />
                            <input
                                type="date"
                                className="input"
                                required
                                value={form.deadline}
                                onChange={e => setForm({ ...form, deadline: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="post-job-footer">
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                            <ChevronLeft size={18} /> Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Posting...' : (
                                <>
                                    Publish Opportunity <Send size={18} style={{ marginLeft: '8px' }} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
