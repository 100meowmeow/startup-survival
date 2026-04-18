import { useState } from 'react';

const ROLE_INFO = {
  CEO: {
    emoji: '👑',
    color: '#60a5fa',
    description:
      'You control company direction. Tiebreaker votes are yours. If the company dies, you take extra blame on the leaderboard.',
    power:
      'Pivot the startup once. Fire a teammate for 60 seconds. Call All-Hands to boost morale.',
    weakness: 'All losses land harder on you. The team will blame you first.',
    tip: 'Watch your team carefully. Someone might be working against you.',
  },
  CFO: {
    emoji: '💰',
    color: '#4ade80',
    description:
      "You see financial info others can't. You approve big purchases. You can secretly build an emergency reserve — or secretly drain the company.",
    power:
      'Run financial models to preview events. Lock away emergency funds. Audit who spent what.',
    weakness:
      'If embezzlement is discovered, you lose half your leaderboard score permanently.',
    tip: 'The Audit Trail action is your best weapon against a Saboteur draining funds.',
  },
  CMO: {
    emoji: '📣',
    color: '#facc15',
    description:
      'You grow the user base faster than anyone. Marketing is your weapon. Spam too much and it backfires spectacularly.',
    power: 'Campaign Blasts, Brand Refreshes, and manufacturing viral moments.',
    weakness:
      'Overspamming triggers a reputation collapse — users churn 3x faster for 2 minutes.',
    tip: 'Stack your marketing channels. Each 500 users unlocks better conversion rates.',
  },
  CTO: {
    emoji: '💻',
    color: '#f472b6',
    description:
      "You build the product. Ship fast and break things, or build slow and stable. Tech debt is invisible until it isn't.",
    power:
      'Ship features, fix debt, and secretly plant bugs in competitor apps.',
    weakness:
      'Skipped bug fixes stack hidden debt. Too much and random crashes start happening.',
    tip: 'Ship 3 features in a row to build a Tech Moat — competitor attacks bounce off for 3 minutes.',
  },
  COO: {
    emoji: '⚙️',
    color: '#a78bfa',
    description:
      'You make everything run smoother over time. Hiring and automation compound into a massive late-game advantage.',
    power:
      'Automate actions to run passively. Hire NPCs. Use your one-time Saboteur audit.',
    weakness: 'Hire too fast and culture collapses — instant -20 morale.',
    tip: "Your Systems Audit is the most powerful tool in the game. Save it for when you're sure.",
  },
  'Head of Sales': {
    emoji: '🤝',
    color: '#fb923c',
    description:
      'You are the only role that directly generates revenue. Without you the company is just vibes and users.',
    power:
      'Cold calls, enterprise pitches, and flash sales that spike revenue instantly.',
    weakness:
      'Overpromising triggers refund waves that can wipe a full round of revenue.',
    tip: 'Make 10 cold calls and your success rate jumps from 30% to 60% permanently.',
  },
  'Community Manager': {
    emoji: '🫂',
    color: '#2dd4bf',
    description:
      'Everyone likes you. High morale under your watch triggers organic growth that costs nothing.',
    power:
      'Host AMAs, force a Town Hall that overrules the CEO, send personalized outreach.',
    weakness:
      'You cannot generate revenue alone. You need a team that builds something worth loving.',
    tip: "Keep morale above 80% and watch users grow on their own. Stack this with the CMO's channels.",
  },
};

const SABOTEUR_TIPS = [
  'Stay quiet early. Let the company build something worth destroying.',
  'Use Morale Drain sparingly — too many anonymous events raises suspicion.',
  'The CFO Audit Trail can expose you. Be careful around the CFO.',
  'If you defect and go solo, you lose your saboteur bonus. Stay hidden.',
  'Your biggest win is getting blamed on the wrong person.',
];

export default function RoleReveal({ playerData, onReady }) {
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const info = ROLE_INFO[playerData.role] || {
    emoji: '❓',
    color: '#888',
    description: 'Unknown role.',
    power: 'Unknown',
    weakness: 'Unknown',
    tip: 'Figure it out.',
  };

  function handleReveal() {
    setRevealed(true);
    let c = 10;
    setCountdown(c);
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(t);
      }
    }, 1000);
  }

  return (
    <div
      style={{
        maxWidth: 440,
        margin: '0 auto',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          color: '#555',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 24,
        }}
      >
        Your secret role — don't show anyone
      </p>

      {!revealed ? (
        <div>
          <div
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 16,
              padding: '3rem 2rem',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎴</div>
            <p style={{ color: '#888', fontSize: 14 }}>
              Tap to reveal your role
            </p>
            <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
              Make sure nobody is looking at your screen
            </p>
          </div>
          <button
            onClick={handleReveal}
            style={{
              width: '100%',
              padding: '14px',
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reveal My Role
          </button>
        </div>
      ) : (
        <div>
          {playerData.isSaboteur && (
            <div
              style={{
                background: '#1a0808',
                border: '1px solid #ff444440',
                borderRadius: 12,
                padding: '1rem',
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  color: '#ff4444',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                🐀 You are also a Saboteur
              </p>
              <p style={{ color: '#888', fontSize: 12 }}>
                {
                  SABOTEUR_TIPS[
                    Math.floor(Math.random() * SABOTEUR_TIPS.length)
                  ]
                }
              </p>
            </div>
          )}

          <div
            style={{
              background: '#1a1a1a',
              border: `1px solid ${info.color}40`,
              borderRadius: 16,
              padding: '1.5rem',
              marginBottom: 16,
              textAlign: 'left',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{info.emoji}</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: info.color }}>
                {playerData.role}
              </h2>
            </div>

            <p
              style={{
                fontSize: 13,
                color: '#aaa',
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              {info.description}
            </p>

            <div
              style={{
                background: '#111',
                borderRadius: 8,
                padding: '12px',
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Your powers
              </p>
              <p style={{ fontSize: 12, color: '#888' }}>{info.power}</p>
            </div>

            <div
              style={{
                background: '#111',
                borderRadius: 8,
                padding: '12px',
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: '#ff444480',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Your weakness
              </p>
              <p style={{ fontSize: 12, color: '#888' }}>{info.weakness}</p>
            </div>

            <div
              style={{ background: '#111', borderRadius: 8, padding: '12px' }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: '#4ade8080',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Pro tip
              </p>
              <p style={{ fontSize: 12, color: '#888' }}>{info.tip}</p>
            </div>
          </div>

          <button
            onClick={onReady}
            style={{
              width: '100%',
              padding: '14px',
              background: info.color,
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            I'm Ready → {countdown > 0 ? `(${countdown})` : ''}
          </button>

          <p style={{ color: '#444', fontSize: 11, marginTop: 12 }}>
            Your cover role shown to teammates:{' '}
            <strong style={{ color: '#666' }}>{playerData.role}</strong>
            {playerData.isSaboteur && (
              <span style={{ color: '#ff4444' }}>
                {' '}
                (they don't know you're also a Saboteur)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
