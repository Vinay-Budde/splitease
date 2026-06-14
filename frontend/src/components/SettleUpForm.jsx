import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI, settlementAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { getAvatarColor } from './Navbar';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export default function SettleUpForm() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState([]);
  const [form, setForm] = useState({ paid_to: '', amount: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [gRes, bRes] = await Promise.all([
          groupAPI.getById(groupId),
          groupAPI.getBalances(groupId),
        ]);
        setGroup(gRes.data);
        setBalances(bRes.data);

        // Pre-fill if there's a balance where current user owes someone
        const myDebt = bRes.data.find((b) => b.from?.id === user?.id);
        if (myDebt) {
          setForm((f) => ({
            ...f,
            paid_to: String(myDebt.to?.id),
            amount: String(myDebt.amount),
          }));
        }
      } catch (err) {
        setError('Failed to load group data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.paid_to || !form.amount) {
      setError('Please select a recipient and enter an amount');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await settlementAPI.create(groupId, {
        paid_to: parseInt(form.paid_to),
        amount: parseFloat(form.amount),
        note: form.note || null,
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  );

  const members = (group?.memberships || []).filter((m) => m.user_id !== user?.id);

  return (
    <div className="page-container" style={{ maxWidth: 520 }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: 24, padding: '8px 16px', fontSize: 13 }}>
        ← Back
      </button>

      <div className="glass-card" style={{ padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Settle Up</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          Record a payment in <strong style={{ color: 'var(--text-primary)' }}>{group?.name}</strong>
        </p>

        {/* Current balances hint */}
        {balances.filter((b) => b.from?.id === user?.id).length > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>
              You owe:
            </p>
            {balances.filter((b) => b.from?.id === user?.id).map((b, i) => (
              <p key={i} style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                {formatCurrency(b.amount)} to <strong>{b.to?.name}</strong>
              </p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Pay to */}
          <div>
            <label className="label">Pay to *</label>
            <select
              className="input"
              value={form.paid_to}
              onChange={(e) => setForm({ ...form, paid_to: e.target.value })}
              required
            >
              <option value="">Select member...</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.user?.name} ({m.user?.email})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount (₹) *</label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="label">Note (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. UPI payment, Cash..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#ef4444',
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '12px 24px', marginTop: 8 }}>
            {submitting ? 'Recording...' : '✓ Record Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}
