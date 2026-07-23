import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Bell,
  ShieldAlert
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import './Navbar.css'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isEmployer = profile?.role === 'employer'
  const isAdmin = profile?.role === 'admin'
  const dashboardPath = isAdmin ? '/admin' : isEmployer ? '/employer/dashboard' : '/dashboard'

  const links = [
    { to: '/jobs', label: 'Jobs & Internships', icon: Briefcase },
    { to: '/programs', label: 'Programs', icon: GraduationCap },
  ]

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setMenuOpen(false)
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
          {isEmployer && (
            <li>
              <Link to="/post-job" className={`nav-link ${location.pathname === '/post-job' ? 'active' : ''}`}>
                Post a Job
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                <ShieldAlert size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <div className="nav-user">
              <Link to="/notifications" className="nav-icon-link" title="Notifications">
                <Bell size={20} />
                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </Link>
              <Link to={dashboardPath} className="nav-link dashboard-link">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/profile" className="nav-avatar" title="My Profile">
                <div className="avatar-circle">
                  {profile?.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              </Link>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={handleSignOut} title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/auth" className="nav-link">Sign in</Link>
              <Link to="/auth?mode=signup" className="btn btn-primary btn-sm">
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-inner">
            {links.map(l => (
              <Link key={l.to} to={l.to} className="mobile-link" onClick={() => setMenuOpen(false)}>
                <l.icon size={20} />
                <span>{l.label}</span>
              </Link>
            ))}
            {isEmployer && (
              <Link to="/post-job" className="mobile-link" onClick={() => setMenuOpen(false)}>
                <Briefcase size={20} />
                <span>Post a Job</span>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>
                <ShieldAlert size={20} />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <div className="mobile-divider" />
            {user ? (
              <>
                <Link to={dashboardPath} className="mobile-link" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  <User size={20} />
                  <span>My Profile</span>
                </Link>
                <button className="mobile-link mobile-signout" onClick={handleSignOut}>
                  <LogOut size={20} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link to="/auth?mode=signup" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                  Get Started <ArrowRight size={18} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
