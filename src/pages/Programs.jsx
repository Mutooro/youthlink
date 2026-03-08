import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Programs.css'

const TYPES = ['bootcamp', 'mentorship', 'empowerment', 'scholarship', 'training']
const TYPE_ICONS = { bootcamp: '💻', mentorship: '🤝', empowerment: '💪', scholarship: '🎓', training: '📚' }
const COLORS = ['prog-green', 'prog-yellow', 'prog-navy', 'prog-teal', 'prog-purple']

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => { fetchPrograms() }, [filter])

  async function fetchPrograms() {
    setLoading(true)
    let q = supabase.from('programs').select('*').eq('is_active', true).order('created_at', { ascending: false })
    if (filter) q = q.eq('type', filter)
    const { data } = await q
    setPrograms(data || [])
    setLoading(false)
  }

  // Fallback demo programs when DB is empty
  const demoPrograms = [
    { id: 1, title: 'Tech Bootcamp 2025', description: '12-week intensive covering web development, data science, and mobile apps. Fully funded with a monthly stipend.', type: 'bootcamp', organizer: 'GIZ Uganda', cost: 0, start_date: '2025-08-01', district: 'Kampala', seats: 120 },
    { id: 2, title: 'Youth Entrepreneur Hub', description: '8-week business skills program with mentorship, seed funding access, and networking events across Uganda.', type: 'mentorship', organizer: 'NSSF Uganda', cost: 0, start_date: null, district: 'Kampala', seats: 60 },
    { id: 3, title: 'Women in STEM', description: '6-month program empowering young women in Science, Technology, Engineering and Mathematics with placement support.', type: 'empowerment', organizer: 'UN Women', cost: 50000, start_date: '2025-09-01', district: 'Various', seats: 80 },
    { id: 4, title: 'Makerere Innovation Scholarship', description: 'Full scholarship for students pursuing tech and engineering degrees at Makerere University.', type: 'scholarship', organizer: 'Stanbic Bank', cost: 0, start_date: '2025-01-01', district: 'Kampala', seats: 25 },
    { id: 5, title: 'Digital Marketing Masterclass', description: '4-week intensive training on social media marketing, SEO, and digital advertising for young entrepreneurs.', type: 'training', organizer: 'MTN Uganda', cost: 100000, start_date: '2025-07-01', district: 'Kampala', seats: 40 },
    { id: 6, title: 'AgriTech Youth Program', description: 'Connect young people to modern agriculture, agri-tech tools, and agribusiness opportunities across Uganda.', type: 'empowerment', organizer: 'USAID Uganda', cost: 0, start_date: '2025-06-01', district: 'Jinja', seats: 100 },
  ]

  const displayPrograms = programs.length > 0 ? programs : demoPrograms
  const filtered = filter ? displayPrograms.filter(p => p.type === filter) : displayPrograms

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
            {TYPES.map(t => (
              <button key={t} className={`filter-pill ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
                {TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}s
              </button>
            ))}
          </div>

          {loading ? (
            <div className="prog-grid">{[...Array(4)].map((_, i) => <div key={i} className="prog-skeleton" />)}</div>
          ) : (
            <div className="prog-grid">
              {filtered.map((p, i) => (
                <div key={p.id} className={`prog-card ${COLORS[i % COLORS.length]}`}>
                  <div className="prog-card-type">
                    <span>{TYPE_ICONS[p.type] || '📋'}</span>
                    <span>{p.type}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="prog-meta-row">
                    {p.organizer && <span>🏢 {p.organizer}</span>}
                    {p.district && <span>📍 {p.district}</span>}
                    {p.seats && <span>👥 {p.seats} seats</span>}
                  </div>
                  <div className="prog-footer">
                    <div className="prog-tags">
                      <span className="prog-cost-badge">
                        {p.cost === 0 ? '✅ Free' : `UGX ${p.cost.toLocaleString()}`}
                      </span>
                      {p.start_date && (
                        <span className="prog-date-badge">
                          📅 {new Date(p.start_date).toLocaleDateString('en-UG', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <Link to={`/programs/${p.id}`} className="btn btn-sm prog-apply-btn">Apply →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
