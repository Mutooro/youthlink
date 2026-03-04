import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Laptop,
  Stethoscope,
  BarChart3,
  Sprout,
  BookOpen,
  Settings,
  Smartphone,
  Scale,
  Search,
  UserPlus,
  FileText,
  Target,
  Handshake,
  ArrowRight,
  MapPin,
  Briefcase,
  Users,
  GraduationCap,
  Award
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import JobCard from '../components/JobCard'
import './Home.css'

const DISTRICTS = ['Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Gulu', 'Mbarara', 'Entebbe', 'Mbale', 'Fort Portal', 'Masaka']

const CATEGORIES = [
  { icon: Laptop, name: 'Technology & ICT', count: 234 },
  { icon: Stethoscope, name: 'Health & Medicine', count: 187 },
  { icon: BarChart3, name: 'Finance & Banking', count: 156 },
  { icon: Sprout, name: 'Agriculture', count: 143 },
  { icon: BookOpen, name: 'Education & NGO', count: 128 },
  { icon: Settings, name: 'Engineering', count: 112 },
  { icon: Smartphone, name: 'Marketing & Media', count: 98 },
  { icon: Scale, name: 'Legal', count: 67 },
]

export default function Home() {
  const [recentJobs, setRecentJobs] = useState([])
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('listings')
      .select('*, employers(company_name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setRecentJobs(data || []))
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (district) params.set('district', district)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid-lines" />
        </div>
        <div className="hero-inner">
          <div className="hero-pill">🇺🇬 Uganda's #1 Youth Employment Platform</div>
          <h1 className="hero-title">
            Launch your <span className="hl-green">career</span><br />
            in <span className="hl-yellow">Uganda</span> today
          </h1>
          <p className="hero-sub">
            Internships, jobs, short contracts & empowerment programs —
            matched to your skills and location.
          </p>

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-wrap">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Job title, skill, or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-select-wrap">
              <MapPin className="select-icon" size={18} />
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="search-select"
              >
                <option value="">All districts</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-icon-bg"><Briefcase size={20} /></div>
              <div><strong>1,200+</strong><span>Active listings</span></div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-icon-bg"><Users size={20} /></div>
              <div><strong>340+</strong><span>Employers</span></div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-icon-bg"><GraduationCap size={20} /></div>
              <div><strong>80+</strong><span>Youth programs</span></div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-icon-bg"><Award size={20} /></div>
              <div><strong>15K+</strong><span>Students placed</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-inner">
          <div className="section-label">Browse by sector</div>
          <h2 className="section-title">Opportunities in every <span>industry</span></h2>
          <div className="cat-grid">
            {CATEGORIES.map(c => (
              <Link
                key={c.name}
                to={`/jobs?category=${encodeURIComponent(c.name)}`}
                className="cat-card"
              >
                <span className="cat-icon"><c.icon size={28} strokeWidth={1.5} /></span>
                <span className="cat-name">{c.name}</span>
                <span className="cat-count">{c.count} listings</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT JOBS */}
      <section className="section" style={{ background: 'var(--navy-mid)', paddingBlock: '4rem' }}>
        <div className="section-inner">
          <div className="section-header">
            <div>
              <div className="section-label">Just posted</div>
              <h2 className="section-title">Latest <span>opportunities</span></h2>
            </div>
            <Link to="/jobs" className="btn btn-secondary">View all <ArrowRight size={16} style={{ marginLeft: '8px' }} /></Link>
          </div>
          {recentJobs.length > 0 ? (
            <div className="jobs-grid">
              {recentJobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p>No listings yet — check back soon or <Link to="/auth?mode=signup">sign up</Link> to get alerts.</p>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-inner">
          <div className="section-label">How it works</div>
          <h2 className="section-title">Find a job in <span>4 simple steps</span></h2>
          <div className="steps-grid">
            {[
              { n: '01', icon: UserPlus, title: 'Create your profile', desc: 'Sign up in 60 seconds and tell us your skills, education, and what you\'re looking for.' },
              { n: '02', icon: FileText, title: 'Upload your CV', desc: 'Our system reads your CV and builds a skills profile to match you with relevant opportunities.' },
              { n: '03', icon: Target, title: 'Get matched', desc: 'Receive curated matches for jobs, internships, contracts and programs near you.' },
              { n: '04', icon: Handshake, title: 'Apply & connect', desc: 'Apply directly to employers, track your applications and land your next opportunity.' },
            ].map(s => (
              <div key={s.n} className="how-step">
                <div className="step-icon"><s.icon size={32} strokeWidth={1.5} /></div>
                <span className="step-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-inner">
          <div>
            <h2>Ready to find your opportunity?</h2>
            <p>Join thousands of Ugandan youth already building their careers on YouthLink.</p>
          </div>
          <div className="cta-actions">
            <Link to="/auth?mode=signup" className="btn btn-primary btn-lg">Create Free Account <ArrowRight size={20} style={{ marginLeft: '8px' }} /></Link>
            <Link to="/jobs" className="btn btn-secondary btn-lg">Browse Jobs</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
