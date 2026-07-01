import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  Code, 
  Users, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  MapPin, 
  Users2, 
  CheckCircle, 
  Calendar,
  ArrowRight
} from 'lucide-react'
import './Programs.css'

const TYPES = ['bootcamp', 'mentorship', 'empowerment', 'scholarship', 'training']
const TYPE_ICONS = { 
  bootcamp: Code, 
  mentorship: Users, 
  empowerment: Sparkles, 
  scholarship: GraduationCap, 
  training: BookOpen 
}
const COLORS = ['prog-green', 'prog-yellow', 'prog-navy', 'prog-teal', 'prog-purple']

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => { fetchPrograms() }, [filter])

  async function fetchPrograms() {
    setLoading(true)
    let q = supabase.from('programs').select('*').eq('is_active', true).order('created_at', { ascending: false })
    if (filter) q = q.eq('program_type', filter)
    const { data } = await q
    setPrograms(data || [])
    setLoading(false)
  }

  const filtered = filter ? programs.filter(p => p.program_type === filter) : programs

  return (
    <div className="programs-page">
      {/* HEADER */}
      <div className="programs-header">
        <div className="programs-header-inner">
          <div className="section-label">Youth programs</div>
          <h1>Bootcamps & <span className="hl-green">empowerment</span> programs</h1>
          <p>Free and subsidised programs to upskill Uganda's youth — from coding bootcamps to entrepreneurship training.</p>
        </div>
      </div>

      <div className="section">
        <div className="section-inner">
          {/* TYPE FILTER */}
          <div className="prog-filters">
            <button className={`filter-pill ${!filter ? 'active' : ''}`} onClick={() => setFilter('')}>All programs</button>
            {TYPES.map(t => {
              const Icon = TYPE_ICONS[t]
              return (
                <button key={t} className={`filter-pill ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
                  <Icon size={14} className="icon-main" /> {t.charAt(0).toUpperCase() + t.slice(1)}s
                </button>
              )
            })}
          </div>

          {loading ? (
            <div className="prog-grid">{[...Array(4)].map((_, i) => <div key={i} className="prog-skeleton" />)}</div>
          ) : filtered.length > 0 ? (
            <div className="prog-grid">
              {filtered.map((p, i) => (
                <div key={p.id} className={`prog-card ${COLORS[i % COLORS.length]}`}>
                  <div className="prog-card-type">
                    {(() => {
                      const Icon = TYPE_ICONS[p.program_type] || BookOpen
                      return <Icon size={18} />
                    })()}
                    <span>{p.program_type}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="prog-meta-row">
                    {p.organizer && <span><Building2 size={14} /> {p.organizer}</span>}
                    {p.district && <span><MapPin size={14} /> {p.district}</span>}
                    {p.seats && <span><Users2 size={14} /> {p.seats} seats</span>}
                  </div>
                  <div className="prog-footer">
                    <div className="prog-tags">
                      <span className="prog-cost-badge">
                        {p.cost === 0 ? <><CheckCircle size={14} /> Free</> : `UGX ${p.cost.toLocaleString()}`}
                      </span>
                      {p.start_date && (
                        <span className="prog-date-badge">
                          <Calendar size={14} /> {new Date(p.start_date).toLocaleDateString('en-UG', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <Link to={`/programs/${p.id}`} className="btn btn-sm prog-apply-btn">Apply <ArrowRight size={14} /></Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty">
              <p>No programs are available right now. Check back soon for new opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
