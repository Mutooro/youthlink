import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin')
  const [role, setRole] = useState('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/dashboard')
    } else {
      if (!fullName.trim()) { setError('Please enter your full name'); setLoading(false); return }
      const { error } = await signUp(email, password, fullName, role)
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then sign in.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
      </div>

      <div className="auth-card">
        <Link to="/" className="auth-brand">Youth<span>Link</span><span className="brand-ug">UG</span></Link>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => { setMode('signin'); setError('') }}>Sign in</button>
          <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError('') }}>Create account</button>
        </div>

        {success ? (
          <div className="auth-success">
            <div className="success-icon">✅</div>
            <h3>You're in!</h3>
            <p>{success}</p>
            <button className="btn btn-primary" onClick={() => { setSuccess(''); setMode('signin') }}>Sign in →</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <>
                <div className="role-picker">
                  <button
                    type="button"
                    className={`role-btn ${role === 'student' ? 'active' : ''}`}
                    onClick={() => setRole('student')}
                  >
                    <span>🎓</span>
                    <strong>Student / Job seeker</strong>
                    <span>Find internships & jobs</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'employer' ? 'active' : ''}`}
                    onClick={() => setRole('employer')}
                  >
                    <span>🏢</span>
                    <strong>Employer</strong>
                    <span>Post jobs & find talent</span>
                  </button>
                </div>

                <div className="input-wrap">
                  <label className="input-label">Full name</label>
                  <input className="input" type="text" placeholder="e.g. Sarah Nalweyiso" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
              </>
            )}

            <div className="input-wrap">
              <label className="input-label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="input-wrap">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Your password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>

            <p className="auth-terms">
              By continuing, you agree to YouthLink's{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
