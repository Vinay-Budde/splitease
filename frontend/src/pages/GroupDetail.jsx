import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { groupAPI, expenseAPI, settlementAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ExpenseCard from '../components/ExpenseCard';
import MemberManager from '../components/MemberManager';
import BalanceSummary from '../components/BalanceSummary';
import { formatCurrency } from '../utils/formatCurrency';

const TABS = ['Expenses', 'Balances', 'Members', 'Settlements'];

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Expenses');

  useEffect(() => {
    loadGroup();
    loadExpenses();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'Balances') loadBalances();
    if (activeTab === 'Settlements') loadSettlements();
  }, [activeTab]);

  const loadGroup = async () => {
    try {
      const { data } = await groupAPI.getById(id);
      setGroup(data);
    } catch (err) {
      console.error('Failed to load group:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const { data } = await expenseAPI.getByGroup(id);
      setExpenses(data);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    }
  };

  const loadBalances = async () => {
    setBalancesLoading(true);
    try {
      const { data } = await groupAPI.getBalances(id);
      setBalances(data);
    } catch (err) {
      console.error('Failed to load balances:', err);
    } finally {
      setBalancesLoading(false);
    }
  };

  const loadSettlements = async () => {
    try {
      const { data } = await settlementAPI.getByGroup(id);
      setSettlements(data);
    } catch (err) {
      console.error('Failed to load settlements:', err);
    }
  };


  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseAPI.delete(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete expense');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  );

  if (!group) return (
    <div className="page-container">
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Group not found or access denied.</p>
        <Link to="/dashboard" className="btn-secondary" style={{ marginTop: 16, display: 'inline-flex' }}>
          ← Dashboard
        </Link>
      </div>
    </div>
  );

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + parseFloat(e.total_amount), 0);

  return (
    <div className="page-container">
      {/* Back button */}
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, marginBottom: 20, fontWeight: 500 }}>
        ← Dashboard
      </Link>

      {/* Group Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.1), rgba(139, 92, 246, 0.1))',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #1db954, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}>
              👥
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{group.name}</h1>
              {group.description && (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{group.description}</p>
              )}
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                {group.memberships?.length || 0} members · {expenses.length} expenses · Total: {formatCurrency(totalExpenseAmount)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              to={`/groups/${id}/expenses/new`}
              className="btn-primary"
              style={{ fontSize: 13 }}
            >
              + Add Expense
            </Link>
            <Link
              to={`/groups/${id}/settle`}
              className="btn-secondary"
              style={{ fontSize: 13 }}
            >
              Settle Up
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--border)',
        marginBottom: 24,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '10px 18px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === tab ? 'var(--accent-green)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--accent-green)' : '2px solid transparent',
              transition: 'color 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Expenses' && (
        <div>
          {expenses.length === 0 ? (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No expenses yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                Add the first expense to get started
              </p>
              <Link to={`/groups/${id}/expenses/new`} className="btn-primary">
                + Add Expense
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {expenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} onDelete={handleDeleteExpense} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Balances' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Simplified Balances</h2>
            <Link to={`/groups/${id}/settle`} className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}>
              Settle Up
            </Link>
          </div>
          <BalanceSummary balances={balances} loading={balancesLoading} />
        </div>
      )}

      {activeTab === 'Members' && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Group Members</h2>
          <MemberManager
            group={group}
            onUpdate={loadGroup}
            currentUserId={user?.id}
          />
        </div>
      )}

      {activeTab === 'Settlements' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Payment History</h2>
            <Link to={`/groups/${id}/settle`} className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}>
              + Record Payment
            </Link>
          </div>
          {settlements.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No payments recorded yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {settlements.map((s) => (
                <div key={s.id} className="glass-card fade-in" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>💸</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        <strong>{s.payer?.name}</strong> paid <strong>{s.payee?.name}</strong>
                      </p>
                      {s.note && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.note}</p>}
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-green)' }}>
                      {formatCurrency(s.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
