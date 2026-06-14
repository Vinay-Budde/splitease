import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { groupAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GroupCard from '../components/GroupCard';
import { getAvatarColor } from '../components/Navbar';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const { data } = await groupAPI.getAll();
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const { data } = await groupAPI.create(newGroup);
      setShowModal(false);
      setNewGroup({ name: '', description: '' });
      navigate(`/groups/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-container">
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.1), rgba(139, 92, 246, 0.1))',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '32px 36px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <div className="avatar" style={{
          width: 64, height: 64,
          background: getAvatarColor(user?.name || ''),
          fontSize: 24,
        }}>
          {getInitials(user?.name || '')}
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Here are all your expense groups.
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            id="create-group-btn"
            className="btn-primary"
            onClick={() => setShowModal(true)}
            style={{ padding: '12px 24px' }}
          >
            + New Group
          </button>
        </div>
      </div>

      {/* Groups grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" />
        </div>
      ) : groups.length === 0 ? (
        <div className="glass-card" style={{ padding: 64, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌟</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No groups yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Create your first group to start splitting expenses!
          </p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Create a Group
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
              Your Groups
              <span style={{
                marginLeft: 10,
                background: 'var(--bg-card)',
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 13,
                color: 'var(--text-muted)',
              }}>
                {groups.length}
              </span>
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      )}

      {/* Create group modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: 24,
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 440, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Create New Group</h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 20, lineHeight: 1,
              }}>✕</button>
            </div>

            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Group Name *</label>
                <input
                  id="group-name-input"
                  type="text"
                  className="input"
                  placeholder="e.g. Goa Trip, Apartment, Team Lunch"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="What's this group for?"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                />
              </div>

              {error && (
                <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating} style={{ flex: 1 }}>
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
