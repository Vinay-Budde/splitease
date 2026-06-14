import { Link } from 'react-router-dom';
import { getAvatarColor } from './Navbar';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export default function GroupCard({ group }) {
  const memberCount = group.memberships?.length || 0;

  return (
    <Link to={`/groups/${group.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass-card" style={{
        padding: 24,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        borderColor: 'var(--border)',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(29, 185, 84, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(29, 185, 84, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #1db954, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}>
            👥
          </div>
          {group.role === 'admin' && (
            <span className="badge badge-purple">Admin</span>
          )}
        </div>

        {/* Name */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {group.name}
        </h3>
        {group.description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
            {group.description}
          </p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          {/* Member avatars */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {(group.memberships || []).slice(0, 4).map((m, idx) => (
              <div key={m.user_id || idx} className="avatar" style={{
                width: 28, height: 28,
                fontSize: 11,
                background: getAvatarColor(m.user?.name || ''),
                marginLeft: idx > 0 ? -8 : 0,
                border: '2px solid var(--bg-card)',
                zIndex: 4 - idx,
              }}>
                {getInitials(m.user?.name || '?')}
              </div>
            ))}
            {memberCount > 4 && (
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '2px solid var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'var(--text-muted)', marginLeft: -8, zIndex: 0,
              }}>
                +{memberCount - 4}
              </div>
            )}
          </div>

          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
