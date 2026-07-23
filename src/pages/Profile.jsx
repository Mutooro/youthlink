import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Circle,
  FileText,
  UploadCloud,
  Paperclip,
  Save,
  AlertCircle,
  Check,
  Phone,
  MapPin,
  User,
  Info,
  ChevronRight,
  Building2,
  Globe
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { UGANDA_DISTRICTS } from '../data/uganda_districts'
import './Profile.css'

const DISTRICTS = UGANDA_DISTRICTS
const AVAILABILITIES = [
  { value: 'immediately', label: 'Immediately available' },
  { value: '1_month', label: 'Available in 1 month' },
  { value: '3_months', label: 'Available in 3 months' },
  { value: 'not_looking', label: 'Not actively looking' },
]
const LOOKING_FOR_OPTIONS = ['internship', 'fulltime', 'contract', 'parttime', 'program']
const EMPLOYER_SIZES = ['1-10', '11-50', '51-200', '200+']

export default function Profile() {
  const { profile } = useAuth()
  
  if (!profile) return null
  if (profile.role === 'employer') return <EmployerProfile />
  return <StudentProfile />
}

function StudentProfile() {
  const { user, profile, fetchProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: '', district: '', phone: '', bio: '',
    skills: '', availability: '', looking_for: [],
  })
  const [saving, setSaving] = useState(false)
  const [cvFile, setCvFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        district: profile.district || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        skills: (profile.skills || []).join(', '),
        availability: profile.availability || '',
        looking_for: profile.looking_for || [],
      })
    }
  }, [profile])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function toggleLookingFor(val) {
    setForm(f => ({
      ...f,
      looking_for: f.looking_for.includes(val)
        ? f.looking_for.filter(v => v !== val)
        : [...f.looking_for, val]
    }))
  }

  async function handleSave() {
    setSaving(true)
    const skillsArr = form.skills.split(',').map(s => s.trim()).filter(Boolean)

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const payload = {
      user_id: user.id,
      full_name: form.full_name,
      district: form.district,
      phone: form.phone,
      bio: form.bio,
      skills: skillsArr,
      availability: form.availability,
      looking_for: form.looking_for,
    }

    const { error } = existingProfile?.id
      ? await supabase.from('profiles').update(payload).eq('id', existingProfile.id)
      : await supabase.from('profiles').insert(payload)

    setSaving(false)
    if (!error) {
      fetchProfile(user.id)
      showToast('Profile saved successfully!', 'success')
    } else {
      showToast('Error saving profile: ' + error.message, 'error')
    }
  }

  async function handleCvUpload() {
    if (!cvFile) return
    setUploading(true)
    const ext = cvFile.name.split('.').pop()
    const path = `${user.id}/cv.${ext}`
    const { error: uploadError } = await supabase.storage.from('cvs').upload(path, cvFile, { upsert: true })
    if (!uploadError) {
      await supabase.from('profiles').update({ cv_url: path }).eq('user_id', user.id)
      fetchProfile(user.id)
      showToast('CV uploaded successfully!', 'success')
    } else {
      showToast('Upload failed. Check storage is set up.', 'error')
    }
    setUploading(false)
    setCvFile(null)
  }

  return (
    <div className="profile-page">
      <div className="profile-inner">
        <div className="profile-header">
          <div className="profile-avatar-big">
            {form.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1>{form.full_name || 'Your Profile'}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-grid">
          {/* LEFT: PERSONAL INFO */}
          <div className="profile-section">
            <h2 className="profile-section-title">Personal information</h2>

            <div className="input-wrap">
              <label className="input-label">Full name</label>
              <div className="input-icon-wrap">
                <User className="input-icon" size={18} />
                <input className="input" type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" />
              </div>
            </div>
            <div className="input-wrap">
              <label className="input-label">Phone number</label>
              <div className="input-icon-wrap">
                <Phone className="input-icon" size={18} />
                <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+256 7XX XXX XXX" />
              </div>
            </div>
            <div className="input-wrap">
              <label className="input-label">District</label>
              <div className="input-icon-wrap">
                <MapPin className="input-icon" size={18} />
                <select className="input" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                  <option value="">Select your district</option>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="input-wrap">
              <label className="input-label">Bio / About you</label>
              <div className="textarea-icon-wrap">
                <Info className="textarea-icon" size={18} />
                <textarea className="input" rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell employers a bit about yourself..." />
              </div>
            </div>

            <h2 className="profile-section-title" style={{ marginTop: '1.5rem' }}>Skills & availability</h2>

            <div className="input-wrap">
              <label className="input-label">Skills (comma-separated)</label>
              <input className="input" type="text" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="e.g. Python, Data Analysis, Excel" />
            </div>

            <div className="input-wrap">
              <label className="input-label">Availability</label>
              <select className="input" value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}>
                <option value="">Select availability</option>
                {AVAILABILITIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>

            <div className="input-wrap">
              <label className="input-label">I'm looking for</label>
              <div className="looking-for-pills">
                {LOOKING_FOR_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    className={`filter-pill ${form.looking_for.includes(opt) ? 'active' : ''}`}
                    onClick={() => toggleLookingFor(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : (
                <>
                  <Save size={18} /> Save profile
                </>
              )}
            </button>
          </div>

          {/* RIGHT: CV UPLOAD */}
          <div className="profile-section">
            <h2 className="profile-section-title">Your CV</h2>
            <p className="profile-section-desc">Upload your CV so employers can find you and our system can match you with the right opportunities.</p>

            {profile?.cv_url ? (
              <div className="cv-uploaded">
                <div className="cv-icon">
                  <FileText size={24} />
                </div>
                <div>
                  <strong>CV uploaded</strong>
                  <p>Your CV is live and being matched with opportunities.</p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => document.getElementById('cv-input').click()}
                >Replace</button>
              </div>
            ) : (
              <div
                className="cv-dropzone"
                onClick={() => document.getElementById('cv-input').click()}
              >
                <div className="cv-drop-icon">
                  <UploadCloud size={32} />
                </div>
                <strong>Click to upload your CV</strong>
                <span>PDF, DOC, or DOCX — max 5MB</span>
              </div>
            )}

            <input
              id="cv-input"
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={e => setCvFile(e.target.files[0])}
            />

            {cvFile && (
              <div className="cv-selected">
                <span>
                  <Paperclip size={14} /> {cvFile.name}
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleCvUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload CV'}
                </button>
              </div>
            )}

            {/* SKILLS PREVIEW */}
            {form.skills && (
              <div className="skills-preview">
                <h3>Your skills</h3>
                <div className="skills-chips">
                  {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE COMPLETENESS */}
            <div className="completeness-card">
              <h3>Profile strength</h3>
              <div className="completeness-bar-bg">
                <div
                  className="completeness-bar-fill"
                  style={{
                    width: `${[form.full_name, form.district, form.phone, form.bio, form.skills, form.availability, profile?.cv_url].filter(Boolean).length / 7 * 100}%`
                  }}
                />
              </div>
              <ul className="completeness-list">
                {[
                  [form.full_name, 'Full name'],
                  [form.district, 'District'],
                  [form.phone, 'Phone number'],
                  [form.bio, 'Bio / About you'],
                  [form.skills, 'Skills'],
                  [form.availability, 'Availability'],
                  [profile?.cv_url, 'CV uploaded'],
                ].map(([val, label]) => (
                  <li key={label} className={val ? 'done' : ''}>
                    <span>{val ? <CheckCircle2 size={14} /> : <Circle size={14} />}</span> {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
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

function EmployerProfile() {
  const { user, fetchProfile } = useAuth()
  const [form, setForm] = useState({
    company_name: '', industry: '', size: '', website: '', description: '', district: ''
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [employerId, setEmployerId] = useState(null)

  useEffect(() => {
    async function loadEmployer() {
      const { data } = await supabase.from('employers').select('*').eq('user_id', user.id).maybeSingle()
      if (data) {
        setEmployerId(data.id)
        setForm({
          company_name: data.company_name || '',
          industry: data.industry || '',
          size: data.size || '',
          website: data.website || '',
          description: data.description || '',
          district: data.district || '',
        })
      }
    }
    loadEmployer()
  }, [user.id])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...form }
    
    // Size has a check constraint: '1-10', '11-50', '51-200', '200+'
    if (!payload.size) payload.size = null

    let err
    if (employerId) {
      const { error } = await supabase.from('employers').update(payload).eq('id', employerId)
      err = error
    } else {
      payload.user_id = user.id
      const { data, error } = await supabase.from('employers').insert(payload).select('id').single()
      if (data) setEmployerId(data.id)
      err = error
    }

    setSaving(false)
    if (!err) {
      fetchProfile(user.id) // To refresh context if needed
      showToast('Company profile saved successfully!', 'success')
    } else {
      showToast('Error saving profile: ' + err.message, 'error')
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-inner">
        <div className="profile-header">
          <div className="profile-avatar-big">
            <Building2 size={40} color="#fff" />
          </div>
          <div>
            <h1>{form.company_name || 'Your Company'}</h1>
            <p>Employer Profile</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-section" style={{ gridColumn: '1 / -1' }}>
            <h2 className="profile-section-title">Company Information</h2>

            <div className="input-row">
              <div className="input-wrap">
                <label className="input-label">Company name</label>
                <div className="input-icon-wrap">
                  <Building2 className="input-icon" size={18} />
                  <input className="input" type="text" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Company name" />
                </div>
              </div>
              <div className="input-wrap">
                <label className="input-label">Industry</label>
                <div className="input-icon-wrap">
                  <Info className="input-icon" size={18} />
                  <input className="input" type="text" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="e.g. Technology, Healthcare" />
                </div>
              </div>
            </div>

            <div className="input-row">
              <div className="input-wrap">
                <label className="input-label">Company Size</label>
                <select className="input" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}>
                  <option value="">Select size</option>
                  {EMPLOYER_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
              <div className="input-wrap">
                <label className="input-label">Location (District)</label>
                <div className="input-icon-wrap">
                  <MapPin className="input-icon" size={18} />
                  <select className="input" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                    <option value="">Select district</option>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="input-wrap">
              <label className="input-label">Website</label>
              <div className="input-icon-wrap">
                <Globe className="input-icon" size={18} />
                <input className="input" type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" />
              </div>
            </div>

            <div className="input-wrap">
              <label className="input-label">About the company</label>
              <div className="textarea-icon-wrap">
                <Info className="textarea-icon" size={18} />
                <textarea className="input" rows={5} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell candidates about what you do..." />
              </div>
            </div>

            <button className="btn btn-primary btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><Save size={18} /> Save Company Profile</>}
            </button>
          </div>
        </div>
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
