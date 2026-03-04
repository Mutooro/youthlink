import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/jobs', label: 'Jobs & Internships' },
    { to: '/programs', label: 'Programs' },
  ]

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Youth<span>Link</span>
          <span className="brand-ug">UG</span>
        </Link>

        <ul className="navbar-links">
          {links.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`nav-link ${location.pathname.startsWith(l.to) ? 'active' : ''}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <div className="nav-user">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/profile" className="nav-avatar" title="My Profile">
                <div className="avatar-circle">
                  {profile?.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              </Link>
              <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/auth" className="btn btn-secondary btn-sm">Sign in</Link>
              <Link to="/auth?mode=signup" className="btn btn-primary btn-sm">Get Started →</Link>
            </div>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="mobile-link" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>My Profile</Link>
              <button className="mobile-link" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/auth?mode=signup" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
