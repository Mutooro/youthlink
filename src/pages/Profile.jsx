import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Profile.css'

const DISTRICTS = ['Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Gulu', 'Mbarara', 'Entebbe', 'Mbale', 'Fort Portal', 'Masaka']
const AVAILABILITIES = [
  { value: 'immediately', label: 'Immediately available' },
  { value: '1_month', label: 'Available in 1 month' },
  { value: '3_months', label: 'Available in 3 months' },
  { value: 'not_looking', label: 'Not actively looking' },
]
const LOOKING_FOR_OPTIONS = ['internship', 'fulltime', 'contract', 'parttime', 'program']

export default function Profile() {
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
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        district: form.district,
        phone: form.phone,
        bio: form.bio,
        skills: skillsArr,
        availability: form.availability,
        looking_for: form.looking_for,
      })
      .eq('user_id', user.id)
    setSaving(false)
    if (!error) { fetchProfile(user.id); showToast('✅ Profile saved!') }
    else showToast('❌ Error saving profile', 'error')
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
      showToast('✅ CV uploaded successfully!')
    } else {
      showToast('❌ Upload failed. Check storage is set up.', 'error')
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
              <input className="input" type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Phone number</label>
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+256 7XX XXX XXX" />
            </div>
            <div className="input-wrap">
              <label className="input-label">District</label>
              <select className="input" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                <option value="">Select your district</option>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="input-wrap">
              <label className="input-label">Bio / About you</label>
              <textarea className="input" rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell employers a bit about yourself..." />
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

            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>

          {/* RIGHT: CV UPLOAD */}
          <div className="profile-section">
            <h2 className="profile-section-title">Your CV</h2>
            <p className="profile-section-desc">Upload your CV so employers can find you and our system can match you with the right opportunities.</p>

            {profile?.cv_url ? (
              <div className="cv-uploaded">
                <div className="cv-icon">📄</div>
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
                <div className="cv-drop-icon">📤</div>
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
                <span>📎 {cvFile.name}</span>
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
                    <span>{val ? '✓' : '○'}</span> {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  )
}
