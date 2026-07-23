import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import Programs from './pages/Programs'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import JobDetail from './pages/JobDetail'
import PostJob from './pages/PostJob'
import ManageJob from './pages/ManageJob'
import Onboarding from './pages/Onboarding'
import ProgramDetail from './pages/ProgramDetail'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'
import PublicProfile from './pages/PublicProfile'
import EmployerPublicPage from './pages/EmployerPublicPage'
import AdminDashboard from './pages/AdminDashboard'
import Footer from './components/Footer'

function ProtectedRoute({ children, allowedRole = null }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="page-loading"><div className="spinner" /></div>
  if (!user) return <Navigate to="/auth" replace />

  if (allowedRole && profile && profile.role !== allowedRole) {
    // Redirect to the appropriate dashboard if the role doesn't match
    let target = '/dashboard'
    if (profile.role === 'employer') target = '/employer/dashboard'
    else if (profile.role === 'admin') target = '/admin'
    return <Navigate to={target} replace />
  }

  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:id" element={<ProgramDetail />} />
        <Route path="/students/:slug" element={<PublicProfile />} />
        <Route path="/employers/:slug" element={<EmployerPublicPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* Student Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Employer Routes */}
        <Route path="/employer/dashboard" element={
          <ProtectedRoute allowedRole="employer">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/post-job" element={
          <ProtectedRoute allowedRole="employer">
            <PostJob />
          </ProtectedRoute>
        } />
        <Route path="/manage-job/:id" element={
          <ProtectedRoute allowedRole="employer">
            <ManageJob />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
