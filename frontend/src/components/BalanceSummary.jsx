import { formatCurrency } from '../utils/formatCurrency';
import { getAvatarColor } from './Navbar';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export default function BalanceSummary({ balances, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!balances || balances.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 16 }}>
          All settled up!
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          No outstanding balances in this group.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {balances.map((b, idx) => (
        <div key={idx} className="glass-card fade-in" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* From */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar" style={{
                width: 34, height: 34,
                background: getAvatarColor(b.from?.name || ''),
                fontSize: 12,
              }}>
                {getInitials(b.from?.name || '?')}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {b.from?.name}
              </span>
            </div>

            {/* Arrow + amount */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 700,
                color: '#ef4444',
                whiteSpace: 'nowrap',
              }}>
                owes {formatCurrency(b.amount)}
              </div>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Arrow */}
            <span style={{ color: 'var(--accent-green)', fontSize: 18 }}>→</span>

            {/* To */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {b.to?.name}
              </span>
              <div className="avatar" style={{
                width: 34, height: 34,
                background: getAvatarColor(b.to?.name || ''),
                fontSize: 12,
              }}>
                {getInitials(b.to?.name || '?')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
