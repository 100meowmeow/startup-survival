import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';

export default function Chat({ roomCode, playerName, playerRole, isSaboteur }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!roomCode || roomCode === 'SOLO') return;
    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    const unsub = onValue(chatRef, (snap) => {
      if (snap.exists()) {
        const data = Object.values(snap.val()).sort(
          (a, b) => a.timestamp - b.timestamp
        );
        setMessages(data);
        if (!open)
          setUnread(
            (prev) => prev + Math.max(0, data.length - prevCountRef.current)
          );
        prevCountRef.current = data.length;
      }
    });
    return () => unsub();
  }, [roomCode, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  async function sendMessage() {
    if (!input.trim() || !roomCode || roomCode === 'SOLO') return;
    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    await push(chatRef, {
      text: input.trim(),
      name: playerName,
      role: playerRole,
      timestamp: Date.now(),
    });
    setInput('');
  }

  const ROLE_COLORS = {
    CEO: '#60a5fa',
    CFO: '#4ade80',
    CMO: '#facc15',
    CTO: '#f472b6',
    COO: '#a78bfa',
    'Head of Sales': '#fb923c',
    'Community Manager': '#2dd4bf',
  };

  const QUICK_MESSAGES = [
    "Who's the saboteur? 👀",
    "I'm NOT the rat 🐀",
    'We need to pitch NOW',
    'Check the audit trail',
    'Money is going missing...',
    'I defected. Good luck. 😈',
    'This is fine 🔥',
  ];

  if (roomCode === 'SOLO') return null;

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      {open && (
        <div
          style={{
            width: 280,
            height: 380,
            background: '#0f0f0f',
            border: '0.5px solid #333',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 10,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '0.5px solid #1a1a1a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              💬 Team Chat
            </p>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#555',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {messages.length === 0 && (
              <p
                style={{
                  color: '#333',
                  fontSize: 11,
                  textAlign: 'center',
                  marginTop: 20,
                }}
              >
                No messages yet. Say something.
              </p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.name === playerName;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  {!isMe && (
                    <p
                      style={{
                        fontSize: 9,
                        color: ROLE_COLORS[msg.role] || '#888',
                        marginBottom: 2,
                        paddingLeft: 4,
                      }}
                    >
                      {msg.name} · {msg.role}
                    </p>
                  )}
                  <div
                    style={{
                      background: isMe ? '#ff4444' : '#1a1a1a',
                      color: '#fff',
                      borderRadius: isMe
                        ? '12px 12px 2px 12px'
                        : '12px 12px 12px 2px',
                      padding: '7px 10px',
                      maxWidth: '80%',
                      fontSize: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Quick messages */}
          <div
            style={{
              padding: '6px 10px',
              borderTop: '0.5px solid #1a1a1a',
              overflowX: 'auto',
              display: 'flex',
              gap: 6,
              scrollbarWidth: 'none',
            }}
          >
            {QUICK_MESSAGES.map((qm, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(qm);
                }}
                style={{
                  background: '#1a1a1a',
                  border: '0.5px solid #333',
                  borderRadius: 20,
                  padding: '3px 8px',
                  fontSize: 10,
                  color: '#888',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {qm}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '8px 10px',
              borderTop: '0.5px solid #1a1a1a',
              display: 'flex',
              gap: 6,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                background: '#1a1a1a',
                border: '0.5px solid #333',
                borderRadius: 8,
                padding: '7px 10px',
                color: '#fff',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: '7px 12px',
                background: '#ff4444',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#ff4444',
          border: 'none',
          cursor: 'pointer',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginLeft: 'auto',
        }}
      >
        💬
        {unread > 0 && !open && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#facc15',
              color: '#000',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unread}
          </div>
        )}
      </button>
    </div>
  );
}
