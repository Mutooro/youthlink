import { Link } from 'react-router-dom'
import { MapPin, Clock } from 'lucide-react'
import './JobCard.css'

const TYPE_COLORS = {
  internship: 'badge-green',
  fulltime: 'badge-blue',
  contract: 'badge-yellow',
  parttime: 'badge-grey',
}

const TYPE_LABELS = {
  internship: 'Internship',
  fulltime: 'Full-time',
  contract: 'Contract',
  parttime: 'Part-time',
}

function CompanyInitials({ name }) {
  const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('') || '?'
  return <div className="company-logo">{initials}</div>
}

export default function JobCard({ job, matchScore }) {
  const employer = job.employers || {}
  const daysAgo = Math.floor((Date.now() - new Date(job.created_at)) / 86400000)

  return (
    <Link to={`/jobs/${job.id}`} className="job-card">
      <div className="job-card-top">
        <CompanyInitials name={employer.company_name} />
        <div className="job-meta">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{employer.company_name || 'Company'}</p>
        </div>
        {matchScore && (
          <div className="match-pill">{Math.round(matchScore)}% match</div>
        )}
      </div>

      <div className="job-tags">
        <span className={`badge ${TYPE_COLORS[job.type] || 'badge-grey'}`}>
          {TYPE_LABELS[job.type] || job.type}
        </span>
        {job.district && (
          <span className="badge badge-grey">
            <MapPin size={12} style={{ marginRight: '4px' }} />
            {job.district}
          </span>
        )}
        {job.duration && (
          <span className="badge badge-grey">
            <Clock size={12} style={{ marginRight: '4px' }} />
            {job.duration}
          </span>
        )}
      </div>

      {job.skills_required?.length > 0 && (
        <div className="job-skills">
          {job.skills_required.slice(0, 3).map(s => (
            <span key={s} className="skill-chip">{s}</span>
          ))}
          {job.skills_required.length > 3 && (
            <span className="skill-chip skill-more">+{job.skills_required.length - 3}</span>
          )}
        </div>
      )}

      <div className="job-footer">
        {job.salary_min ? (
          <span className="job-salary">
            UGX {job.salary_min.toLocaleString()}
            {job.salary_max ? `–${job.salary_max.toLocaleString()}` : '+'}
          </span>
        ) : <span className="job-salary">Salary negotiable</span>}
        <span className="job-date">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
      </div>
    </Link>
  )
}
