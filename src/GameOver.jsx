import { useState, useEffect } from 'react';
import ResultCard from './ResultCard';
import { sounds } from './sounds';

const TITLES = [
  {
    id: 'lazy_ceo',
    label: '😴 Laziest CEO',
    explanation:
      "You missed more decisions than anyone on your team. A CEO who isn't making calls isn't leading — they're spectating.",
    condition: (s) =>
      s.role === 'CEO' && s.log.filter((l) => l.includes('Event')).length < 3,
  },
  {
    id: 'corporate_rat',
    label: '🐀 Corporate Rat',
    explanation:
      'You were the Saboteur and successfully tanked the company without getting caught. In real life, toxic insiders cost companies billions.',
    condition: (s) => s.isSaboteur && !s.discovered,
  },
  {
    id: 'delusional',
    label: '🔮 Delusional Visionary',
    explanation:
      'You pivoted so many times the company lost all identity. Vision is valuable — but changing direction every five minutes means you never built anything.',
    condition: (s) => (s.stacks?.pivot || 0) >= 2,
  },
  {
    id: 'all_hype',
    label: '📣 All Hype No Product',
    explanation:
      'You grew a massive audience but generated almost no revenue. Users without monetization is just an expensive hobby.',
    condition: (s) => s.users > 2000 && s.money < 5000,
  },
  {
    id: 'worst_cfo',
    label: "💸 World's Worst CFO",
    explanation:
      "As CFO you're supposed to protect the money — instead you watched it disappear. Cash flow management is the number one reason startups die.",
    condition: (s) => s.role === 'CFO' && s.money < 2000,
  },
  {
    id: 'first_quit',
    label: '🏃 First to Quit',
    explanation:
      'You defected and abandoned your team. In real startups, co-founder breakups are one of the most common causes of company death.',
    condition: (s) => s.defected,
  },
  {
    id: 'shark_repellent',
    label: '🦈 Shark Repellent',
    explanation:
      "Your investor pitch was so bad the investor ran the other way. A good pitch isn't about selling — it's about showing you understand your own business.",
    condition: (s) => s.reason === 'pitch_rejected',
  },
  {
    id: 'paranoid',
    label: '😤 Most Paranoid',
    explanation:
      'You ran audit after audit, reversing decisions constantly. Some skepticism is healthy — but paralysis by analysis kills momentum.',
    condition: (s) => (s.stacks?.audit || 0) >= 3,
  },
  {
    id: 'clown',
    label: '🤡 Clown Founder',
    explanation:
      'You went bankrupt while chasing viral moments. Virality without fundamentals is a sugar rush — feels great until you crash.',
    condition: (s) => s.reason === 'bankrupt' && s.stacks?.viral > 0,
  },
  {
    id: 'ice_closer',
    label: '🧊 Ice Cold Closer',
    explanation:
      'You closed deal after deal without flinching. Sales is the engine of every business — without revenue, everything else is just a hobby.',
    condition: (s) => (s.stacks?.call || 0) >= 8,
  },
  {
    id: 'bot_energy',
    label: '🤖 Bot Energy',
    explanation:
      "You took more actions than any human reasonably should. High activity is great — but make sure you're doing the right things, not just the most things.",
    condition: (s) =>
      Object.values(s.stacks || {}).reduce((a, b) => a + b, 0) > 30,
  },
  {
    id: 'killed_it',
    label: '💀 Killed the Company',
    explanation:
      'As CEO, the final decision that ended the company was yours. Leadership means owning the outcomes — good and bad.',
    condition: (s) =>
      ['bankrupt', 'morale'].includes(s.reason) && s.role === 'CEO',
  },
  {
    id: 'mba_who',
    label: '🧑‍🎓 MBA Who?',
    explanation:
      'You aced every business question thrown at you. Real business knowledge compounds just like financial interest — keep learning.',
    condition: (s) => (s.stacks?.quiz_correct || 0) >= 8,
  },
  {
    id: 'actual_ceo',
    label: '👑 Actual CEO Material',
    explanation:
      "You led well, made smart calls, and the company survived. Great CEOs don't just have vision — they execute consistently under pressure.",
    condition: (s) =>
      s.reason === 'survived' && s.role === 'CEO' && s.money > 20000,
  },
  {
    id: 'ghost',
    label: '👻 Ghost Employee',
    explanation:
      "You were barely present. In a startup every single person has to pull weight — there's no room for passengers when the company is fighting to survive.",
    condition: (s) =>
      Object.values(s.stacks || {}).reduce((a, b) => a + b, 0) < 5,
  },
  {
    id: 'gambler',
    label: '🎰 Gambling Addict',
    explanation:
      'You chased high-risk plays constantly. Calculated risk is smart — but gambling with company resources without a plan is how founders end up broke.',
    condition: (s) => (s.stacks?.viral || 0) + (s.stacks?.plantbug || 0) >= 4,
  },
  {
    id: 'deep_cover',
    label: '🕵️ Deep Cover',
    explanation:
      'You were the Saboteur and survived undetected to the end. You understand how trust works — now imagine using those skills for good.',
    condition: (s) => s.isSaboteur && s.reason === 'survived',
  },
  {
    id: 'judas',
    label: '💔 Judas Award',
    explanation:
      'You betrayed your team AND outperformed them. Ruthless independence can work — but bridges you burn rarely rebuild themselves.',
    condition: (s) => s.defected && s.money > 20000,
  },
  {
    id: 'chess',
    label: '🧠 5D Chess Player',
    explanation:
      'You built a stacking chain so deep it compounded into a massive advantage. This is how the best founders think — systems, not one-off decisions.',
    condition: (s) => Object.values(s.stacks || {}).some((v) => v >= 8),
  },
  {
    id: 'first_mover',
    label: '🦅 First Mover',
    explanation:
      'You closed your investor pitch before anyone else. Speed matters in business — the best opportunities have short windows.',
    condition: (s) => (s.stacks?.pitch_practice || 0) >= 3,
  },
  {
    id: 'penny',
    label: '🧻 Penny Pincher',
    explanation:
      'You held onto cash like your life depended on it. Capital efficiency is a superpower — but eventually you have to spend to grow.',
    condition: (s) => s.money > 15000 && (s.stacks?.model || 0) >= 2,
  },
  {
    id: 'hypergrowth',
    label: '🚀 Hypergrowth Hero',
    explanation:
      'You scaled your user base to over 5,000. Growth like this attracts investors, press, and competitors — the real work starts now.',
    condition: (s) => s.users > 5000,
  },
  {
    id: 'vibes',
    label: '🌊 Vibes Only',
    explanation:
      'Your team loved working together but the bank account told a different story. Culture matters — but it has to be paired with a business model.',
    condition: (s) => s.morale >= 80 && s.money < 8000,
  },
  {
    id: 'machine',
    label: '⚙️ The Machine',
    explanation:
      'You automated everything you could. Systems thinking is what separates founders who scale from founders who burn out.',
    condition: (s) => (s.stacks?.automate || 0) >= 3,
  },
  {
    id: 'unicorn',
    label: '🦄 Unicorn Energy',
    explanation:
      "You hit $100k before the 7 minute mark. Only 0.006% of startups become unicorns — you're playing in that league.",
    condition: (s) => s.money > 100000,
  },
  {
    id: 'mad_scientist',
    label: '🧬 Mad Scientist',
    explanation:
      "You ran A/B test after A/B test. Data-driven founders make better decisions on average — but don't forget to actually ship something.",
    condition: (s) => (s.stacks?.ab || 0) >= 5,
  },
  {
    id: 'yes_man',
    label: '🫡 Yes Man',
    explanation:
      "You never once deviated from the consensus. Agreement keeps the peace but the best ideas often come from the person willing to say 'what if we did it differently?'",
    condition: (s) => s.reason === 'survived' && (s.stacks?.pivot || 0) === 0,
  },
  {
    id: 'self_destruct',
    label: '🧨 Self Destruct',
    explanation:
      'Your own flash sale strategy bankrupted you. Discounting too aggressively trains customers to never pay full price — a trap many founders fall into.',
    condition: (s) => s.reason === 'bankrupt' && (s.stacks?.sale || 0) > 2,
  },
  {
    id: 'pr_disaster',
    label: '📸 PR Disaster',
    explanation:
      'Your fake viral attempts kept backfiring publicly. Manufactured attention without substance erodes the trust real growth is built on.',
    condition: (s) => (s.stacks?.viral || 0) >= 2 && s.reason !== 'survived',
  },
  {
    id: 'comeback',
    label: '🌟 Comeback Kid',
    explanation:
      'You were nearly dead and pulled through anyway. Resilience is the most underrated founder skill — most people quit right before the turnaround.',
    condition: (s) =>
      s.reason === 'survived' && s.morale > 70 && s.money > 10000,
  },
  {
    id: 'diplomat',
    label: '🤝 The Diplomat',
    explanation:
      "You kept the team together through all-hands meetings and community AMAs. People follow leaders who make them feel heard — that's not soft, that's strategy.",
    condition: (s) => (s.stacks?.allhands || 0) + (s.stacks?.ama || 0) >= 5,
  },
  {
    id: 'innovative',
    label: '💡 Actually Innovative',
    explanation:
      'You shipped feature after feature and kept improving the product. Consistent product iteration is how companies like Apple and Notion built lasting businesses.',
    condition: (s) => (s.stacks?.ship || 0) + (s.stacks?.update || 0) >= 8,
  },
  {
    id: 'laser',
    label: '🎯 Laser Focused',
    explanation:
      'You picked a strategy and never deviated. Focus is a competitive advantage — most startups die from doing too many things, not too few.',
    condition: (s) => s.reason === 'survived' && (s.stacks?.call || 0) >= 5,
  },
  {
    id: 'too_nice',
    label: '😇 Too Nice to Win',
    explanation:
      "Maximum morale, minimum money. Being liked is great — being a pushover with the finances is how companies go broke while everyone's having a good time.",
    condition: (s) => s.morale === 100 && s.money < 5000,
  },
  {
    id: 'silent',
    label: '🐍 Silently Deadly',
    explanation:
      "You drained company resources repeatedly without ever being caught. In real life this is called embezzlement — it's a felony. In this game it's just impressive.",
    condition: (s) => s.isSaboteur && (s.stacks?.drain || 0) >= 3,
  },
  {
    id: 'overachiever',
    label: '🏅 Overachiever',
    explanation:
      'You hit every win condition simultaneously — cash, users, and morale all strong at the end. This is what a well-run startup actually looks like.',
    condition: (s) =>
      s.reason === 'survived' &&
      s.money > 50000 &&
      s.users > 3000 &&
      s.morale > 70,
  },
];

const DEATH_REASONS = {
  bankrupt: {
    title: '💸 You Went Bankrupt',
    msg: 'The money ran out. Classic.',
    color: '#ff4444',
  },
  morale: {
    title: '😵 Team Collapsed',
    msg: 'Everyone quit. A company is nothing without people.',
    color: '#ff4444',
  },
  acquired: {
    title: '🤝 Acquired!',
    msg: 'You sold the company. Not bad for a first run.',
    color: '#4ade80',
  },
  survived: {
    title: '🏆 You Survived!',
    msg: 'Against all odds, you made it to the end.',
    color: '#facc15',
  },
  default: { title: '💀 Game Over', msg: 'It happens.', color: '#888' },
};

function getTitle(stats) {
  for (const t of TITLES) {
    try {
      if (t.condition(stats)) return t.label;
    } catch {}
  }
  return '💀 Barely Survived';
}

function getScore(stats) {
  let score = 0;
  score += Math.floor(stats.money / 100);
  score += stats.users * 2;
  score += stats.morale * 10;
  if (stats.reason === 'survived') score += 500;
  if (stats.reason === 'acquired') score += 1000;
  if (stats.isSaboteur && stats.reason !== 'survived') score += 300;
  if (stats.defected) score += 200;
  score += Object.values(stats.stacks || {}).reduce((a, b) => a + b, 0) * 5;
  return Math.max(0, score);
}

export default function GameOver({ stats, playerData, gameConfig, onRestart }) {
  useEffect(() => {
    if (['survived', 'acquired'].includes(stats.reason)) sounds.win();
    else sounds.lose();
  }, []);
  const [paid, setPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const outcome = DEATH_REASONS[stats.reason] || DEATH_REASONS.default;
  const title = getTitle(stats);
  const score = getScore(stats);
  const fakeRank = Math.floor(Math.random() * 8) + 2;

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: outcome.color,
          marginBottom: 6,
        }}
      >
        {outcome.title}
      </h1>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 28 }}>
        {outcome.msg}
      </p>

      {/* Title card */}
      <div
        style={{
          background: '#1a1a1a',
          border: `1px solid ${outcome.color}30`,
          borderRadius: 14,
          padding: '1.5rem',
          marginBottom: 16,
        }}
      >
        <p
          style={{
            color: '#555',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          Your founder title
        </p>
        <p style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          {title}
        </p>
        <p
          style={{
            fontSize: 12,
            color: '#888',
            lineHeight: 1.6,
            marginBottom: 8,
          }}
        >
          {TITLES.find((t) => t.label === title)?.explanation ||
            'You played the game your way.'}
        </p>
        <p style={{ color: '#555', fontSize: 12 }}>
          {playerData?.name} · {playerData?.role}
        </p>
        {playerData?.isSaboteur && (
          <p style={{ color: '#ff4444', fontSize: 11, marginTop: 4 }}>
            🐀 Secret Saboteur
          </p>
        )}
      </div>

      {/* Stats */}
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
            style={{ background: '#111', borderRadius: 8, padding: '12px 8px' }}
          >
            <p style={{ fontSize: 18, margin: '0 0 4px' }}>{icon}</p>
            <p
              style={{
                color: '#555',
                fontSize: 10,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              {label}
            </p>
            <p
              style={{ fontWeight: 700, fontSize: 15, fontFamily: 'monospace' }}
            >
              {val}
            </p>
          </div>
        ))}
      </div>

      {/* Score + leaderboard tease */}
      <div
        style={{
          background: '#111',
          border: '0.5px solid #222',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: 16,
        }}
      >
        <p
          style={{
            color: '#555',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          Your score
        </p>
        <p
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: '#facc15',
            marginBottom: 8,
          }}
        >
          {score.toLocaleString()}
        </p>

        {!paid ? (
          <div>
            <div
              style={{
                background: '#1a1500',
                border: '0.5px solid #facc1530',
                borderRadius: 8,
                padding: '12px',
                marginBottom: 12,
              }}
            >
              <p
                style={{
                  color: '#facc15',
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                🏆 You ranked #{fakeRank} on the leaderboard
              </p>
              <p style={{ color: '#666', fontSize: 11 }}>
                Lock in your score to appear publicly
              </p>
            </div>
            <button
              onClick={() => setShowPaywall(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#facc15',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🏆 Lock In Score — $1.99
            </button>
          </div>
        ) : (
          <div
            style={{
              background: '#0a1a0a',
              border: '0.5px solid #4ade8030',
              borderRadius: 8,
              padding: '12px',
            }}
          >
            <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 700 }}>
              ✓ Score locked in! You're #{fakeRank} 🎉
            </p>
          </div>
        )}
      </div>

      {/* Paywall modal */}
      {showPaywall && (
        <div
          style={{
            background: '#1a1a1a',
            border: '1px solid #facc1540',
            borderRadius: 14,
            padding: '1.5rem',
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            Lock in your score
          </p>
          <p style={{ color: '#666', fontSize: 12, marginBottom: 16 }}>
            Your rank #{fakeRank} will appear on the public leaderboard forever.
            Brag rights included.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                setPaid(true);
                setShowPaywall(false);
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: '#facc15',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Pay $1.99
            </button>
            <button
              onClick={() => setShowPaywall(false)}
              style={{
                flex: 1,
                padding: '12px',
                background: '#222',
                color: '#666',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Maybe later
            </button>
          </div>
          <p style={{ color: '#444', fontSize: 10, marginTop: 10 }}>
            Stripe payment — secure checkout
          </p>
        </div>
      )}

      {/* Shareable result card */}
      <ResultCard
        stats={stats}
        playerData={playerData}
        title={title}
        score={score}
        gameConfig={gameConfig}
      />

      {/* Paid features */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: '#111',
            border: '0.5px solid #a78bfa30',
            borderRadius: 10,
            padding: '12px',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
            🧠 AI Debrief
          </p>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
            Full analysis of your decisions
          </p>
          <button
            style={{
              width: '100%',
              padding: '8px',
              background: '#a78bfa20',
              color: '#a78bfa',
              border: '0.5px solid #a78bfa40',
              borderRadius: 6,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            $1.99
          </button>
        </div>
        <div
          style={{
            background: '#111',
            border: '0.5px solid #60a5fa30',
            borderRadius: 10,
            padding: '12px',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
            🎖️ Ranked Badge
          </p>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
            Shareable ranked mode badge
          </p>
          <button
            style={{
              width: '100%',
              padding: '8px',
              background: '#60a5fa20',
              color: '#60a5fa',
              border: '0.5px solid #60a5fa40',
              borderRadius: 6,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            $2.99
          </button>
        </div>
      </div>

      <button
        onClick={onRestart}
        style={{
          width: '100%',
          padding: '14px',
          background: '#ff4444',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        Play Again →
      </button>

      <p style={{ color: '#333', fontSize: 11 }}>
        Share your title and challenge someone to beat it.
      </p>
    </div>
  );
}
