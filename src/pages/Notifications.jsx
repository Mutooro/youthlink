import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Bell,
    CheckCircle2,
    Info,
    AlertCircle,
    Trash2,
    Calendar,
    Briefcase
} from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'
import './Dashboard.css' // Reuse dash panel styles

export default function Notifications() {
    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead
    } = useNotifications()

    const ICON_MAP = {
        application: <Briefcase size={20} />,
        program: <Calendar size={20} />,
        alert: <AlertCircle size={20} />,
        info: <Info size={20} />,
        success: <CheckCircle2 size={20} />
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-inner" style={{ maxWidth: '800px' }}>
                <div className="dash-greeting">
                    <div>
                        <h1>Notifications</h1>
                        <p>Stay updated on your applications and opportunities.</p>
                    </div>
                    {notifications.length > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={markAllAsRead}>
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="dash-panel">
                    {loading && notifications.length === 0 ? (
                        <div className="dash-empty">Loading notifications...</div>
                    ) : notifications.length > 0 ? (
                        <div className="notif-list">
                            {notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                >
                                    <div className={`notif-icon-bg ${n.type || 'info'}`}>
                                        {ICON_MAP[n.type] || <Bell size={20} />}
                                    </div>
                                    <div className="notif-content">
                                        <div className="notif-title-row">
                                            <strong>{n.title}</strong>
                                            <span className="notif-time">
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p>{n.content}</p>
                                        {n.link && (
                                            <Link to={n.link} className="notif-link">View details →</Link>
                                        )}
                                    </div>
                                    {!n.is_read && <div className="unread-dot" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="dash-empty">
                            <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No notifications yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
