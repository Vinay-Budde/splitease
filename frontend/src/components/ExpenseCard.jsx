import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { getAvatarColor } from './Navbar';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const SPLIT_TYPE_LABELS = {
  equal: 'Equal',
  unequal: 'Unequal',
  percentage: 'Percentage',
  shares: 'Shares',
};

export default function ExpenseCard({ expense, onDelete }) {
  const { user } = useAuth();

  const myShare = expense.splits?.find((s) => s.user_id === user?.id);
  const myOwed = myShare ? parseFloat(myShare.owed_amount) : 0;
  const iPaid = expense.paid_by === user?.id;

  return (
    <Link to={`/expenses/${expense.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass-card fade-in" style={{
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(4px)';
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Payer avatar */}
          <div className="avatar" style={{
            width: 42, height: 42,
            background: getAvatarColor(expense.payer?.name || ''),
            fontSize: 14,
            flexShrink: 0,
          }}>
            {getInitials(expense.payer?.name || '?')}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {expense.description}
              </h4>
              <span className="badge badge-purple" style={{ fontSize: 10 }}>
                {SPLIT_TYPE_LABELS[expense.split_type]}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Paid by <strong style={{ color: 'var(--text-primary)' }}>
                {iPaid ? 'you' : expense.payer?.name}
              </strong> · {formatDate(expense.created_at)}
            </p>
          </div>

          {/* Amounts */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatCurrency(expense.total_amount)}
            </div>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: iPaid ? 'var(--accent-green)' : myOwed > 0 ? 'var(--accent-red)' : 'var(--text-muted)',
              marginTop: 2,
            }}>
              {iPaid ? `you lent ${formatCurrency(parseFloat(expense.total_amount) - myOwed)}` :
               myOwed > 0 ? `you owe ${formatCurrency(myOwed)}` : 'settled'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
