import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI, expenseAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SplitForm from '../components/SplitForm';
import { formatCurrency } from '../utils/formatCurrency';

export default function NewExpense() {
  const { id: groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [form, setForm] = useState({
    description: '',
    total_amount: '',
    paid_by: '',
    split_type: 'equal',
  });
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await groupAPI.getById(groupId);
        setGroup(data);
        // Default: current user is payer
        setForm((f) => ({ ...f, paid_by: String(user?.id || '') }));
      } catch (err) {
        setError('Failed to load group');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId, user]);

  const members = (group?.memberships || []).map((m) => ({
    user_id: m.user_id,
    name: m.user?.name || 'Unknown',
    email: m.user?.email,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.description || !form.total_amount || !form.paid_by) {
      setError('Please fill all required fields');
      return;
    }

    const totalAmount = parseFloat(form.total_amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    // Validate splits
    if (form.split_type !== 'equal' && splits.length === 0) {
      setError('Please configure splits');
      return;
    }

    setSubmitting(true);
    try {
      await expenseAPI.create(groupId, {
        description: form.description,
        total_amount: totalAmount,
        paid_by: parseInt(form.paid_by),
        split_type: form.split_type,
        splits: form.split_type === 'equal'
          ? members.map((m) => ({ user_id: m.user_id, value: 0 }))
          : splits,
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: 24, padding: '8px 16px', fontSize: 13 }}>
        ← Back
      </button>

      <div className="glass-card" style={{ padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Add Expense</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          Add a new expense to <strong style={{ color: 'var(--text-primary)' }}>{group?.name}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <input
              id="expense-description"
              type="text"
              className="input"
              placeholder="e.g. Hotel booking, Dinner, Fuel..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="label">Total Amount (₹) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--accent-green)', fontWeight: 700, fontSize: 16,
              }}>₹</span>
              <input
                id="expense-amount"
                type="number"
                className="input"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.total_amount}
                onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                required
                style={{ paddingLeft: 32 }}
              />
            </div>
          </div>

          {/* Paid by */}
          <div>
            <label className="label">Paid by *</label>
            <select
              id="expense-paid-by"
              className="input"
              value={form.paid_by}
              onChange={(e) => setForm({ ...form, paid_by: e.target.value })}
              required
            >
              <option value="">Select who paid...</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name}{m.user_id === user?.id ? ' (you)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <hr className="divider" />

          {/* Split form */}
          <div>
            <label className="label" style={{ marginBottom: 12, fontSize: 14 }}>Split Type</label>
            <SplitForm
              members={members}
              totalAmount={form.total_amount}
              splitType={form.split_type}
              onSplitTypeChange={(type) => setForm({ ...form, split_type: type })}
              onSplitsChange={setSplits}
            />
          </div>

          {/* Summary */}
          {form.total_amount && parseFloat(form.total_amount) > 0 && (
            <div style={{
              background: 'rgba(29, 185, 84, 0.08)',
              border: '1px solid rgba(29, 185, 84, 0.2)',
              borderRadius: 10,
              padding: '12px 16px',
            }}>
              <p style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 600 }}>
                Total: {formatCurrency(parseFloat(form.total_amount))} split among {members.length} members
              </p>
            </div>
          )}

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

          <button
            id="create-expense-btn"
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ padding: '12px 24px' }}
          >
            {submitting ? 'Adding...' : '+ Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
