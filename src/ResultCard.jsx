import { useRef } from 'react';

const ROLE_COLORS = {
  CEO: '#60a5fa',
  CFO: '#4ade80',
  CMO: '#facc15',
  CTO: '#f472b6',
  COO: '#a78bfa',
  'Head of Sales': '#fb923c',
  'Community Manager': '#2dd4bf',
};

const DIFFICULTY_COLORS = {
  intern: '#4ade80',
  founder: '#fff',
  veteran: '#fb923c',
  shark: '#ff4444',
};

const DIFFICULTY_LABELS = {
  intern: '🎓 Intern',
  founder: '🚀 Founder',
  veteran: '⚡ Veteran',
  shark: '🦈 Shark',
};

export default function ResultCard({
  stats,
  playerData,
  title,
  score,
  gameConfig,
}) {
  const cardRef = useRef(null);

  const roleColor = ROLE_COLORS[playerData?.role] || '#888';
  const diffColor = DIFFICULTY_COLORS[stats.difficulty] || '#fff';
  const diffLabel = DIFFICULTY_LABELS[stats.difficulty] || '🚀 Founder';

  const reasonEmojis = {
    bankrupt: '💸',
    morale: '😵',
    acquired: '🤝',
    survived: '🏆',
  };

  const reasonLabels = {
    bankrupt: 'Went Bankrupt',
    morale: 'Team Collapsed',
    acquired: 'Got Acquired',
    survived: 'Survived',
  };

  function copyToClipboard() {
    const text = `🏢 Startup Survival\n\n${title}\n\n💰 $${stats.money.toLocaleString()} · 👥 ${
      stats.users
    } users · 😊 ${
      stats.morale
    }% morale\n\n📊 Score: ${score.toLocaleString()}\n🎭 Role: ${
      playerData?.role
    }\n🏢 Scenario: ${
      stats.scenario
    }\n${diffLabel}\n\nPlay at: startupsurvival.app`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Result copied to clipboard! Share it anywhere.');
      })
      .catch(() => {
        alert('Copy failed — screenshot the card instead!');
      });
  }

  return (
    <div>
      {/* The card itself */}
      <div
        ref={cardRef}
        style={{
          background: '#0a0a0a',
          border: '1px solid #222',
          borderRadius: 16,
          padding: '1.5rem',
          marginBottom: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            background: roleColor,
            borderRadius: '50%',
            opacity: 0.06,
            filter: 'blur(30px)',
          }}
        />

        {/* Top row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                color: '#444',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              Startup Survival
            </p>
            <p style={{ fontSize: 11, color: diffColor }}>{diffLabel}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, color: '#444', marginBottom: 2 }}>
              Final Score
            </p>
            <p
              style={{
                fontSize: 24,
                fontWeight: 700,
                fontFamily: 'monospace',
                color: '#facc15',
              }}
            >
              {score.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            marginBottom: 16,
            padding: '12px',
            background: '#111',
            borderRadius: 10,
            border: `0.5px solid ${roleColor}30`,
          }}
        >
          <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {title}
          </p>
          <p style={{ fontSize: 11, color: '#555' }}>
            {playerData?.name} ·{' '}
            <span style={{ color: roleColor }}>{playerData?.role}</span>
          </p>
          {playerData?.isSaboteur && (
            <p style={{ fontSize: 10, color: '#ff4444', marginTop: 2 }}>
              🐀 Was the Saboteur
            </p>
          )}
        </div>

        {/* Outcome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            padding: '8px 12px',
            background: '#111',
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 20 }}>
            {reasonEmojis[stats.reason] || '💀'}
          </span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {reasonLabels[stats.reason] || 'Game Over'}
            </p>
            <p style={{ fontSize: 10, color: '#555' }}>{stats.scenario}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {[
            ['💰', 'Cash', `$${stats.money.toLocaleString()}`],
            ['👥', 'Users', stats.users.toLocaleString()],
            ['😊', 'Morale', `${stats.morale}%`],
          ].map(([icon, label, val]) => (
            <div
              key={label}
              style={{
                background: '#111',
                borderRadius: 8,
                padding: '10px 8px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 16, marginBottom: 2 }}>{icon}</p>
              <p
                style={{
                  fontSize: 9,
                  color: '#444',
                  textTransform: 'uppercase',
                  marginBottom: 3,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: '#fff',
                }}
              >
                {val}
              </p>
            </div>
          ))}
        </div>

        {/* Stacks highlight */}
        {Object.keys(stats.stacks || {}).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontSize: 9,
                color: '#333',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              Best stacks built
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {Object.entries(stats.stacks || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([k, v]) => (
                  <span
                    key={k}
                    style={{
                      fontSize: 10,
                      background: '#4ade8010',
                      color: '#4ade80',
                      padding: '2px 8px',
                      borderRadius: 4,
                      border: '0.5px solid #4ade8020',
                    }}
                  >
                    {k} ×{v}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            borderTop: '0.5px solid #1a1a1a',
            paddingTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={{ fontSize: 10, color: '#333' }}>startupsurvival.app</p>
          <p style={{ fontSize: 10, color: '#333' }}>Can you beat this?</p>
        </div>
      </div>

      {/* Share buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <button
          onClick={copyToClipboard}
          style={{
            padding: '11px',
            background: '#1a1a1a',
            border: '0.5px solid #333',
            borderRadius: 10,
            color: '#aaa',
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          📋 Copy Result
        </button>
        <button onClick={() => {
          const text = encodeURIComponent(`I just got "${title}" in Startup Survival!\n\n💰 $${stats.money?.toLocaleString()} · 👥 ${stats.users} users · 😊 ${Math.round(stats.morale)}% morale\nScore: ${score.toLocaleString()} · ${stats.scenario}\n\nCan you beat me? 🏢\n\n${window.location.origin}`);
          window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
        }}
          style={{
            padding: '11px',
            background: '#000',
            border: '0.5px solid #333',
            borderRadius: 10,
            color: '#fff',
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          𝕏 Share on X
        </button>
      </div>

      <button onClick={() => {
        const text = encodeURIComponent(`I got "${title}" in Startup Survival!\n\n💰 $${stats.money?.toLocaleString()} · 👥 ${stats.users} users · 😊 ${Math.round(stats.morale)}% morale\nScore: ${score.toLocaleString()}\n\nPlay here: ${window.location.origin}`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
      }}
        style={{
          width: '100%',
          padding: '11px',
          background: '#1a3a1a',
          border: '0.5px solid #4ade8030',
          borderRadius: 10,
          color: '#4ade80',
          fontSize: 12,
          cursor: 'pointer',
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        💬 Share on WhatsApp
      </button>
    </div>
  );
}
