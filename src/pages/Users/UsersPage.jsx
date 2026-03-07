import { useState } from 'react';
import {
  Users, Plus, MoreVertical, Shield, Eye, Edit2, Trash2,
  Mail, Activity
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/mockApi';
import Modal from '../../components/Modal/Modal';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import './UsersPage.css';

const roleColors = {
  Admin: 'var(--severity-critical)',
  Analyst: 'var(--brand-primary)',
  Viewer: 'var(--text-tertiary)',
};

export default function UsersPage() {
  const { data: members, loading, error, refetch } = useApi(() => api.getTeamMembers());
  const [showInvite, setShowInvite] = useState(false);

  if (loading) return <SkeletonPage />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="users-page">
      <div className="users-header animate-fade-up">
        <div>
          <h2 className="page-title">Team Management</h2>
          <p className="page-desc">{(members || []).length} team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
          <Plus size={16} /> Invite Member
        </button>
      </div>

      <div className="users-grid">
        {(members || []).map((member, i) => (
          <div key={member.id} className={`card user-card animate-fade-up stagger-${i + 1}`}>
            <div className="user-card-header">
              <div className="user-avatar" style={{ '--role-color': roleColors[member.role] }}>
                {member.name.charAt(0)}
              </div>
              <div className="user-info">
                <div className="user-name">{member.name}</div>
                <div className="user-email">{member.email}</div>
              </div>
              <button className="btn btn-ghost btn-sm" aria-label="More options">
                <MoreVertical size={16} />
              </button>
            </div>
            <div className="user-card-body">
              <div className="user-meta-row">
                <span className="user-role" style={{ color: roleColors[member.role] }}>
                  <Shield size={12} /> {member.role}
                </span>
                <span className={`user-status ${member.status}`}>
                  <span className="user-status-dot" />
                  {member.status}
                </span>
              </div>
              <div className="user-stats">
                <div className="user-stat">
                  <Activity size={12} />
                  <span>Last active: {member.lastActive}</span>
                </div>
                <div className="user-stat">
                  <Eye size={12} />
                  <span>{member.scans} scans</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
        <div className="invite-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" placeholder="colleague@company.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select>
              <option>Analyst</option>
              <option>Viewer</option>
              <option>Admin</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            <Mail size={16} /> Send Invitation
          </button>
        </div>
      </Modal>
    </div>
  );
}
