import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatCurrency';

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal', icon: '⚖️', desc: 'Split equally among all members' },
  { value: 'unequal', label: 'Unequal', icon: '✏️', desc: 'Enter exact amount for each person' },
  { value: 'percentage', label: 'Percentage', icon: '%', desc: 'Enter % share for each person' },
  { value: 'shares', label: 'Shares', icon: '🎲', desc: 'Enter share units (e.g. 1, 2, 3...)' },
];

export default function SplitForm({ members, totalAmount, splitType, onSplitTypeChange, onSplitsChange }) {
  const [splits, setSplits] = useState({});

  useEffect(() => {
    // Reset splits when members or split type changes
    const initial = {};
    members.forEach((m) => {
      initial[m.user_id] = splitType === 'equal' ? '' : splitType === 'shares' ? '1' : '';
    });
    setSplits(initial);
  }, [members.map((m) => m.user_id).join(','), splitType]);

  useEffect(() => {
    // Build splits array for parent
    const splitsArray = members.map((m) => ({
      user_id: m.user_id,
      value: splits[m.user_id] || '0',
    }));
    onSplitsChange(splitsArray);
  }, [splits]);

  const updateSplit = (userId, value) => {
    setSplits((prev) => ({ ...prev, [userId]: value }));
  };

  const total = parseFloat(totalAmount) || 0;

  // Validation hints
  const getValidationMsg = () => {
    if (splitType === 'equal') return null;
    if (splitType === 'unequal') {
      const sum = Object.values(splits).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
      const diff = Math.abs(sum - total);
      if (diff > 0.01) return { ok: false, msg: `Sum: ${formatCurrency(sum)} / Total: ${formatCurrency(total)} (diff: ${formatCurrency(diff)})` };
      return { ok: true, msg: `✓ Sum matches total (${formatCurrency(sum)})` };
    }
    if (splitType === 'percentage') {
      const sum = Object.values(splits).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
      if (Math.abs(sum - 100) > 0.01) return { ok: false, msg: `Total: ${sum.toFixed(1)}% (must be 100%)` };
      return { ok: true, msg: `✓ Total is 100%` };
    }
    if (splitType === 'shares') {
      const totalShares = Object.values(splits).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
      if (totalShares <= 0) return { ok: false, msg: 'Total shares must be > 0' };
      return { ok: true, msg: `Total shares: ${totalShares}` };
    }
    return null;
  };

  const getPreviewAmount = (userId) => {
    if (!total) return null;
    if (splitType === 'equal') return total / members.length;
    if (splitType === 'unequal') return parseFloat(splits[userId] || 0);
    if (splitType === 'percentage') {
      const pct = parseFloat(splits[userId] || 0);
      return (pct / 100) * total;
    }
    if (splitType === 'shares') {
      const totalShares = Object.values(splits).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
      if (!totalShares) return 0;
      return (parseFloat(splits[userId] || 0) / totalShares) * total;
    }
    return null;
  };

  const validation = getValidationMsg();

  return (
    <div>
      {/* Split type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
        {SPLIT_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onSplitTypeChange(type.value)}
            style={{
              background: splitType === type.value
                ? 'linear-gradient(135deg, rgba(29, 185, 84, 0.2), rgba(139, 92, 246, 0.2))'
                : 'var(--bg-secondary)',
              border: `1px solid ${splitType === type.value ? 'rgba(29, 185, 84, 0.5)' : 'var(--border)'}`,
              borderRadius: 10,
              padding: '10px 8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{type.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: splitType === type.value ? 'var(--accent-green)' : 'var(--text-muted)' }}>
              {type.label}
            </div>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        {SPLIT_TYPES.find((t) => t.value === splitType)?.desc}
      </p>

      {/* Per-member inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map((m) => {
          const preview = getPreviewAmount(m.user_id);
          return (
            <div key={m.user_id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--bg-secondary)',
              borderRadius: 10,
              padding: '10px 14px',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {(m.name || m.user?.name || '?')[0].toUpperCase()}
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                {m.name || m.user?.name}
              </span>

              {splitType !== 'equal' ? (
                <input
                  type="number"
                  min="0"
                  step={splitType === 'shares' ? '1' : '0.01'}
                  value={splits[m.user_id] || ''}
                  onChange={(e) => updateSplit(m.user_id, e.target.value)}
                  style={{
                    width: 90,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    textAlign: 'right',
                  }}
                  placeholder={splitType === 'percentage' ? '0%' : splitType === 'shares' ? '1' : '0.00'}
                />
              ) : null}

              {preview !== null && (
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--accent-green)',
                  minWidth: 80,
                  textAlign: 'right',
                }}>
                  {formatCurrency(preview)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation */}
      {validation && (
        <p style={{
          marginTop: 10,
          fontSize: 12,
          fontWeight: 600,
          color: validation.ok ? 'var(--accent-green)' : '#ef4444',
        }}>
          {validation.msg}
        </p>
      )}
    </div>
  );
}
