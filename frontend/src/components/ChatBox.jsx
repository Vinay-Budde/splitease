import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { messageAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/formatDate';
import { getAvatarColor } from './Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export default function ChatBox({ expenseId }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await messageAPI.getByExpense(expenseId);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [expenseId]);

  // Connect socket
  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('join_expense', expenseId);

    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        // avoid duplicates
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [expenseId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      expense_id: expenseId,
      message: text.trim(),
      user_id: user.id,
    });
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>💬</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Expense Chat</span>
        <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxHeight: 400,
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <p style={{ fontSize: 14 }}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === user?.id || msg.sender?.id === user?.id;
            const senderName = msg.sender?.name || 'Unknown';
            return (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                gap: 8,
                alignItems: 'flex-end',
              }}>
                {!isMe && (
                  <div className="avatar" style={{
                    width: 28, height: 28,
                    background: getAvatarColor(senderName),
                    fontSize: 11, flexShrink: 0,
                  }}>
                    {getInitials(senderName)}
                  </div>
                )}
                <div style={{
                  maxWidth: '70%',
                  background: isMe
                    ? 'linear-gradient(135deg, #1db954, #16a34a)'
                    : 'var(--bg-card)',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '10px 14px',
                  border: isMe ? 'none' : '1px solid var(--border)',
                }}>
                  {!isMe && (
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                      {senderName}
                    </p>
                  )}
                  <p style={{ fontSize: 14, color: 'white', lineHeight: 1.5 }}>
                    {msg.message}
                  </p>
                  <p style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                    {formatDateTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 10,
      }}>
        <input
          type="text"
          className="input"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '10px 16px' }}
          disabled={!text.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
