import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Mail,
  Lock,
  User
} from 'lucide-react'
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
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard')
    }
  }, [user, profile, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } else {
      if (!fullName.trim()) { setError('Please enter your full name'); setLoading(false); return }
      const { error } = await signUp(email, password, fullName, role)
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setLoading(false)
      }
    }
  }

  if (authLoading) return <div className="page-loading">Checking session...</div>

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
            <CheckCircle2 size={48} className="success-icon-svg" />
            <h3>You're in!</h3>
            <p>{success}</p>
            <button className="btn btn-primary" onClick={() => { setSuccess(''); setMode('signin') }}>
              Sign in <ArrowRight size={18} />
            </button>
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
                    <GraduationCap size={24} />
                    <strong>Student / Job seeker</strong>
                    <span>Find internships & jobs</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'employer' ? 'active' : ''}`}
                    onClick={() => setRole('employer')}
                  >
                    <Building2 size={24} />
                    <strong>Employer</strong>
                    <span>Post jobs & find talent</span>
                  </button>
                </div>

                <div className="input-wrap">
                  <label className="input-label">Full name</label>
                  <div className="input-icon-wrap">
                    <User className="input-icon" size={18} />
                    <input className="input" type="text" placeholder="e.g. Sarah Nalweyiso" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            <div className="input-wrap">
              <label className="input-label">Email address</label>
              <div className="input-icon-wrap">
                <Mail className="input-icon" size={18} />
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-wrap">
              <label className="input-label">Password</label>
              <div className="input-icon-wrap">
                <Lock className="input-icon" size={18} />
                <input className="input" type="password" placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Your password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Please wait...' : (
                <>
                  {mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={18} />
                </>
              )}
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
