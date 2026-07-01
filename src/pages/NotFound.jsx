import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page-loading" style={{ minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Page not found</h1>
        <p style={{ color: '#5f7283', marginBottom: '1.25rem' }}>The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </div>
  )
}
