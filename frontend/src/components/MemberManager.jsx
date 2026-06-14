import { useState } from 'react';
import { groupAPI } from '../api/axios';
import { getAvatarColor } from './Navbar';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export default function MemberManager({ group, onUpdate, currentUserId }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await groupAPI.addMember(group.id, email.trim());
      setEmail('');
      setSuccess('Member added successfully!');
      onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from the group?`)) return;
    try {
      await groupAPI.removeMember(group.id, userId);
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const members = group.memberships || [];
  const isAdmin = members.find((m) => m.user_id === currentUserId)?.role === 'admin';

  return (
    <div>
      {/* Member List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {members.map((m) => (
          <div key={m.id} className="glass-card" style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div className="avatar" style={{
              width: 38, height: 38,
              background: getAvatarColor(m.user?.name || ''),
              fontSize: 13,
            }}>
              {getInitials(m.user?.name || '?')}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {m.user?.name}
                {m.user_id === currentUserId && (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (you)</span>
                )}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.user?.email}</p>
            </div>
            <span className={`badge ${m.role === 'admin' ? 'badge-purple' : 'badge-amber'}`}>
              {m.role}
            </span>
            {isAdmin && m.user_id !== currentUserId && (
              <button
                onClick={() => handleRemoveMember(m.user_id, m.user?.name)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: 16,
                  padding: '4px 8px',
                  borderRadius: 6,
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Remove member"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add member form */}
      {isAdmin && (
        <form onSubmit={handleAddMember}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="email"
              className="input"
              placeholder="Add member by email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
              {loading ? '...' : '+ Add'}
            </button>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{error}</p>}
          {success && <p style={{ color: 'var(--accent-green)', fontSize: 12, marginTop: 8 }}>{success}</p>}
        </form>
      )}
    </div>
  );
}
