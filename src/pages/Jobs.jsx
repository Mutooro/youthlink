import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import JobCard from '../components/JobCard'
import './Jobs.css'

const DISTRICTS = ['Kampala','Wakiso','Mukono','Jinja','Gulu','Mbarara','Entebbe','Mbale','Fort Portal','Masaka']
const TYPES = [
  { value: '', label: 'All types' },
  { value: 'internship', label: 'Internships' },
  { value: 'fulltime', label: 'Full-time' },
  { value: 'contract', label: 'Contracts' },
  { value: 'parttime', label: 'Part-time' },
]
const CATEGORIES = ['Technology & ICT','Health & Medicine','Finance & Banking','Agriculture','Education & NGO','Engineering','Marketing & Media','Legal']

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [district, setDistrict] = useState(searchParams.get('district') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  useEffect(() => { fetchJobs() }, [district, type, category])

  async function fetchJobs() {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, employers(company_name, logo_url)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (district) query = query.eq('district', district)
    if (type) query = query.eq('type', type)
    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, count } = await query
    setJobs(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchJobs()
  }

  function clearFilters() {
    setSearch(''); setDistrict(''); setType(''); setCategory('')
    setSearchParams({})
  }

  const hasFilters = search || district || type || category

  return (
    <div className="jobs-page">
      {/* PAGE HEADER */}
      <div className="jobs-header">
        <div className="jobs-header-inner">
          <h1>Jobs & Internships</h1>
          <p>Find your next opportunity across Uganda</p>
          <form className="jobs-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="input"
              placeholder="Search by title, skill, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="jobs-body">
        {/* FILTERS SIDEBAR */}
        <aside className="filters-panel">
          <div className="filters-head">
            <h3>Filters</h3>
            {hasFilters && (
              <button className="clear-btn" onClick={clearFilters}>Clear all</button>
            )}
          </div>

          <div className="filter-group">
            <label className="filter-label">Location</label>
            <select className="input" value={district} onChange={e => setDistrict(e.target.value)}>
              <option value="">All districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Job type</label>
            <div className="filter-pills">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  className={`filter-pill ${type === t.value ? 'active' : ''}`}
                  onClick={() => setType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Industry</label>
            <div className="filter-pills">
              <button
                className={`filter-pill ${!category ? 'active' : ''}`}
                onClick={() => setCategory('')}
              >All</button>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`filter-pill ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RESULTS */}
        <main className="jobs-results">
          <div className="results-meta">
            <span>{loading ? 'Loading...' : `${total} opportunit${total !== 1 ? 'ies' : 'y'} found`}</span>
            {hasFilters && <span className="filter-active-hint">Filters applied</span>}
          </div>

          {loading ? (
            <div className="jobs-loading">
              {[...Array(6)].map((_, i) => <div key={i} className="job-skeleton" />)}
            </div>
          ) : jobs.length > 0 ? (
            <div className="results-grid">
              {jobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No opportunities found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
