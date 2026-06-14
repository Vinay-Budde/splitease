import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { expenseAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { getAvatarColor } from '../components/Navbar';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const SPLIT_TYPE_LABELS = {
  equal: 'Equal Split',
  unequal: 'Unequal Split',
  percentage: 'Percentage Split',
  shares: 'Shares Split',
};

export default function ExpenseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await expenseAPI.getById(id);
        setExpense(data);
      } catch (err) {
        console.error('Failed to load expense:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await expenseAPI.delete(id);
      navigate(`/groups/${expense.group_id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete expense');
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  );

  if (!expense) return (
    <div className="page-container">
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Expense not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginTop: 16 }}>
          ← Go Back
        </button>
      </div>
    </div>
  );

  const myShare = expense.splits?.find((s) => s.user_id === user?.id);
  const myOwed = myShare ? parseFloat(myShare.owed_amount) : 0;
  const iPaid = expense.paid_by === user?.id;
  const isCreator = expense.created_by === user?.id;

  return (
    <div className="page-container" style={{ maxWidth: 960 }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: 24, padding: '8px 16px', fontSize: 13 }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Left: Expense detail */}
        <div>
          {/* Header card */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{expense.description}</h1>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span className="badge badge-purple">{SPLIT_TYPE_LABELS[expense.split_type]}</span>
                  {expense.group && (
                    <Link to={`/groups/${expense.group_id}`} style={{ textDecoration: 'none' }}>
                      <span className="badge badge-amber">{expense.group.name}</span>
                    </Link>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  Added by {expense.creator?.name} · {formatDate(expense.created_at)}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCurrency(expense.total_amount)}
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 700, marginTop: 4,
                  color: iPaid ? 'var(--accent-green)' : myOwed > 0 ? '#ef4444' : 'var(--text-muted)',
                }}>
                  {iPaid
                    ? `you paid (lent ${formatCurrency(parseFloat(expense.total_amount) - myOwed)})`
                    : myOwed > 0
                    ? `you owe ${formatCurrency(myOwed)}`
                    : '✓ settled'}
                </div>
              </div>
            </div>

            {/* Payer info */}
            <div style={{
              marginTop: 20,
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div className="avatar" style={{
                width: 40, height: 40,
                background: getAvatarColor(expense.payer?.name || ''),
                fontSize: 14,
              }}>
                {getInitials(expense.payer?.name || '?')}
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paid by</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {iPaid ? 'You' : expense.payer?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Splits */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Split Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(expense.splits || []).map((split) => {
                const isMe = split.user_id === user?.id;
                return (
                  <div key={split.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: isMe ? 'rgba(29, 185, 84, 0.05)' : 'var(--bg-secondary)',
                    borderRadius: 10,
                    border: isMe ? '1px solid rgba(29, 185, 84, 0.2)' : '1px solid var(--border)',
                  }}>
                    <div className="avatar" style={{
                      width: 34, height: 34,
                      background: getAvatarColor(split.user?.name || ''),
                      fontSize: 12,
                    }}>
                      {getInitials(split.user?.name || '?')}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {split.user?.name}{isMe ? ' (you)' : ''}
                    </span>
                    {split.share_value !== null && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {expense.split_type === 'percentage' ? `${split.share_value}%` : `${split.share_value} shares`}
                      </span>
                    )}
                    <span style={{ fontSize: 15, fontWeight: 700, color: isMe && !iPaid ? '#ef4444' : 'var(--text-primary)' }}>
                      {formatCurrency(split.owed_amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delete */}
          {(isCreator || expense.group?.created_by === user?.id) && (
            <button
              onClick={handleDelete}
              className="btn-danger"
              disabled={deleting}
              style={{ width: '100%' }}
            >
              {deleting ? 'Deleting...' : '🗑 Delete Expense'}
            </button>
          )}
        </div>

        {/* Right: Chat */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <ChatBox expenseId={parseInt(id)} />
        </div>
      </div>
    </div>
  );
}
