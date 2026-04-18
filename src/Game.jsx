import Chat from './Chat';
import { sounds } from './sounds';
import Activity, { ACTIVITY_MAP } from './Activity';
import { useState, useEffect, useRef } from 'react';
import { getEventsForScenario } from './events';

const QUIZ_QUESTIONS = [
  {
    q: "What does 'burn rate' mean?",
    options: [
      "How fast you're spending money",
      'How hot your servers run',
      'Your marketing spend only',
      'Revenue growth rate',
    ],
    correct: 0,
    stat: 'money',
    amount: 1000,
    lesson:
      'Burn rate is how fast a startup spends its cash reserves. Critical to track.',
  },
  {
    q: "What is a 'pivot' in startup terms?",
    options: [
      'A new office layout',
      'Changing core business strategy',
      'Hiring a new CEO',
      'Raising a funding round',
    ],
    correct: 1,
    stat: 'morale',
    amount: 10,
    lesson:
      'A pivot is a fundamental strategy change — like Instagram pivoting from check-ins to photos.',
  },
  {
    q: 'What does CAC stand for?',
    options: [
      'Customer Acquisition Cost',
      'Capital Asset Cost',
      'Company Annual Cashflow',
      'Customer Average Cart',
    ],
    correct: 0,
    stat: 'money',
    amount: 1500,
    lesson:
      'CAC is what you spend to acquire one customer. If CAC > LTV, you lose money on every customer.',
  },
  {
    q: "What is 'product-market fit'?",
    options: [
      'Having a great product design',
      'When your product solves a real need at scale',
      'Selling to the right market',
      'Having positive reviews',
    ],
    correct: 1,
    stat: 'users',
    amount: 300,
    lesson:
      'Product-market fit is when your product grows itself because users genuinely need it.',
  },
  {
    q: 'What does LTV stand for?',
    options: [
      'Long Term Value',
      'Lifetime Value',
      'Leverage Total Value',
      'Last Transaction Value',
    ],
    correct: 1,
    stat: 'money',
    amount: 1500,
    lesson:
      'LTV is the total revenue you expect from one customer over their lifetime with you.',
  },
  {
    q: "What is a 'runway' in startup terms?",
    options: [
      'Your go-to-market plan',
      'How long until you run out of money',
      'Your hiring pipeline',
      'Time to first revenue',
    ],
    correct: 1,
    stat: 'morale',
    amount: 10,
    lesson:
      'Runway = cash in bank / monthly burn rate. Most startups need 18+ months of runway.',
  },
  {
    q: "What is 'churn rate'?",
    options: [
      'How fast you hire',
      'How fast customers leave',
      'Revenue growth speed',
      'How fast you ship features',
    ],
    correct: 1,
    stat: 'users',
    amount: 500,
    lesson:
      'Churn is the % of customers who cancel. Even 5% monthly churn means losing half your users in a year.',
  },
  {
    q: 'What does B2B mean?',
    options: [
      'Business to Browser',
      'Back to Basics',
      'Business to Business',
      'Build to Buy',
    ],
    correct: 2,
    stat: 'money',
    amount: 1000,
    lesson:
      'B2B means selling to other businesses. Usually higher prices but longer sales cycles.',
  },
  {
    q: "What is 'bootstrapping'?",
    options: [
      'Building with no funding',
      'Copying a competitor',
      'Going viral organically',
      'Building fast with no planning',
    ],
    correct: 0,
    stat: 'money',
    amount: 2000,
    lesson:
      'Bootstrapping means funding from revenue, not investors. Slower but you keep more equity.',
  },
  {
    q: "What is 'equity'?",
    options: [
      "Your company's debt",
      'Ownership stake in a company',
      'Monthly revenue',
      'Credit line',
    ],
    correct: 1,
    stat: 'morale',
    amount: 15,
    lesson:
      'Equity is ownership. Giving equity means giving up a % of the company forever.',
  },
  {
    q: 'What does ARR stand for?',
    options: [
      'Annual Revenue Rate',
      'Annual Recurring Revenue',
      'Average Refund Rate',
      'Adjusted Revenue Ratio',
    ],
    correct: 1,
    stat: 'money',
    amount: 2000,
    lesson:
      'ARR is Annual Recurring Revenue — the predictable revenue a subscription business generates per year.',
  },
  {
    q: "What is a 'term sheet'?",
    options: [
      'A hiring contract',
      'An investment offer document',
      'A product roadmap',
      'A legal settlement',
    ],
    correct: 1,
    stat: 'money',
    amount: 1500,
    lesson:
      "A term sheet outlines the terms of an investment. It's step one of a funding round.",
  },
];

const ROLE_COLORS = {
  CEO: '#60a5fa',
  CFO: '#4ade80',
  CMO: '#facc15',
  CTO: '#f472b6',
  COO: '#a78bfa',
  'Head of Sales': '#fb923c',
  'Community Manager': '#2dd4bf',
};

const DIFFICULTY_SETTINGS = {
  intern: {
    label: '🎓 Intern',
    startMoney: 15000,
    eventInterval: 50,
    consequenceMultiplier: 0.5,
    tint: '#4ade8008',
  },
  founder: {
    label: '🚀 Founder',
    startMoney: 10000,
    eventInterval: 35,
    consequenceMultiplier: 1.0,
    tint: 'transparent',
  },
  veteran: {
    label: '⚡ Veteran',
    startMoney: 7500,
    eventInterval: 25,
    consequenceMultiplier: 1.25,
    tint: '#fb923c08',
  },
  shark: {
    label: '🦈 Shark',
    startMoney: 5000,
    eventInterval: 15,
    consequenceMultiplier: 1.5,
    tint: '#ff444408',
  },
};

const GAME_DURATIONS = { 5: 300, 10: 600, 15: 900 };

export default function Game({ gameConfig, playerData, onGameOver }) {
  const difficulty = DIFFICULTY_SETTINGS[gameConfig.difficulty || 'founder'];
  const duration = GAME_DURATIONS[gameConfig.gameLength] || 600;
  const EVENTS = getEventsForScenario(gameConfig?.scenario?.id || '');

  const [money, setMoney] = useState(difficulty.startMoney);
  const [users, setUsers] = useState(0);
  const [morale, setMorale] = useState(100);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventAnimation, setEventAnimation] = useState('');
  const [log, setLog] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [gameActive, setGameActive] = useState(true);
  const [activeTab, setActiveTab] = useState('actions');
  const [cooldowns, setCooldowns] = useState({});
  const [stacks, setStacks] = useState({});
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [showInvestorPitch, setShowInvestorPitch] = useState(false);
  const [pitchText, setPitchText] = useState('');
  const [pitchResponse, setPitchResponse] = useState(null);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchUsed, setPitchUsed] = useState(false);
  const [defected, setDefected] = useState(false);
  const [showDefectConfirm, setShowDefectConfirm] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null);
  const [eventOutcome, setEventOutcome] = useState(null);

  const usedEventsRef = useRef([]);
  const stateRef = useRef({
    money: difficulty.startMoney,
    users: 0,
    morale: 100,
    gameActive: true,
    stacks: {},
  });
  stateRef.current = { money, users, morale, gameActive, stacks };

  // Timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          endGame('survived');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Auto investor pitch at midpoint
  useEffect(() => {
    const t = setTimeout(() => {
      if (stateRef.current.gameActive && !pitchUsed) setShowInvestorPitch(true);
    }, (duration / 2) * 1000);
    return () => clearTimeout(t);
  }, []);

  // Events
  useEffect(() => {
    const interval = difficulty.eventInterval * 1000;
    const t = setInterval(() => {
      if (stateRef.current.gameActive) triggerEvent();
    }, interval);
    setTimeout(() => {
      if (stateRef.current.gameActive) triggerEvent();
    }, 4000);
    return () => clearInterval(t);
  }, []);

  function triggerEvent() {
    const available = EVENTS.filter(
      (e) => !usedEventsRef.current.includes(e.id)
    );
    if (!available.length) {
      usedEventsRef.current = [];
      return;
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    usedEventsRef.current = [...usedEventsRef.current, pick.id];
    const animations = {
      1: 'slide-right',
      2: 'slide-down',
      3: 'shake',
      4: 'takeover',
    };
    setEventAnimation(animations[pick.tier] || 'slide-right');
    setCurrentEvent(pick);
  }

  function applyEffect(effect, multiplier = 1) {
    const s = stateRef.current;
    const m = difficulty.consequenceMultiplier * multiplier;
    const newMoney = Math.max(
      0,
      s.money + Math.round((effect.money || 0) * (effect.money < 0 ? m : 1))
    );
    const newUsers = Math.max(
      0,
      s.users + Math.round((effect.users || 0) * (effect.users < 0 ? m : 1))
    );
    const newMorale = Math.min(
      100,
      Math.max(
        0,
        s.morale +
          Math.round((effect.morale || 0) * (effect.morale < 0 ? m : 1))
      )
    );
    setMoney(newMoney);
    setUsers(newUsers);
    setMorale(newMorale);
    if (effect.win) {
      endGame('acquired');
      return;
    }
    if (newMoney <= 0) {
      endGame('bankrupt');
      return;
    }
    if (newMorale <= 0) {
      endGame('morale');
      return;
    }
  }

  function handleEventChoice(option) {
    sounds.event();
    applyEffect(option.effect);
    addLog(`Event: "${option.label}"`);
    setCurrentEvent(null);

    const effect = option.effect || {};
    const moneyChange = effect.money || 0;
    const userChange = effect.users || 0;
    const moraleChange = effect.morale || 0;

    const positives = [];
    const negatives = [];

    if (moneyChange > 0) positives.push(`+$${moneyChange.toLocaleString()}`);
    if (moneyChange < 0)
      negatives.push(`-$${Math.abs(moneyChange).toLocaleString()}`);
    if (userChange > 0) positives.push(`+${userChange} users`);
    if (userChange < 0) negatives.push(`${userChange} users`);
    if (moraleChange > 0) positives.push(`+${moraleChange}% morale`);
    if (moraleChange < 0) negatives.push(`${moraleChange}% morale`);

    const isGood = positives.length >= negatives.length;
    const tone = isGood
      ? 'Good call.'
      : negatives.length > 1
      ? "You'll regret that."
      : 'Risky move.';
    const summary =
      [...positives, ...negatives].join(' · ') || 'No immediate effect.';

    setEventOutcome({ tone, summary, isGood });
    setTimeout(() => setEventOutcome(null), 3500);
  }

  function addLog(msg) {
    setLog((prev) => [msg, ...prev].slice(0, 10));
  }

  function startCooldown(key, seconds) {
    setCooldowns((prev) => ({ ...prev, [key]: seconds }));
    const t = setInterval(() => {
      setCooldowns((prev) => {
        const next = { ...prev, [key]: (prev[key] || 0) - 1 };
        if (next[key] <= 0) {
          clearInterval(t);
          delete next[key];
        }
        return next;
      });
    }, 1000);
  }

  function addStack(key) {
    setStacks((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }

  function doAction(key, effect, cooldownSecs, stackKey) {
    if (cooldowns[key]) return;
    if (ACTIVITY_MAP[key]) {
      setActiveActivity({ key, effect, cooldownSecs, stackKey });
      return;
    }
    sounds.action();
    applyEffect(effect);
    addLog(`Action: ${key}`);
    startCooldown(key, cooldownSecs);
    if (stackKey) addStack(stackKey);
    setFeedback(key);
    setTimeout(() => setFeedback(null), 1500);
  }

  function handleActivityComplete(result) {
    if (!activeActivity) return;
    const { key, effect, cooldownSecs, stackKey } = activeActivity;
    setActiveActivity(null);
    if (!result) return;
    if (result.defect) {
      setDefected(true);
      applyEffect({
        money: -Math.floor(stateRef.current.money * 0.6),
        users: -Math.floor(stateRef.current.users * 0.6),
      });
      addLog('💀 You defected!');
      setFeedback('😈 You defected!');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      applyEffect(result);
    }
    addLog(`Action: ${key}`);
    startCooldown(key, cooldownSecs);
    if (stackKey) addStack(stackKey);
    setFeedback(`${key} complete`);
    setTimeout(() => setFeedback(null), 1500);
  }

  function triggerQuiz() {
    if (cooldowns['quiz'] || currentQuiz) return;
    const q = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    setCurrentQuiz(q);
    setQuizResult(null);
    setActiveTab('actions');
  }

  function answerQuiz(idx) {
    if (!currentQuiz || quizResult) return;
    const correct = idx === currentQuiz.correct;
    setQuizResult({ correct, lesson: currentQuiz.lesson });
    if (correct) {
      sounds.quiz_correct();
      applyEffect({ [currentQuiz.stat]: currentQuiz.amount });
      addStack('quiz_correct');
      addLog('Quiz correct! +' + currentQuiz.amount + ' ' + currentQuiz.stat);
    } else {
      sounds.quiz_wrong();
      applyEffect({ morale: -5 });
      addLog('Quiz wrong. -5 morale');
    }
    startCooldown('quiz', 30);
    setTimeout(() => {
      setCurrentQuiz(null);
      setQuizResult(null);
    }, 3000);
  }

  async function submitPitch() {
    if (!pitchText.trim() || pitchLoading) return;
    setPitchLoading(true);
    setPitchUsed(true);
    const INVESTORS = [
      {
        name: 'Marcus Webb',
        background: 'Ex-Goldman Sachs',
        cares: 'unit economics and clear revenue model',
        dealbreaker: "founders who don't know their numbers",
      },
      {
        name: 'Sandra Chen',
        background: 'Ex-Google, early Stripe investor',
        cares: 'product-market fit and user growth',
        dealbreaker: 'vanity metrics without retention',
      },
      {
        name: 'Raj Patel',
        background: 'Built and sold 3 startups',
        cares: 'founder grit and market size',
        dealbreaker: 'crowded markets with no differentiation',
      },
      {
        name: 'Lisa Torres',
        background: 'Former Y Combinator partner',
        cares: 'speed of iteration and team strength',
        dealbreaker: 'solo founders with no technical co-founder',
      },
    ];
    const investor = INVESTORS[Math.floor(Math.random() * INVESTORS.length)];
    try {
      const scenario = gameConfig.scenario?.name || 'a startup';
      const res = await fetch("/.netlify/functions/claude-proxy", {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are ${investor.name}, ${
            investor.background
          }. You are judging a startup pitch in a multiplayer business simulation game. The startup is: ${scenario}. Current stats: $${stateRef.current.money.toLocaleString()} cash, ${
            stateRef.current.users
          } users, ${
            stateRef.current.morale
          }% team morale. You care most about ${
            investor.cares
          }. Your deal-breaker is: ${
            investor.dealbreaker
          }. Respond in 3-4 sentences max, in character. Be direct and a little harsh but educational. End with exactly one of these verdicts on its own line: DEAL: $[amount]k for [equity]% | COUNTER: [one line counter offer] | PASS: [one brutal reason]`,
          messages: [{ role: 'user', content: pitchText }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || 'The investor left the room.';
      setPitchResponse({ text, investor: investor.name });
      if (text.includes('DEAL:')) applyEffect({ money: 50000, morale: 20 });
      else if (text.includes('PASS:')) applyEffect({ morale: -10 });
      addLog('Investor pitch submitted to ' + investor.name);
    } catch {
      setPitchResponse({
        text: "The investor's Zoom crashed. Try again later.",
        investor: 'Unknown',
      });
    }
    setPitchLoading(false);
  }

  function handleDefect() {
    if (defectText !== 'BETRAY') return;
    setDefected(true);
    setShowDefectConfirm(false);
    setDefectText('');
    applyEffect({
      money: -Math.floor(stateRef.current.money * 0.6),
      users: -Math.floor(stateRef.current.users * 0.6),
    });
    addLog('💀 You defected and started a rival company!');
    setFeedback('😈 You defected!');
    setTimeout(() => setFeedback(null), 3000);
  }

  function endGame(reason) {
    if (!stateRef.current.gameActive) return;
    setGameActive(false);
    setTimeout(() => {
      onGameOver({
        money: stateRef.current.money,
        users: stateRef.current.users,
        morale: stateRef.current.morale,
        reason,
        stacks: stateRef.current.stacks,
        log,
        defected,
        role: playerData.role,
        isSaboteur: playerData.isSaboteur,
        difficulty: gameConfig.difficulty || 'founder',
        scenario: gameConfig.scenario?.name || 'Unknown',
      });
    }, 800);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const roleColor = ROLE_COLORS[playerData.role] || '#888';

  const universalActions = [
    {
      key: 'Cold Email',
      emoji: '📧',
      cooldown: 20,
      effect: { users: 50 },
      stack: 'email',
      desc: 'Blast cold emails. Builds mailing list.',
    },
    {
      key: 'Network Event',
      emoji: '🤝',
      cooldown: 45,
      effect: { morale: 5, money: 500 },
      stack: 'network',
      desc: 'Meet an NPC. Effects vary.',
    },
    {
      key: 'Blog Post',
      emoji: '📰',
      cooldown: 60,
      effect: { users: 30, morale: 3 },
      stack: 'blog',
      desc: 'Build brand authority slowly.',
    },
    {
      key: 'A/B Test',
      emoji: '🧪',
      cooldown: 90,
      effect: { users: 100, money: 500 },
      stack: 'ab',
      desc: 'Data-driven improvements.',
    },
    {
      key: 'Attack Competitor',
      emoji: '⚔️',
      cooldown: 75,
      effect: { users: 200 },
      stack: 'attack',
      desc: 'Steal users. Backfires 30%.',
    },
    {
      key: 'Pitch Practice',
      emoji: '🎤',
      cooldown: 120,
      effect: { morale: 5 },
      stack: 'pitch_practice',
      desc: 'Improve your investor pitch.',
    },
    {
      key: 'Product Update',
      emoji: '📦',
      cooldown: 50,
      effect: { users: 80, morale: 5 },
      stack: 'update',
      desc: 'Push a small improvement.',
    },
    {
      key: 'Business Quiz',
      emoji: '📊',
      cooldown: 30,
      effect: {},
      stack: 'quiz_attempt',
      desc: 'Answer for stat boosts.',
    },
  ];

  const roleActions = {
    CEO: [
      {
        key: 'All-Hands',
        emoji: '🎯',
        cooldown: 60,
        effect: { morale: 10 },
        stack: 'allhands',
        desc: 'Boost team morale +10.',
      },
      {
        key: 'Fire Someone',
        emoji: '🔥',
        cooldown: 120,
        effect: { morale: -5, money: 2000 },
        stack: 'fire',
        desc: 'Cut dead weight. Save money.',
      },
      {
        key: 'Pivot',
        emoji: '🔄',
        cooldown: 300,
        effect: { morale: 10, users: 300 },
        stack: 'pivot',
        desc: 'Change direction. Opens new events.',
      },
    ],
    CFO: [
      {
        key: 'Financial Model',
        emoji: '📈',
        cooldown: 60,
        effect: { money: 1000 },
        stack: 'model',
        desc: "Preview next event's impact.",
      },
      {
        key: 'Emergency Reserve',
        emoji: '🏦',
        cooldown: 120,
        effect: { money: 2000 },
        stack: 'reserve',
        desc: 'Lock away $2k safe from events.',
      },
      {
        key: 'Audit Trail',
        emoji: '🕵️',
        cooldown: 90,
        effect: { morale: 5 },
        stack: 'audit',
        desc: 'See who spent what.',
      },
    ],
    CMO: [
      {
        key: 'Campaign Blast',
        emoji: '📢',
        cooldown: 30,
        effect: { users: 200, money: -500 },
        stack: 'campaign',
        desc: 'Targeted user segment blast.',
      },
      {
        key: 'Brand Refresh',
        emoji: '🎨',
        cooldown: 180,
        effect: { users: 300, morale: 10, money: -1000 },
        stack: 'refresh',
        desc: 'Reset reputation damage.',
      },
      {
        key: 'Fake Virality',
        emoji: '🤳',
        cooldown: 150,
        effect: { users: 500 },
        stack: 'viral',
        desc: '50% works. 50% gets exposed.',
      },
    ],
    CTO: [
      {
        key: 'Ship Fast',
        emoji: '⚡',
        cooldown: 30,
        effect: { users: 150, morale: 5 },
        stack: 'ship',
        desc: 'Build feature fast. Bug risk.',
      },
      {
        key: 'Fix Tech Debt',
        emoji: '🐛',
        cooldown: 90,
        effect: { morale: 10, money: 1000 },
        stack: 'debt',
        desc: 'Prevent crash events.',
      },
      {
        key: 'Plant Bug',
        emoji: '🪲',
        cooldown: 120,
        effect: { users: 300 },
        stack: 'plantbug',
        desc: 'Sabotage competitor metrics.',
      },
    ],
    COO: [
      {
        key: 'Automate Process',
        emoji: '🤖',
        cooldown: 150,
        effect: { money: -2000, morale: 10 },
        stack: 'automate',
        desc: 'Passive stat gains over time.',
      },
      {
        key: 'Systems Audit',
        emoji: '🔍',
        cooldown: 300,
        effect: { morale: 15 },
        stack: 'sysaudit',
        desc: 'One-time Saboteur reveal.',
      },
      {
        key: 'Hire NPC',
        emoji: '📋',
        cooldown: 120,
        effect: { money: -3000, morale: 15, users: 100 },
        stack: 'hire',
        desc: 'Add passive stat booster.',
      },
    ],
    'Head of Sales': [
      {
        key: 'Cold Call',
        emoji: '📞',
        cooldown: 20,
        effect: { money: 2000, users: 50 },
        stack: 'call',
        desc: '30% win. 10% bad review.',
      },
      {
        key: 'Enterprise Pitch',
        emoji: '💼',
        cooldown: 300,
        effect: {},
        stack: 'enterprise',
        desc: 'Trigger investor pitch now.',
      },
      {
        key: 'Flash Sale',
        emoji: '🎁',
        cooldown: 180,
        effect: { money: 5000, users: -100 },
        stack: 'sale',
        desc: 'Revenue spike. Trains users to wait.',
      },
    ],
    'Community Manager': [
      {
        key: 'Host AMA',
        emoji: '🎉',
        cooldown: 90,
        effect: { users: 200, morale: 15, money: -500 },
        stack: 'ama',
        desc: 'Users love it. Timing matters.',
      },
      {
        key: 'Town Hall',
        emoji: '🗳️',
        cooldown: 300,
        effect: { morale: 20 },
        stack: 'townhall',
        desc: 'Overrule CEO. One use.',
      },
      {
        key: 'Personalized Outreach',
        emoji: '💌',
        cooldown: 60,
        effect: { users: 100, morale: 10 },
        stack: 'outreach',
        desc: 'Slow but high retention.',
      },
    ],
  };

  const myRoleActions = roleActions[playerData.role] || [];

  const tierColors = { 1: '#4ade80', 2: '#facc15', 3: '#ff4444', 4: '#a78bfa' };
  const tierLabels = {
    1: '🟢 Opportunity',
    2: '🟡 Pressure',
    3: '🔴 Crisis',
    4: '🟣 Wildcard',
  };

  return (
    <div
      style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '1rem 1rem 4rem',
        background: difficulty.tint,
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <div>
          <p
            style={{
              color: '#444',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {playerData.name} ·{' '}
            <span style={{ color: roleColor }}>{playerData.role}</span>
            {playerData.isSaboteur && (
              <span style={{ color: '#ff4444' }}> · 🐀</span>
            )}
          </p>
          <p style={{ color: '#333', fontSize: 10 }}>
            {difficulty.label} · {gameConfig.scenario?.name}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p
            style={{ color: timeLeft < 60 ? '#ff4444' : '#444', fontSize: 10 }}
          >
            TIME LEFT
          </p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: timeLeft < 60 ? '#ff4444' : '#fff',
              fontFamily: 'monospace',
            }}
          >
            {mins}:{secs.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 6,
          marginBottom: 10,
        }}
      >
        {[
          [
            '💰',
            'Cash',
            `$${money.toLocaleString()}`,
            money < 3000 ? '#ff4444' : '#4ade80',
          ],
          ['👥', 'Users', users.toLocaleString(), '#60a5fa'],
          ['😊', 'Morale', `${morale}%`, morale < 30 ? '#ff4444' : '#facc15'],
        ].map(([icon, label, val, color]) => (
          <div
            key={label}
            style={{
              background: '#111',
              border: '0.5px solid #222',
              borderRadius: 8,
              padding: '8px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: '#444',
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              {icon} {label}
            </p>
            <p
              style={{
                color,
                fontWeight: 700,
                fontSize: 15,
                fontFamily: 'monospace',
              }}
            >
              {val}
            </p>
          </div>
        ))}
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div
          style={{
            background: '#0a1a0a',
            border: '0.5px solid #4ade8050',
            borderRadius: 8,
            padding: '6px 12px',
            marginBottom: 8,
            color: '#4ade80',
            fontSize: 12,
          }}
        >
          ✓ {feedback}
        </div>
      )}

      {/* Event outcome */}
      {eventOutcome && (
        <div
          style={{
            background: eventOutcome.isGood ? '#0a1a0a' : '#1a0a0a',
            border: `0.5px solid ${
              eventOutcome.isGood ? '#4ade8050' : '#ff444450'
            }`,
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 8,
          }}
        >
          <p
            style={{
              color: eventOutcome.isGood ? '#4ade80' : '#ff4444',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 3,
            }}
          >
            {eventOutcome.isGood ? '✓ Good call.' : '✗ ' + eventOutcome.tone}
          </p>
          <p style={{ color: '#888', fontSize: 11 }}>{eventOutcome.summary}</p>
        </div>
      )}

      {/* Quiz card */}
      {currentQuiz && (
        <div
          style={{
            background: '#0a0a1a',
            border: '1px solid #60a5fa50',
            borderRadius: 12,
            padding: '1rem',
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: 9,
              color: '#60a5fa',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            📊 Business Quiz — answer for rewards
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 12,
              color: '#fff',
            }}
          >
            {currentQuiz.q}
          </p>
          {quizResult ? (
            <div>
              <p
                style={{
                  color: quizResult.correct ? '#4ade80' : '#ff4444',
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                {quizResult.correct ? '✓ Correct!' : '✗ Wrong'}
              </p>
              <p style={{ color: '#666', fontSize: 11 }}>
                💡 {quizResult.lesson}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {currentQuiz.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answerQuiz(i)}
                  style={{
                    padding: '8px 12px',
                    background: '#111',
                    color: '#aaa',
                    border: '0.5px solid #333',
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active event */}
      {currentEvent && (
        <div
          style={{
            background: '#1a0a0a',
            border: `1px solid ${tierColors[currentEvent.tier]}50`,
            borderRadius: 12,
            padding: '1rem',
            marginBottom: 10,
            borderLeft: `3px solid ${tierColors[currentEvent.tier]}`,
          }}
        >
          <p
            style={{
              fontSize: 9,
              color: tierColors[currentEvent.tier],
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            {tierLabels[currentEvent.tier]}
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 14,
              lineHeight: 1.5,
              color: '#fff',
            }}
          >
            {currentEvent.text}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {currentEvent.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleEventChoice(opt)}
                style={{
                  padding: '9px 14px',
                  background: i === 0 ? '#ff4444' : '#222',
                  color: '#fff',
                  border: '0.5px solid #333',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Investor pitch */}
      {showInvestorPitch && !pitchResponse && (
        <div
          style={{
            background: '#0a0f1a',
            border: '1px solid #60a5fa50',
            borderRadius: 12,
            padding: '1rem',
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: 9,
              color: '#60a5fa',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            🦈 Investor Pitch
          </p>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
            An investor walked in. Pitch your startup in 90 seconds.
          </p>
          <textarea
            value={pitchText}
            onChange={(e) => setPitchText(e.target.value)}
            placeholder="We are building... our customer is... our traction... we need..."
            style={{
              width: '100%',
              height: 80,
              background: '#111',
              border: '0.5px solid #333',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              padding: '8px',
              boxSizing: 'border-box',
              resize: 'none',
              outline: 'none',
              marginBottom: 8,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={submitPitch}
              disabled={pitchLoading || !pitchText.trim()}
              style={{
                flex: 1,
                padding: '9px',
                background: pitchText.trim() ? '#60a5fa' : '#222',
                color: pitchText.trim() ? '#000' : '#555',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: pitchText.trim() ? 'pointer' : 'default',
              }}
            >
              {pitchLoading ? 'Judging...' : 'Submit Pitch →'}
            </button>
            <button
              onClick={() => setShowInvestorPitch(false)}
              style={{
                padding: '9px 14px',
                background: '#222',
                color: '#666',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Pass
            </button>
          </div>
        </div>
      )}

      {pitchResponse && (
        <div
          style={{
            background: '#0a0f1a',
            border: '1px solid #60a5fa50',
            borderRadius: 12,
            padding: '1rem',
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: 9,
              color: '#60a5fa',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            🦈 {pitchResponse.investor} responds
          </p>
          <p style={{ fontSize: 12, color: '#ccc', lineHeight: 1.6 }}>
            {pitchResponse.text}
          </p>
          <button
            onClick={() => {
              setShowInvestorPitch(false);
              setPitchResponse(null);
            }}
            style={{
              marginTop: 8,
              padding: '6px 14px',
              background: '#222',
              color: '#777',
              border: 'none',
              borderRadius: 6,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Defect confirm */}
      {showDefectConfirm && (
        <div
          style={{
            background: '#1a0808',
            border: '1px solid #ff444460',
            borderRadius: 12,
            padding: '1rem',
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#ff4444',
              marginBottom: 6,
            }}
          >
            ⚠️ Defect and go solo?
          </p>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>
            Type BETRAY to confirm. Your team will be notified. You keep 40% of
            current stats.
          </p>
          <input
            value={defectText}
            onChange={(e) => setDefectText(e.target.value.toUpperCase())}
            placeholder="Type BETRAY"
            style={{
              width: '100%',
              padding: '8px',
              background: '#111',
              border: '0.5px solid #333',
              borderRadius: 6,
              color: '#ff4444',
              fontSize: 14,
              fontWeight: 700,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 8,
              letterSpacing: 2,
              textAlign: 'center',
              fontFamily: 'monospace',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleDefect}
              disabled={defectText !== 'BETRAY'}
              style={{
                flex: 1,
                padding: '9px',
                background: defectText === 'BETRAY' ? '#ff4444' : '#222',
                color: defectText === 'BETRAY' ? '#fff' : '#555',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: defectText === 'BETRAY' ? 'pointer' : 'default',
              }}
            >
              Defect 😈
            </button>
            <button
              onClick={() => {
                setShowDefectConfirm(false);
                setDefectText('');
              }}
              style={{
                flex: 1,
                padding: '9px',
                background: '#222',
                color: '#888',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Stay
            </button>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 10,
          background: '#111',
          borderRadius: 8,
          padding: 4,
        }}
      >
        {['actions', 'log'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '7px',
              background: activeTab === tab ? '#222' : 'none',
              color: activeTab === tab ? '#fff' : '#555',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: activeTab === tab ? 700 : 400,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'actions' ? '⚡ Actions' : '📋 Log'}
          </button>
        ))}
      </div>

      {/* Actions tab */}
      {activeTab === 'actions' && (
        <div>
          <p
            style={{
              fontSize: 10,
              color: '#444',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            <span style={{ color: roleColor }}>●</span> {playerData.role}{' '}
            Actions
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              marginBottom: 12,
            }}
          >
            {myRoleActions.map((action) => (
              <ActionButton
                key={action.key}
                action={action}
                cooldowns={cooldowns}
                stacks={stacks}
                onPress={() => {
                  if (action.key === 'Enterprise Pitch') {
                    setShowInvestorPitch(true);
                    return;
                  }
                  doAction(
                    action.key,
                    action.effect,
                    action.cooldown,
                    action.stack
                  );
                }}
                roleColor={roleColor}
              />
            ))}
          </div>

          <p
            style={{
              fontSize: 10,
              color: '#444',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Universal Actions
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              marginBottom: 12,
            }}
          >
            {universalActions.map((action) => (
              <ActionButton
                key={action.key}
                action={action}
                cooldowns={cooldowns}
                stacks={stacks}
                onPress={() => {
                  if (action.key === 'Business Quiz') {
                    triggerQuiz();
                    return;
                  }
                  doAction(
                    action.key,
                    action.effect,
                    action.cooldown,
                    action.stack
                  );
                }}
                roleColor="#555"
              />
            ))}
          </div>

          {!defected ? (
            <button
              onClick={() =>
                setActiveActivity({
                  key: 'Defect & Go Solo',
                  effect: {},
                  cooldownSecs: 0,
                  stackKey: null,
                })
              }
              style={{
                width: '100%',
                padding: '9px',
                background: '#1a0808',
                color: '#ff4444',
                border: '0.5px solid #ff444430',
                borderRadius: 8,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              💔 Defect & Go Solo
            </button>
          ) : (
            <p
              style={{
                textAlign: 'center',
                color: '#ff4444',
                fontSize: 12,
                padding: '8px',
              }}
            >
              😈 You defected. Out-earn your old team to win the Judas Award.
            </p>
          )}
        </div>
      )}

      {/* Log tab */}
      {activeTab === 'log' && (
        <div
          style={{
            background: '#0a0a0a',
            border: '0.5px solid #1a1a1a',
            borderRadius: 8,
            padding: '1rem',
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: '#333',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Decision log
          </p>
          {log.length === 0 && (
            <p style={{ color: '#333', fontSize: 12 }}>No decisions yet.</p>
          )}
          {log.map((entry, i) => (
            <p
              key={i}
              style={{
                color: '#444',
                fontSize: 11,
                marginBottom: 5,
                lineHeight: 1.4,
              }}
            >
              → {entry}
            </p>
          ))}
        </div>
      )}

      {/* Stacks */}
      {Object.keys(stacks).length > 0 && (
        <div
          style={{
            marginTop: 10,
            background: '#0a0f0a',
            border: '0.5px solid #4ade8015',
            borderRadius: 8,
            padding: '8px 12px',
          }}
        >
          <p
            style={{
              fontSize: 9,
              color: '#4ade8050',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 5,
            }}
          >
            Active stacks
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Object.entries(stacks).map(([k, v]) => (
              <span
                key={k}
                style={{
                  fontSize: 9,
                  background: '#4ade8010',
                  color: '#4ade80',
                  padding: '2px 7px',
                  borderRadius: 4,
                }}
              >
                {k} ×{v}
              </span>
            ))}
          </div>
        </div>
      )}
      {activeActivity && (
        <Activity
          actionKey={activeActivity.key}
          onComplete={handleActivityComplete}
          onCancel={() => setActiveActivity(null)}
        />
      )}
      <Chat
        roomCode={gameConfig.roomCode}
        playerName={playerData.name}
        playerRole={playerData.role}
        isSaboteur={playerData.isSaboteur}
      />
    </div>
  );
}

function ActionButton({ action, cooldowns, stacks, onPress, roleColor }) {
  const cd = cooldowns[action.key] || 0;
  const stackCount = stacks[action.stack] || 0;
  const onCooldown = cd > 0;
  return (
    <button
      onClick={onPress}
      disabled={onCooldown}
      style={{
        background: onCooldown ? '#0a0a0a' : '#111',
        border: `0.5px solid ${onCooldown ? '#1a1a1a' : '#222'}`,
        borderRadius: 8,
        padding: '10px',
        cursor: onCooldown ? 'default' : 'pointer',
        textAlign: 'left',
        opacity: onCooldown ? 0.4 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: 18 }}>{action.emoji}</span>
        {stackCount > 0 && (
          <span
            style={{
              fontSize: 9,
              background: '#4ade8015',
              color: '#4ade80',
              padding: '1px 5px',
              borderRadius: 3,
            }}
          >
            ×{stackCount}
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: onCooldown ? '#333' : '#fff',
          marginTop: 4,
          marginBottom: 2,
        }}
      >
        {action.key}
      </p>
      <p style={{ fontSize: 10, color: '#444', lineHeight: 1.3 }}>
        {onCooldown ? `${cd}s cooldown` : action.desc}
      </p>
    </button>
  );
}
