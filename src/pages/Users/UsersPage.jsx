import { Link, Navigate } from 'react-router-dom';
import { Users, Shield, Activity, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../utils/authRoles';
import './UsersPage.css';

export default function UsersPage() {
  const { user } = useAuth();

  if (isAdminUser(user)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="users-page">
      <div className="users-header animate-fade-up">
        <div>
          <h2 className="page-title">Account</h2>
          <p className="page-desc">Your profile and scan usage</p>
        </div>
      </div>

      <div className="users-grid">
        <div className="card user-card animate-fade-up stagger-1">
          <div className="user-card-header">
            <div className="user-avatar" style={{ '--role-color': 'var(--brand-primary)' }}>
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <div className="user-card-body">
            <div className="user-meta-row">
              <span className="user-role" style={{ color: 'var(--brand-primary)' }}>
                <Shield size={12} /> {user?.role || 'user'}
              </span>
              <span className="user-status active">
                <span className="user-status-dot" />
                {user?.subscription_status || 'active'}
              </span>
            </div>
            <div className="user-stats">
              <div className="user-stat">
                <Activity size={12} />
                <span>Plan: {user?.subscription_tier || 'free'}</span>
              </div>
              <div className="user-stat">
                <Users size={12} />
                <span>Scan limit: {user?.scan_limit ?? 10}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card user-card animate-fade-up stagger-2">
          <div className="user-card-body" style={{ padding: '1.5rem' }}>
            <h3 className="card-title">Team Management</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Team and user administration is handled through the Admin Portal.
              Contact your organization admin to manage team members.
            </p>
            <Link to="/dashboard/settings" className="btn btn-secondary">
              <Settings size={14} /> Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
