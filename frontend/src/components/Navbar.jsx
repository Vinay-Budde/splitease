import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = [
  'linear-gradient(135deg, #1db954, #16a34a)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ef4444, #dc2626)',
  'linear-gradient(135deg, #3b82f6, #2563eb)',
  'linear-gradient(135deg, #ec4899, #db2777)',
];

export const getAvatarColor = (name = '') => {
  const code = name.charCodeAt(0) || 0;
  return avatarColors[code % avatarColors.length];
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'rgba(22, 22, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1db954, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}>
              ⚡
            </div>
            <span style={{
              fontSize: 20,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1db954, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              SplitEase
            </span>
          </div>
        </Link>

        {/* User section */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/dashboard" style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
            >
              Dashboard
            </Link>

            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar" style={{
                width: 36, height: 36,
                background: getAvatarColor(user.name),
                fontSize: 13,
              }}>
                {getInitials(user.name)}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                {user.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '7px 14px', fontSize: 13 }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
