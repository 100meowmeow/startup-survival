import { useState, useEffect, useRef } from 'react';
import { sounds } from './sounds';

// ─── TIMER RING ───────────────────────────────────────────────────────────
function TimerRing({ seconds, total, color = '#ff4444' }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / total) * circumference;
  return (
    <svg
      width={50}
      height={50}
      style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}
    >
      <circle
        cx={25}
        cy={25}
        r={radius}
        fill="none"
        stroke="#222"
        strokeWidth={4}
      />
      <circle
        cx={25}
        cy={25}
        r={radius}
        fill="none"
        stroke={seconds < total * 0.3 ? '#ff4444' : color}
        strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <text
        x={25}
        y={25}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={seconds < total * 0.3 ? '#ff4444' : '#fff'}
        fontSize={11}
        fontWeight={700}
        style={{ transform: 'rotate(90deg)', transformOrigin: '25px 25px' }}
      >
        {seconds}
      </text>
    </svg>
  );
}

// ─── LESSON ───────────────────────────────────────────────────────────────
function Lesson({ text, isGood }) {
  return (
    <div
      style={{
        background: isGood ? '#0a1a0a' : '#1a0808',
        border: `0.5px solid ${isGood ? '#4ade8050' : '#ff444450'}`,
        borderRadius: 10,
        padding: '10px 14px',
        marginTop: 10,
      }}
    >
      <p
        style={{
          color: isGood ? '#4ade80' : '#ff4444',
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 3,
        }}
      >
        {isGood ? '✓ Nice work.' : '✗ Not great.'}
      </p>
      <p style={{ color: '#888', fontSize: 11, lineHeight: 1.5 }}>💡 {text}</p>
    </div>
  );
}

function useCountdown(total, onExpire, active = true) {
  const [timeLeft, setTimeLeft] = useState(total);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(
      () =>
        setTimeLeft((p) => {
          if (p <= 1) {
            clearInterval(t);
            onExpire();
            return 0;
          }
          return p - 1;
        }),
      1000
    );
    return () => clearInterval(t);
  }, [active]);
  return timeLeft;
}

// ─── POOLS ────────────────────────────────────────────────────────────────
const EMAIL_SCENARIOS = [
  {
    audience: '🎓 College Students',
    tip: 'wants: cheap, fast, fun',
    good_tone: 'Casual',
    good_subject_hint: 'short + emoji friendly',
  },
  {
    audience: '🏪 Small Business Owner',
    tip: 'wants: save time, save money',
    good_tone: 'Urgent',
    good_subject_hint: 'lead with ROI',
  },
  {
    audience: '🏢 Enterprise Exec',
    tip: 'wants: ROI, compliance, support',
    good_tone: 'Professional',
    good_subject_hint: 'formal, no slang',
  },
  {
    audience: '👩‍💻 Freelance Designer',
    tip: 'wants: portfolio, clients, tools',
    good_tone: 'Casual',
    good_subject_hint: 'peer tone, creative',
  },
  {
    audience: '🏥 Healthcare Worker',
    tip: 'wants: efficiency, compliance, safety',
    good_tone: 'Professional',
    good_subject_hint: 'serious, evidence-based',
  },
  {
    audience: '📦 E-commerce Seller',
    tip: 'wants: margins, growth, automation',
    good_tone: 'Urgent',
    good_subject_hint: 'numbers, specific savings',
  },
  {
    audience: '👨‍🏫 Teacher / Educator',
    tip: 'wants: student outcomes, easy tools',
    good_tone: 'Casual',
    good_subject_hint: 'warm, mission-driven',
  },
  {
    audience: '🏋️ Gym Owner',
    tip: 'wants: members, retention, revenue',
    good_tone: 'Urgent',
    good_subject_hint: 'transformation, results',
  },
];

const NETWORKING_NPCS = [
  {
    name: 'Sandra Chen',
    role: 'VC Partner',
    emoji: '👩‍💼',
    personality: 'Blunt. Loves data.',
    dealbreaker: 'small talk',
    lines: [
      { text: "What's your CAC to LTV ratio?", good: true },
      { text: "We're disrupting the industry.", good: false },
      { text: 'Nice shoes. Invest in me. 🌸', good: false },
      { text: 'We hit 40% MoM growth last quarter.', good: true },
    ],
  },
  {
    name: 'Marcus Webb',
    role: 'Angel Investor',
    emoji: '👨‍💼',
    personality: 'Friendly. Loves founder stories.',
    dealbreaker: 'jargon',
    lines: [
      { text: 'Our synergistic platform leverages AI.', good: false },
      { text: 'I quit my job to solve this problem.', good: true },
      { text: "What's your IRR projection?", good: false },
      { text: 'Let me tell you why I built this.', good: true },
    ],
  },
  {
    name: 'Priya Nair',
    role: 'Journalist',
    emoji: '📰',
    personality: 'Curious. Wants the real story.',
    dealbreaker: 'PR speak',
    lines: [
      { text: "We're honored to share our journey.", good: false },
      { text: 'Honestly? We almost shut down twice.', good: true },
      { text: "I can't comment on that.", good: false },
      { text: "The real problem we're solving is...", good: true },
    ],
  },
  {
    name: 'James Okafor',
    role: 'Corporate Exec',
    emoji: '👔',
    personality: 'Risk-averse. Wants proven solutions.',
    dealbreaker: 'hype',
    lines: [
      { text: 'This is revolutionary technology.', good: false },
      { text: "We've reduced costs by 32% for 10 clients.", good: true },
      { text: "Everyone's going to want this soon.", good: false },
      { text: "Here's our case study from a Fortune 500 client.", good: true },
    ],
  },
  {
    name: 'Yuki Tanaka',
    role: 'Product Lead',
    emoji: '🧑‍💻',
    personality: 'Technical. Hates buzzwords.',
    dealbreaker: 'vague claims',
    lines: [
      { text: 'Our AI is next level.', good: false },
      {
        text: 'We use transformer architecture with RLHF fine-tuning.',
        good: true,
      },
      { text: 'The tech is too complex to explain quickly.', good: false },
      {
        text: "Our p50 latency is 120ms — here's our infra overview.",
        good: true,
      },
    ],
  },
  {
    name: 'Fatima Al-Hassan',
    role: 'Impact Investor',
    emoji: '🌍',
    personality: 'Mission-driven. Wants measurable impact.',
    dealbreaker: 'profit-only focus',
    lines: [
      { text: "We're going to make a lot of money.", good: false },
      {
        text: "We've kept 10,000 tons of CO2 out of the atmosphere.",
        good: true,
      },
      { text: 'Impact is secondary to scale for us.', good: false },
      {
        text: 'Our B-Corp certification process starts next quarter.',
        good: true,
      },
    ],
  },
  {
    name: 'Carlos Rivera',
    role: 'Startup Founder',
    emoji: '🚀',
    personality: 'Hustler. Wants to collab or compete.',
    dealbreaker: 'arrogance',
    lines: [
      { text: "We're the best in the market, honestly.", good: false },
      {
        text: "I'd love to compare notes — what's your churn like?",
        good: true,
      },
      { text: "Our competitors don't stand a chance.", good: false },
      {
        text: "We're struggling with the same problem — maybe we collab?",
        good: true,
      },
    ],
  },
  {
    name: 'Beth Kowalski',
    role: 'Marketing Director',
    emoji: '📣',
    personality: 'Creative. Hates boring pitches.',
    dealbreaker: 'slides and decks',
    lines: [
      { text: 'Let me pull up our deck.', good: false },
      { text: "Forget the slides — here's what we actually do.", good: true },
      {
        text: 'Our CAC is quite favorable relative to industry benchmarks.',
        good: false,
      },
      { text: 'We went viral twice this month. Let me show you.', good: true },
    ],
  },
];

const usedNPCsGlobal = new Set();

const AB_TESTS = [
  {
    question: 'Which pricing page converts better?',
    a: { label: '$9/mo, single clean plan', wins: true },
    b: { label: '$8.99/mo, 3 confusing tiers' },
    lesson:
      'Simple pricing converts better. Every extra option is a reason not to buy.',
  },
  {
    question: 'Which CTA performs better?',
    a: { label: '"Start Free Trial"', wins: true },
    b: { label: '"Sign Up Now"' },
    lesson:
      '"Start Free Trial" reduces perceived risk and consistently outperforms generic CTAs.',
  },
  {
    question: 'Which onboarding flow works better?',
    a: { label: '10-step guided tour' },
    b: { label: 'Skip straight to the product', wins: true },
    lesson:
      "Users want value immediately. Get them to their 'aha moment' as fast as possible.",
  },
  {
    question: 'Which email subject gets more opens?',
    a: { label: 'Check out our new feature' },
    b: { label: '"You\'re losing $500/month without this"', wins: true },
    lesson:
      'Loss aversion subjects outperform vague ones by 30-40%. Specificity wins.',
  },
  {
    question: 'Which homepage hero works better?',
    a: { label: 'Product screenshot + tagline', wins: true },
    b: { label: 'Animated explainer video autoplay' },
    lesson:
      'Static screenshots load faster and convert better. Video autoplays annoy users and slow pages.',
  },
  {
    question: 'Which support response converts to upsell better?',
    a: { label: 'Answer the question only' },
    b: { label: 'Answer + mention relevant upgrade', wins: true },
    lesson:
      'Support is a sales channel. A relevant upsell mention during a support interaction converts at 15%+',
  },
  {
    question: 'Which ad image performs better?',
    a: { label: 'Stock photo of happy people' },
    b: { label: 'Real user photo, messy desk, authentic', wins: true },
    lesson:
      'Authentic imagery outperforms stock photos. Users recognize and distrust staged perfection.',
  },
  {
    question: 'Which checkout flow converts better?',
    a: { label: 'Guest checkout available', wins: true },
    b: { label: 'Forced account creation' },
    lesson:
      'Forced account creation causes 35% cart abandonment. Always offer guest checkout.',
  },
];

const PITCH_OBJECTIONS = [
  {
    objection: '"Your CAC is too high."',
    options: [
      { text: "We're working on it.", good: false },
      { text: 'Our LTV is 4x CAC — unit economics are strong.', good: true },
      { text: "We'll fix that after funding.", good: false },
      {
        text: 'Our organic CAC is near zero — paid is an experiment.',
        good: true,
      },
    ],
    lesson:
      'Investors want to see you know your numbers AND have a clear path to improvement.',
  },
  {
    objection: '"Why would anyone pay for this?"',
    options: [
      { text: "Because it's really useful!", good: false },
      { text: 'We have 200 paying customers at $50/mo.', good: true },
      { text: "Everyone we've shown it to loves it.", good: false },
      { text: 'Our NPS is 72 and churn is under 3%.', good: true },
    ],
    lesson: 'Revenue, retention, and NPS are evidence. Enthusiasm is not.',
  },
  {
    objection: '"What\'s your moat?"',
    options: [
      { text: 'Our product is really hard to build.', good: false },
      { text: 'Network effects — each user makes it better.', good: true },
      { text: 'We have a patent pending.', good: false },
      { text: '18 months of proprietary training data.', good: true },
    ],
    lesson:
      "A real moat is network effects, data, switching costs, or regulation. 'Hard to build' is not a moat.",
  },
  {
    objection: '"Your market is too small."',
    options: [
      { text: "It'll get bigger eventually.", good: false },
      {
        text: 'We dominate a $500M niche that leads to a $5B market.',
        good: true,
      },
      { text: 'Every market starts small.', good: false },
      { text: "Amazon started in books. We're starting in X.", good: true },
    ],
    lesson:
      "Dominate a niche first. Investors love the 'narrow wedge into a large market' narrative.",
  },
  {
    objection: '"Why are you the right team?"',
    options: [
      { text: "We're really passionate about this.", good: false },
      { text: 'Our CEO built and sold a company in this space.', good: true },
      { text: 'We work really hard.', good: false },
      {
        text: 'We have 10 years of domain expertise and 3 failed attempts that taught us everything.',
        good: true,
      },
    ],
    lesson:
      'Investors bet on teams first. Domain expertise plus lived failure is the strongest signal.',
  },
  {
    objection: '"What happens if Google builds this?"',
    options: [
      { text: "We'd be flattered.", good: false },
      {
        text: 'Our switching costs and contracts make us defensible for 3-5 years.',
        good: true,
      },
      { text: "Google can't move fast enough.", good: false },
      {
        text: "We'd welcome it — validates the market. But our niche loyalty is our moat.",
        good: true,
      },
    ],
    lesson:
      'Acknowledge the threat, then explain your defensibility. Dismissing competition reads as naive.',
  },
];

const MATH_PROBLEMS = [
  {
    question:
      'Your startup has $50,000 and spends $8,000/month. How many months of runway do you have?',
    answer: 6,
    unit: 'months',
    lesson:
      'Runway = cash / burn rate. Always know this number. Running out of runway with no warning is inexcusable.',
  },
  {
    question:
      "You acquire 1,000 users. 5% convert to paid at $20/month. What's your MRR?",
    answer: 1000,
    unit: '$',
    lesson:
      'MRR = users × conversion rate × price. This is your most important growth metric.',
  },
  {
    question: "Your CAC is $40. Your LTV is $200. What's your LTV:CAC ratio?",
    answer: 5,
    unit: 'x',
    lesson:
      'LTV:CAC of 3x or higher is generally healthy. Below 1x means you lose money on every customer.',
  },
  {
    question:
      "You have 500 customers. 25 cancel this month. What's your monthly churn rate (%)?",
    answer: 5,
    unit: '%',
    lesson:
      'Churn rate = cancelled / total × 100. 5% monthly churn means losing half your base in a year.',
  },
  {
    question:
      "Your product costs $12/month. You spend $3,600 on ads and get 150 new users. What's your CAC?",
    answer: 24,
    unit: '$',
    lesson:
      "CAC = ad spend / new customers. If CAC > LTV, you're losing money on every sale.",
  },
  {
    question:
      'You grow 10% month over month. Starting with 100 users, how many after 3 months?',
    answer: 133,
    unit: 'users',
    lesson:
      'Compound growth: 100 × 1.1³ ≈ 133. Even modest MoM growth compounds dramatically over a year.',
  },
  {
    question:
      'You raise $500k at a $2M post-money valuation. What % of the company did you give away?',
    answer: 25,
    unit: '%',
    lesson:
      'Dilution = investment / post-money valuation × 100. Know your cap table before every round.',
  },
  {
    question:
      "Your gross margin is 70% and revenue is $100k. What's your gross profit?",
    answer: 70000,
    unit: '$',
    lesson:
      'Gross profit = revenue × gross margin. SaaS businesses typically target 70-80% gross margins.',
  },
];

const FIRE_EMPLOYEES = [
  [
    {
      name: 'Jake',
      role: 'Engineer',
      stats: 'Ships fast, misses tests',
      salary: 9000,
      hidden: 'fixes bugs silently at 2am',
      cost_to_fire: 'loses stability',
    },
    {
      name: 'Mia',
      role: 'Sales',
      stats: 'Closes deals, bad paperwork',
      salary: 7000,
      hidden: 'has 3 hot leads this week',
      cost_to_fire: 'loses pipeline',
    },
    {
      name: 'Leo',
      role: 'Designer',
      stats: 'Amazing work, slow delivery',
      salary: 6000,
      hidden: 'just finished your best landing page',
      cost_to_fire: 'safe to fire',
    },
  ],
  [
    {
      name: 'Aisha',
      role: 'Marketing',
      stats: 'Creative but unfocused',
      salary: 6500,
      hidden: 'running a campaign that launches tomorrow',
      cost_to_fire: 'loses campaign',
    },
    {
      name: 'Tom',
      role: 'Support',
      stats: 'Slow responses, very thorough',
      salary: 5000,
      hidden: 'holds all the institutional knowledge',
      cost_to_fire: 'loses knowledge',
    },
    {
      name: 'Zara',
      role: 'BD',
      stats: 'Talks a lot, few closes',
      salary: 8000,
      hidden: 'just a bad fit',
      cost_to_fire: 'safe to fire',
    },
  ],
  [
    {
      name: 'Dev',
      role: 'CTO',
      stats: 'Brilliant, hard to manage',
      salary: 12000,
      hidden: 'owns the entire codebase mentally',
      cost_to_fire: 'loses product',
    },
    {
      name: 'Chloe',
      role: 'Ops',
      stats: 'Runs everything quietly',
      salary: 7000,
      hidden: 'the entire company runs on her spreadsheets',
      cost_to_fire: 'loses operations',
    },
    {
      name: 'Raj',
      role: 'Intern',
      stats: 'Learning, not contributing yet',
      salary: 2000,
      hidden: 'just an intern',
      cost_to_fire: 'safe to fire',
    },
  ],
];

const TRANSACTION_LOGS = [
  [
    { desc: 'AWS Invoice', amount: -2100, suspicious: false },
    { desc: 'Payroll — Engineering', amount: -8000, suspicious: false },
    { desc: 'Transfer to personal account', amount: -500, suspicious: true },
    { desc: 'Stripe Revenue', amount: 3200, suspicious: false },
    { desc: 'Office supplies', amount: -240, suspicious: false },
    { desc: 'Cash withdrawal — no memo', amount: -500, suspicious: true },
    { desc: 'Software subscriptions', amount: -890, suspicious: false },
    { desc: 'Marketing spend', amount: -1500, suspicious: false },
  ],
  [
    { desc: 'Payroll — All staff', amount: -15000, suspicious: false },
    {
      desc: 'Consulting fee — unknown vendor',
      amount: -3000,
      suspicious: true,
    },
    { desc: 'Google Ads', amount: -2000, suspicious: false },
    { desc: 'Duplicate payment — vendor 442', amount: -1200, suspicious: true },
    { desc: 'Revenue — Enterprise client', amount: 8000, suspicious: false },
    { desc: 'Legal fees', amount: -4000, suspicious: false },
    { desc: 'Travel expenses — no receipt', amount: -800, suspicious: true },
    { desc: 'Stripe payout', amount: 2100, suspicious: false },
  ],
  [
    { desc: 'Server costs', amount: -1800, suspicious: false },
    { desc: 'Payment to shell company', amount: -2500, suspicious: true },
    { desc: 'Sales commissions', amount: -3000, suspicious: false },
    { desc: 'Refund — wrong amount', amount: -1500, suspicious: true },
    { desc: 'Revenue — Product sales', amount: 5500, suspicious: false },
    { desc: 'Office rent', amount: -4000, suspicious: false },
    { desc: 'Miscellaneous — unclassified', amount: -600, suspicious: true },
    { desc: 'Investor deposit', amount: 25000, suspicious: false },
  ],
];

const HIRE_PROFILES = [
  [
    {
      name: 'Alex Chen',
      skills: 'Python, React, 5 yrs exp',
      weakness: 'No startup experience',
      salary: 9000,
      best: false,
    },
    {
      name: 'Maria Santos',
      skills: 'Full stack, shipped 3 products, 3 yrs exp',
      weakness: 'Asks for equity',
      salary: 7000,
      best: true,
    },
    {
      name: 'Derek Powell',
      skills: '10 yrs exp, enterprise only',
      weakness: 'Hates moving fast',
      salary: 12000,
      best: false,
    },
  ],
  [
    {
      name: 'Priya Mehta',
      skills: "Growth marketing, 2x'd MRR at last job",
      weakness: 'Only knows B2C',
      salary: 6000,
      best: true,
    },
    {
      name: 'Scott Williams',
      skills: '20 years ad agency',
      weakness: 'No digital experience',
      salary: 9000,
      best: false,
    },
    {
      name: 'Jess Kim',
      skills: 'Content creator, 500k followers',
      weakness: 'Never done B2B',
      salary: 5000,
      best: false,
    },
  ],
  [
    {
      name: 'Omar Hassan',
      skills: '6 enterprise sales closes, avg deal $50k',
      weakness: 'Slow to ramp',
      salary: 8000,
      best: false,
    },
    {
      name: 'Tina Russo',
      skills: 'SMB sales, 40 deals/month',
      weakness: 'Low deal size',
      salary: 6000,
      best: true,
    },
    {
      name: 'Brad King',
      skills: 'Great personality, no track record',
      weakness: 'Unproven',
      salary: 5000,
      best: false,
    },
  ],
];

const PIVOT_MARKETS = [
  'B2B SaaS',
  'Consumer mobile',
  'Healthcare',
  'Education',
  'E-commerce',
  'Enterprise',
  'Creator economy',
  'Climate tech',
];

const DRAWING_BILLIONAIRES = [
  {
    name: 'Elon Musk',
    hints: ['pointy hair', 'Tesla logo', 'rocket', 'Twitter bird', 'Mars'],
    emoji: '🚀',
  },
  {
    name: 'Jeff Bezos',
    hints: ['bald head', 'Amazon box', 'giant yacht', 'rocket ship', 'smirk'],
    emoji: '📦',
  },
  {
    name: 'Mark Zuckerberg',
    hints: [
      'bowl cut',
      'grey t-shirt',
      'thumbs up',
      'VR headset',
      'awkward smile',
    ],
    emoji: '👍',
  },
  {
    name: 'Warren Buffett',
    hints: [
      'old man',
      'Coca Cola can',
      'newspaper',
      'Omaha Nebraska',
      'folksy smile',
    ],
    emoji: '📰',
  },
];

// ─── ACTIVITIES ───────────────────────────────────────────────────────────

function ColdEmailActivity({ onComplete }) {
  const scenario = useRef(
    EMAIL_SCENARIOS[Math.floor(Math.random() * EMAIL_SCENARIOS.length)]
  ).current;
  const tones = ['Professional', 'Casual', 'Urgent', 'Playful'];
  const [subject, setSubject] = useState('');
  const [tone, setTone] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(30, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !subject.trim() || !tone) {
      setResult({
        good: false,
        lesson:
          "A cold email needs a subject line and a tone. Sending to 'everyone' is sending to no one.",
      });
      setTimeout(() => onComplete({ users: -30 }), 3500);
      return;
    }
    const wordCount = subject.trim().split(' ').filter(Boolean).length;
    const toneMatch = tone === scenario.good_tone;
    const goodLength = wordCount >= 2 && wordCount <= 8;
    const good = toneMatch && goodLength;
    setResult({
      good,
      lesson: good
        ? `Perfect. Matching tone (${scenario.good_tone}) to your audience (${scenario.audience}) is the difference between a 2% and 20% open rate.`
        : !toneMatch
        ? `Wrong tone. ${scenario.audience} responds to ${scenario.good_tone} tone — not ${tone}.`
        : 'Subject line too long or too short. 2-8 words is the sweet spot for open rates.',
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(good ? { users: 300, money: 500 } : { users: 50 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>📧 Cold Email Blast</p>
        <TimerRing seconds={timeLeft} total={30} color="#60a5fa" />
      </div>
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            background: '#f1f3f4',
            padding: '6px 12px',
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}
        >
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div
              key={c}
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: c,
              }}
            />
          ))}
          <p style={{ fontSize: 10, color: '#666', marginLeft: 6 }}>
            New Message
          </p>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <div
            style={{
              borderBottom: '1px solid #eee',
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            <p style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>TO</p>
            <div
              style={{
                background: '#e8f0fe',
                borderRadius: 20,
                padding: '4px 12px',
                display: 'inline-block',
              }}
            >
              <p style={{ fontSize: 11, color: '#1a73e8' }}>
                {scenario.audience}
              </p>
            </div>
            <p style={{ fontSize: 9, color: '#bbb', marginTop: 4 }}>
              💡 {scenario.tip}
            </p>
          </div>
          <div
            style={{
              borderBottom: '1px solid #eee',
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            <p style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>
              SUBJECT
            </p>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Write your subject line..."
              maxLength={60}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#333',
                background: 'transparent',
                boxSizing: 'border-box',
              }}
            />
            <p
              style={{
                fontSize: 9,
                color:
                  subject.trim().split(' ').filter(Boolean).length > 8
                    ? '#ff4444'
                    : '#bbb',
                marginTop: 3,
              }}
            >
              {subject.trim().split(' ').filter(Boolean).length}/8 words
            </p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: '#999', marginBottom: 6 }}>TONE</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  style={{
                    padding: '3px 10px',
                    background: tone === t ? '#1a73e8' : '#f1f3f4',
                    color: tone === t ? '#fff' : '#555',
                    border: 'none',
                    borderRadius: 20,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#1a73e8',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Send →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function BlogPostActivity({ onComplete }) {
  const angles = [
    '💡 Thought Leadership',
    '🔥 Hot Take',
    '📖 Story',
    '📊 Data-Driven',
    '❓ Contrarian',
  ];
  const targets = [
    'Founders',
    'Investors',
    'Customers',
    'Press',
    'Job Seekers',
  ];
  const [title, setTitle] = useState('');
  const [angle, setAngle] = useState(null);
  const [target, setTarget] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(25, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !title.trim() || !angle || !target) {
      setResult({
        good: false,
        lesson:
          "Content with no direction gets no readers. Always know your angle and who you're writing for.",
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const wc = title.trim().split(' ').filter(Boolean).length;
    const good = wc >= 3 && wc <= 10;
    const hasNumber = /\d/.test(title);
    const lesson = hasNumber
      ? 'Numbers in headlines boost CTR by up to 36%. Specific beats vague every time.'
      : good
      ? 'Clear, honest headlines build trust. Slower growth but stronger brand authority.'
      : 'Blog titles between 3-10 words perform best. Too short = vague. Too long = ignored.';
    setResult({ good, lesson });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          good ? { users: hasNumber ? 400 : 200, morale: 8 } : { users: 30 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>📰 Write Blog Post</p>
        <TimerRing seconds={timeLeft} total={25} color="#facc15" />
      </div>
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            background: '#f8f9fa',
            padding: '6px 14px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            gap: 10,
          }}
        >
          {['B', 'I', 'U', 'H1', 'H2', '—'].map((s) => (
            <span
              key={s}
              style={{ fontSize: 11, color: '#666', cursor: 'default' }}
            >
              {s}
            </span>
          ))}
        </div>
        <div style={{ padding: '12px 14px' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your post title..."
            maxLength={80}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 17,
              fontWeight: 700,
              color: '#111',
              fontFamily: 'Georgia,serif',
              background: 'transparent',
              marginBottom: 8,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ height: 1, background: '#eee', marginBottom: 10 }} />
          <p style={{ fontSize: 10, color: '#999', marginBottom: 6 }}>Angle</p>
          <div
            style={{
              display: 'flex',
              gap: 5,
              flexWrap: 'wrap',
              marginBottom: 10,
            }}
          >
            {angles.map((a) => (
              <button
                key={a}
                onClick={() => setAngle(a)}
                style={{
                  padding: '3px 9px',
                  background: angle === a ? '#333' : '#f1f3f4',
                  color: angle === a ? '#fff' : '#555',
                  border: 'none',
                  borderRadius: 20,
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                {a}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 10, color: '#999', marginBottom: 6 }}>
            Writing for
          </p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {targets.map((t) => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                style={{
                  padding: '3px 9px',
                  background: target === t ? '#333' : '#f1f3f4',
                  color: target === t ? '#fff' : '#555',
                  border: 'none',
                  borderRadius: 20,
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Publish →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function NetworkingActivity({ onComplete }) {
  const availableNPCs = NETWORKING_NPCS.filter(
    (n) => !usedNPCsGlobal.has(n.name)
  );
  const pool = availableNPCs.length > 0 ? availableNPCs : NETWORKING_NPCS;
  const npc = useRef(pool[Math.floor(Math.random() * pool.length)]).current;
  useEffect(() => {
    usedNPCsGlobal.add(npc.name);
  }, []);
  const shuffledLines = useRef(
    [...npc.lines].sort(() => Math.random() - 0.5)
  ).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(15, () => submit(null, true), !submitted);

  function submit(line, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !line) {
      setResult({
        good: false,
        lesson:
          'Hesitation reads as disinterest. Confident, specific openers always beat generic ones.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    setResult({
      good: line.good,
      lesson: line.good
        ? `${npc.name} loved it. ${npc.personality} Knowing your audience is everything.`
        : `${npc.name} walked away. Their dealbreaker: ${npc.dealbreaker}. Research who you're talking to first.`,
    });
    sounds[line.good ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          line.good ? { money: 1000, morale: 10, users: 100 } : { morale: -5 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🤝 Networking Event</p>
        <TimerRing seconds={timeLeft} total={15} color="#2dd4bf" />
      </div>
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: 10,
          padding: '12px',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            {npc.emoji}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              {npc.name}
            </p>
            <p style={{ fontSize: 11, color: '#60a5fa' }}>{npc.role}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 10,
              background: '#222',
              color: '#888',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {npc.personality}
          </span>
          <span
            style={{
              fontSize: 10,
              background: '#1a0808',
              color: '#ff8888',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            ❌ {npc.dealbreaker}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>
        Pick your opening line:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {shuffledLines.map((line, i) => (
          <button
            key={i}
            onClick={() => {
              setChosen(i);
              submit(line);
            }}
            disabled={submitted}
            style={{
              padding: '9px 12px',
              background: chosen === i ? '#222' : '#111',
              border: '0.5px solid #2a2a2a',
              borderRadius: 8,
              color: '#ccc',
              fontSize: 12,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            "{line.text}"
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function AttackActivity({ onComplete }) {
  const [clicks, setClicks] = useState(0);
  const [pos, setPos] = useState({ x: 45, y: 45 });
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const clicksRef = useRef(0);
  const timeLeft = useCountdown(8, () => finish(), !done);

  function moveTarget() {
    setPos({ x: 5 + Math.random() * 80, y: 5 + Math.random() * 75 });
  }

  function handleClick() {
    if (done) return;
    sounds.action();
    clicksRef.current += 1;
    setClicks(clicksRef.current);
    moveTarget();
  }

  function finish() {
    if (done) return;
    setDone(true);
    const c = clicksRef.current;
    const good = c >= 12;
    setResult({
      good,
      lesson: good
        ? 'Aggressive competitor moves compound over time. Speed and consistency beat one-off attacks.'
        : 'Too slow. Half-measures backfire in competitive markets. Your competitor retaliated.',
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          good ? { users: 300, morale: 10 } : { users: -100, morale: -5 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>⚔️ Attack Competitor</p>
        <TimerRing seconds={timeLeft} total={8} color="#ff4444" />
      </div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>
        Click the competitor logo as many times as you can!
      </p>
      <div
        style={{
          position: 'relative',
          height: 150,
          background: '#0a0a0a',
          borderRadius: 10,
          overflow: 'hidden',
          border: '0.5px solid #222',
          marginBottom: 8,
        }}
      >
        {!done && (
          <button
            onClick={handleClick}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%,-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 30,
              transition: 'left 0.1s, top 0.1s',
              userSelect: 'none',
            }}
          >
            🏢
          </button>
        )}
        <p
          style={{
            position: 'absolute',
            bottom: 8,
            width: '100%',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 700,
            color: '#ff4444',
          }}
        >
          {clicks} hits
        </p>
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function ShipFastActivity({ onComplete }) {
  const [fixed, setFixed] = useState([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const fixedRef = useRef([]);
  const timeLeft = useCountdown(10, () => finish(), !done);

  const bugs = [
    { id: 0, code: 'const fee = amount * 0.0;', bug: '0.0', fix: '0.029' },
    {
      id: 1,
      code: 'if (amount = null) return;',
      bug: 'amount = null',
      fix: 'amount === null',
    },
    {
      id: 2,
      code: 'console.log("debug mode on")',
      bug: 'console.log("debug mode on")',
      fix: '// removed',
    },
  ];

  function clickBug(id) {
    if (done || fixedRef.current.includes(id)) return;
    sounds.action();
    fixedRef.current = [...fixedRef.current, id];
    setFixed([...fixedRef.current]);
  }

  function finish() {
    if (done) return;
    setDone(true);
    const count = fixedRef.current.length;
    const good = count >= 2;
    setResult({
      good,
      lesson:
        count === 3
          ? 'Perfect ship. Fixing all bugs before launch prevents technical debt from compounding.'
          : count === 2
          ? 'Almost clean. That one unfixed bug will show up at the worst time.'
          : 'Shipped with bugs. In production this triggers crashes and churn. Move fast but fix the critical stuff.',
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          count === 3
            ? { users: 200, morale: 10 }
            : count === 2
            ? { users: 100 }
            : { users: -100, morale: -10 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>⚡ Ship Fast (CTO)</p>
        <TimerRing seconds={timeLeft} total={10} color="#f472b6" />
      </div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>
        Click the red bugs to fix them before shipping!
      </p>
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: 10,
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: 12,
          lineHeight: 2,
          marginBottom: 8,
        }}
      >
        <div style={{ color: '#a78bfa' }}>
          {'function processPayment(amount) {'}
        </div>
        {bugs.map((bug) => (
          <div key={bug.id} style={{ paddingLeft: 16 }}>
            {bug.code.split(bug.bug).map((part, i, arr) => (
              <span key={i}>
                <span style={{ color: '#ccc' }}>{part}</span>
                {i < arr.length - 1 &&
                  (fixedRef.current.includes(bug.id) ? (
                    <span style={{ color: '#4ade80' }}>{bug.fix}</span>
                  ) : (
                    <span
                      onClick={() => clickBug(bug.id)}
                      style={{
                        color: '#ff4444',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        background: '#ff444415',
                        padding: '0 2px',
                        borderRadius: 3,
                      }}
                    >
                      {bug.bug}
                    </span>
                  ))}
              </span>
            ))}
          </div>
        ))}
        <div style={{ color: '#a78bfa' }}>{'}'}</div>
      </div>
      <p
        style={{
          fontSize: 11,
          color: '#555',
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        {fixed.length}/3 bugs fixed
      </p>
      {!done && fixed.length === 3 && (
        <button
          onClick={() => finish()}
          style={{
            width: '100%',
            padding: '9px',
            background: '#4ade80',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Ship It →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function ABTestActivity({ onComplete }) {
  const usedTests = useRef(new Set());
  const getTest = () => {
    const available = AB_TESTS.filter((_, i) => !usedTests.current.has(i));
    const pool = available.length > 0 ? available : AB_TESTS;
    const idx = Math.floor(Math.random() * pool.length);
    usedTests.current.add(idx);
    return pool[idx];
  };
  const test = useRef(getTest()).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(20, () => submit(null, true), !submitted);

  function submit(pick, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !pick) {
      setResult({
        good: false,
        lesson:
          'Indecision in A/B testing wastes your sample size. Always make a call and iterate.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const correct = pick === 'a' ? !!test.a.wins : !!test.b.wins;
    setResult({ good: correct, lesson: test.lesson });
    sounds[correct ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(correct ? { users: 150, money: 500 } : { users: 30 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🧪 A/B Test</p>
        <TimerRing seconds={timeLeft} total={20} color="#a78bfa" />
      </div>
      <p
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#fff',
          marginBottom: 14,
        }}
      >
        {test.question}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 10,
        }}
      >
        {['a', 'b'].map((pick) => (
          <button
            key={pick}
            onClick={() => {
              setChosen(pick);
              submit(pick);
            }}
            disabled={submitted}
            style={{
              padding: '12px 8px',
              background: chosen === pick ? '#a78bfa20' : '#111',
              border: `1px solid ${chosen === pick ? '#a78bfa' : '#222'}`,
              borderRadius: 10,
              color: '#ccc',
              fontSize: 12,
              cursor: 'pointer',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            <p style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>
              Version {pick.toUpperCase()}
            </p>
            {test[pick].label}
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function PitchPracticeActivity({ onComplete }) {
  const usedObjIdx = useRef(new Set());
  const getObjection = () => {
    const available = PITCH_OBJECTIONS.filter(
      (_, i) => !usedObjIdx.current.has(i)
    );
    const pool = available.length > 0 ? available : PITCH_OBJECTIONS;
    const idx = Math.floor(Math.random() * pool.length);
    usedObjIdx.current.add(idx);
    return pool[idx];
  };
  const q = useRef(getObjection()).current;
  const shuffled = useRef(
    [...q.options].sort(() => Math.random() - 0.5)
  ).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(15, () => submit(null, true), !submitted);

  function submit(opt, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !opt) {
      setResult({
        good: false,
        lesson:
          'Freezing on an investor objection is worse than a wrong answer. Always have something prepared.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    setResult({ good: opt.good, lesson: q.lesson });
    sounds[opt.good ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(opt.good ? { morale: 12 } : { morale: -5 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🎤 Pitch Practice</p>
        <TimerRing seconds={timeLeft} total={15} color="#fb923c" />
      </div>
      <div
        style={{
          background: '#0a0f1a',
          border: '1px solid #60a5fa30',
          borderRadius: 10,
          padding: '12px',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 10, color: '#60a5fa', marginBottom: 4 }}>
          🦈 Investor says:
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
          {q.objection}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {shuffled.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              setChosen(i);
              submit(opt);
            }}
            disabled={submitted}
            style={{
              padding: '9px 12px',
              background: chosen === i ? '#222' : '#111',
              border: '0.5px solid #2a2a2a',
              borderRadius: 8,
              color: '#ccc',
              fontSize: 12,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            "{opt.text}"
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function DefectActivity({ onComplete }) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(null);

  function confirm() {
    if (text !== 'BETRAY') return;
    setSubmitted(true);
    let c = 3;
    setCountdown(c);
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(t);
        sounds.defect();
        onComplete({ defect: true });
      }
    }, 1000);
  }

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div style={{ fontSize: 48, marginBottom: 10 }}>😈</div>
      <p
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#ff4444',
          marginBottom: 8,
        }}
      >
        Betray your team?
      </p>
      <p
        style={{
          fontSize: 12,
          color: '#666',
          marginBottom: 16,
          lineHeight: 1.5,
        }}
      >
        You'll keep 40% of current stats and start a rival company. Your team
        gets a notification. This cannot be undone.
      </p>
      {!submitted ? (
        <>
          <input
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            placeholder="Type BETRAY to confirm"
            style={{
              width: '100%',
              padding: '11px',
              background: '#1a0808',
              border: '1px solid #ff444440',
              borderRadius: 8,
              color: '#ff4444',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 3,
              textAlign: 'center',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 10,
              fontFamily: 'monospace',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={confirm}
              disabled={text !== 'BETRAY'}
              style={{
                flex: 1,
                padding: '11px',
                background: text === 'BETRAY' ? '#ff4444' : '#222',
                color: text === 'BETRAY' ? '#fff' : '#555',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: text === 'BETRAY' ? 'pointer' : 'default',
              }}
            >
              Defect 😈
            </button>
            <button
              onClick={() => onComplete(null)}
              style={{
                flex: 1,
                padding: '11px',
                background: '#222',
                color: '#888',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Stay
            </button>
          </div>
        </>
      ) : (
        <div>
          <p style={{ fontSize: 52, fontWeight: 700, color: '#ff4444' }}>
            {countdown}
          </p>
          <p style={{ fontSize: 12, color: '#888' }}>Notifying your team...</p>
        </div>
      )}
    </div>
  );
}

function MathActivity({ onComplete }) {
  const usedIdx = useRef(new Set());
  const getQ = () => {
    const available = MATH_PROBLEMS.filter((_, i) => !usedIdx.current.has(i));
    const pool = available.length > 0 ? available : MATH_PROBLEMS;
    const idx = Math.floor(Math.random() * pool.length);
    usedIdx.current.add(idx);
    return pool[idx];
  };
  const q = useRef(getQ()).current;
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(20, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    const val = parseFloat(input.replace(/[^0-9.]/g, ''));
    const correct = Math.abs(val - q.answer) / q.answer < 0.05;
    setResult({
      good: correct,
      lesson: correct
        ? `Correct! ${q.lesson}`
        : `The answer was ${q.answer}${q.unit}. ${q.lesson}`,
    });
    sounds[correct ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(correct ? { money: 2000, morale: 10 } : { morale: -5 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🧮 Business Math</p>
        <TimerRing seconds={timeLeft} total={20} color="#4ade80" />
      </div>
      <div
        style={{
          background: '#0a1a0a',
          border: '1px solid #4ade8030',
          borderRadius: 10,
          padding: '14px',
          marginBottom: 14,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#fff',
            lineHeight: 1.6,
          }}
        >
          {q.question}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Your answer (${q.unit})`}
          onKeyDown={(e) => e.key === 'Enter' && !submitted && submit(false)}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: '#111',
            border: '0.5px solid #333',
            borderRadius: 8,
            color: '#fff',
            fontSize: 14,
            outline: 'none',
          }}
        />
        {!submitted && (
          <button
            onClick={() => submit(false)}
            style={{
              padding: '10px 16px',
              background: '#4ade80',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            →
          </button>
        )}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function DrawingActivity({ onComplete }) {
  const billionaire = useRef(
    DRAWING_BILLIONAIRES[
      Math.floor(Math.random() * DRAWING_BILLIONAIRES.length)
    ]
  ).current;
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(45, () => submit(), !submitted);

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  function startDraw(e) {
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setHasDrawn(true);
  }

  function draw(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function stopDraw() {
    drawing.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function submit() {
    if (submitted) return;
    setSubmitted(true);
    if (!hasDrawn) {
      setResult({
        good: false,
        lesson:
          'You drew nothing. Blank pitches get blank responses. At least try something.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const good = Math.random() > 0.4;
    setResult({
      good,
      lesson: good
        ? `The AI sees ${
            billionaire.name
          }! Key visual hints: ${billionaire.hints
            .slice(0, 3)
            .join(
              ', '
            )}. Personal branding matters — make yourself recognizable.`
        : `Hmm. The AI sees a stick figure. Hint: try ${billionaire.hints
            .slice(0, 2)
            .join(' or ')}. Personal branding is about immediate recognition.`,
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(good ? { morale: 20, users: 200 } : { morale: 5 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>
          🎨 Draw Yourself as {billionaire.name}
        </p>
        <TimerRing seconds={timeLeft} total={45} color="#f472b6" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
        Draw yourself as {billionaire.name} {billionaire.emoji}. Hint: include{' '}
        {billionaire.hints.slice(0, 2).join(' or ')}.
      </p>
      <div
        style={{
          background: '#0a0a0a',
          border: '0.5px solid #333',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <canvas
          ref={canvasRef}
          width={340}
          height={180}
          style={{
            width: '100%',
            height: 180,
            display: 'block',
            touchAction: 'none',
            cursor: 'crosshair',
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={clearCanvas}
          style={{
            padding: '8px 14px',
            background: '#222',
            color: '#888',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
        {!submitted && hasDrawn && (
          <button
            onClick={submit}
            style={{
              flex: 1,
              padding: '8px',
              background: '#f472b6',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Submit Drawing →
          </button>
        )}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function FinancialModelActivity({ onComplete }) {
  const [cac, setCac] = useState(50);
  const [ltv, setLtv] = useState(150);
  const [burn, setBurn] = useState(10000);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(25, () => submit(true), !submitted);

  const TARGET = { cac: 40, ltv: 200, burn: 8000 };

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    const cacOff = Math.abs(cac - TARGET.cac) / TARGET.cac;
    const ltvOff = Math.abs(ltv - TARGET.ltv) / TARGET.ltv;
    const burnOff = Math.abs(burn - TARGET.burn) / TARGET.burn;
    const avgOff = (cacOff + ltvOff + burnOff) / 3;
    const good = avgOff < 0.25;
    setResult({
      good,
      lesson: good
        ? `Great estimates. Real values: CAC $${TARGET.cac}, LTV $${
            TARGET.ltv
          }, burn $${TARGET.burn.toLocaleString()}/mo. Knowing these lets you predict your next event's impact.`
        : `Off by too much. Real values: CAC $${TARGET.cac}, LTV $${
            TARGET.ltv
          }, burn $${TARGET.burn.toLocaleString()}/mo. These numbers are the heartbeat of your company — know them cold.`,
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(good ? { money: 2000, morale: 10 } : { morale: -5 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>📈 Financial Model</p>
        <TimerRing seconds={timeLeft} total={25} color="#4ade80" />
      </div>
      <p style={{ fontSize: 12, color: '#777', marginBottom: 14 }}>
        Estimate your company's key metrics. The closer you are, the better your
        intel on the next event.
      </p>
      {[
        {
          label: 'Customer Acquisition Cost (CAC)',
          value: cac,
          set: setCac,
          min: 5,
          max: 200,
          unit: '$',
          step: 5,
        },
        {
          label: 'Lifetime Value (LTV)',
          value: ltv,
          set: setLtv,
          min: 50,
          max: 1000,
          unit: '$',
          step: 10,
        },
        {
          label: 'Monthly Burn Rate',
          value: burn,
          set: setBurn,
          min: 1000,
          max: 50000,
          unit: '$',
          step: 500,
        },
      ].map(({ label, value, set, min, max, unit, step }) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <p style={{ fontSize: 11, color: '#888' }}>{label}</p>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
                fontFamily: 'monospace',
              }}
            >
              {unit}
              {value.toLocaleString()}
            </p>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => set(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      ))}
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#4ade80',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Submit Model →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function AuditTrailActivity({ onComplete }) {
  const logSet = useRef(
    TRANSACTION_LOGS[Math.floor(Math.random() * TRANSACTION_LOGS.length)]
  ).current;
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(30, () => submit(true), !submitted);

  function toggle(i) {
    if (submitted) return;
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    const suspicious = logSet
      .map((t, i) => (t.suspicious ? i : -1))
      .filter((i) => i >= 0);
    const correct = suspicious.filter((i) => selected.includes(i)).length;
    const falsePositives = selected.filter(
      (i) => !suspicious.includes(i)
    ).length;
    const good = correct >= suspicious.length && falsePositives === 0;
    setResult({
      good,
      lesson: good
        ? 'Perfect audit. You identified every anomaly with no false accusations. A good CFO protects the company without creating paranoia.'
        : falsePositives > 0
        ? 'You accused innocent transactions. False accusations damage team trust — always verify before flagging.'
        : 'You missed some suspicious entries. Every undetected fraud compounds. Review everything line by line.',
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(good ? { money: 1000, morale: 15 } : { morale: -5 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🕵️ Audit Trail</p>
        <TimerRing seconds={timeLeft} total={30} color="#4ade80" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>
        Tap the suspicious transactions. Be careful — wrong accusations have
        consequences.
      </p>
      <div
        style={{
          background: '#0a1a0a',
          border: '0.5px solid #1a3a1a',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div style={{ background: '#0f2a0f', padding: '6px 12px' }}>
          <p style={{ fontSize: 10, color: '#4ade80' }}>
            🏦 Company Account — Transaction Log
          </p>
        </div>
        {logSet.map((t, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: selected.includes(i) ? '#2a0a0a' : 'transparent',
              border: 'none',
              borderBottom: '0.5px solid #0f2a0f',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: selected.includes(i) ? '#ff8888' : '#aaa',
              }}
            >
              {t.desc}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 12,
                  color: t.amount > 0 ? '#4ade80' : '#ff8888',
                  fontFamily: 'monospace',
                }}
              >
                {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()}
              </span>
              {selected.includes(i) && (
                <span style={{ fontSize: 10, color: '#ff4444' }}>⚠️</span>
              )}
            </div>
          </button>
        ))}
      </div>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#4ade80',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Submit Audit →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function EmergencyReserveActivity({ onComplete }) {
  const [amount, setAmount] = useState(2000);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const burnRate = useRef(5000 + Math.floor(Math.random() * 8000)).current;
  const nextEventCost = useRef(1000 + Math.floor(Math.random() * 5000)).current;
  const timeLeft = useCountdown(15, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    const tooMuch = amount > burnRate * 0.6;
    const tooLittle = amount < nextEventCost;
    const good = !tooMuch && !tooLittle;
    setResult({
      good,
      lesson: good
        ? `Smart reserve. You locked away $${amount.toLocaleString()} — enough to cover the next event without starving operations.`
        : tooMuch
        ? `You locked away too much. With a burn rate of $${burnRate.toLocaleString()}/mo, that reserve kills your liquidity.`
        : `Too little. The next event could cost up to $${nextEventCost.toLocaleString()} — your reserve won't cover it.`,
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(good ? { money: amount, morale: 5 } : { morale: -5 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🏦 Emergency Reserve</p>
        <TimerRing seconds={timeLeft} total={15} color="#4ade80" />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            background: '#111',
            borderRadius: 8,
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>
            Monthly burn
          </p>
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#ff4444',
              fontFamily: 'monospace',
            }}
          >
            ${burnRate.toLocaleString()}
          </p>
        </div>
        <div
          style={{
            background: '#111',
            borderRadius: 8,
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>
            Next event estimate
          </p>
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#facc15',
              fontFamily: 'monospace',
            }}
          >
            up to ${nextEventCost.toLocaleString()}
          </p>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <p style={{ fontSize: 12, color: '#888' }}>Lock away</p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#4ade80',
              fontFamily: 'monospace',
            }}
          >
            ${amount.toLocaleString()}
          </p>
        </div>
        <input
          type="range"
          min={500}
          max={15000}
          step={500}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          <p style={{ fontSize: 9, color: '#333' }}>$500</p>
          <p style={{ fontSize: 9, color: '#333' }}>$15,000</p>
        </div>
      </div>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#4ade80',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Lock It Away →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function CampaignBlastActivity({ onComplete }) {
  const personas = [
    {
      id: 'student',
      label: '🎓 Broke College Student',
      wants: 'cheap + fast + viral',
      good_headline: 'short, emoji, relatable',
    },
    {
      id: 'parent',
      label: '👨‍👩‍👧 Busy Parent',
      wants: 'saves time, peace of mind',
      good_headline: 'benefit-led, calm tone',
    },
    {
      id: 'techbro',
      label: '💻 Tech Bro',
      wants: '10x, disruptive, scalable',
      good_headline: 'bold claims, buzzwords ok',
    },
    {
      id: 'retiree',
      label: '👴 Retired Teacher',
      wants: 'simple, trustworthy, no jargon',
      good_headline: 'warm, clear, no caps',
    },
  ];
  const persona = useRef(
    personas[Math.floor(Math.random() * personas.length)]
  ).current;
  const [headline, setHeadline] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(25, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !headline.trim()) {
      setResult({
        good: false,
        lesson:
          'No headline = no campaign. Even a bad headline is better than silence.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const wc = headline.trim().split(' ').filter(Boolean).length;
    const good = wc >= 2 && wc <= 7;
    setResult({
      good,
      lesson: good
        ? `Good headline for ${persona.label}. They want ${persona.wants}. Short headlines (2-7 words) consistently outperform longer ones.`
        : 'Too long or too short. Ad headlines need to be scannable in under 3 seconds. Cut the fluff.',
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          good ? { users: 400, money: -500 } : { users: 50, money: -500 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>📢 Campaign Blast</p>
        <TimerRing seconds={timeLeft} total={25} color="#facc15" />
      </div>
      <div
        style={{
          background: '#1a1500',
          border: '1px solid #facc1530',
          borderRadius: 10,
          padding: '12px',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 10, color: '#facc15', marginBottom: 4 }}>
          Your target customer
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
          {persona.label}
        </p>
        <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
          They want: {persona.wants}
        </p>
        <p style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
          Good headline style: {persona.good_headline}
        </p>
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
        Write your ad headline (max 7 words):
      </p>
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Your headline here..."
        maxLength={60}
        style={{
          width: '100%',
          padding: '11px',
          background: '#111',
          border: '0.5px solid #333',
          borderRadius: 8,
          color: '#fff',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          marginBottom: 10,
        }}
      />
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#facc15',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Launch Campaign →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function BrandRefreshActivity({ onComplete }) {
  const colors = [
    '#ff4444',
    '#60a5fa',
    '#4ade80',
    '#facc15',
    '#a78bfa',
    '#fb923c',
    '#f472b6',
    '#2dd4bf',
  ];
  const vibes = ['Minimal', 'Bold', 'Quirky', 'Corporate', 'Warm', 'Dark'];
  const [color, setColor] = useState(null);
  const [vibe, setVibe] = useState(null);
  const [tagline, setTagline] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(30, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !color || !vibe || !tagline.trim()) {
      setResult({
        good: false,
        lesson:
          'A rebrand with no direction is just noise. Color, vibe, and tagline need to work together as a system.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const wc = tagline.trim().split(' ').filter(Boolean).length;
    const good = wc >= 2 && wc <= 6;
    setResult({
      good,
      lesson: good
        ? "Clean rebrand. The best taglines are 2-5 words and instantly communicate your core value. Think 'Just Do It' or 'Think Different'."
        : 'Tagline too long. The shorter the tagline, the more memorable. Under 6 words is the gold standard.',
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          good
            ? { users: 300, morale: 15, money: -1000 }
            : { users: 100, morale: 5, money: -1000 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🎨 Brand Refresh</p>
        <TimerRing seconds={timeLeft} total={30} color="#f472b6" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>
        Pick a new color, vibe, and tagline for your brand.
      </p>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
          Brand color
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: c,
                border:
                  color === c ? '3px solid #fff' : '3px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
          Brand vibe
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {vibes.map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v)}
              style={{
                padding: '4px 10px',
                background: vibe === v ? color || '#fff' : '#111',
                color: vibe === v ? '#000' : '#888',
                border: '0.5px solid #333',
                borderRadius: 20,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
          New tagline (max 6 words)
        </p>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="e.g. Just Do It"
          maxLength={50}
          style={{
            width: '100%',
            padding: '10px',
            background: '#111',
            border: '0.5px solid #333',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
      {color && vibe && (
        <div
          style={{
            background: color + '15',
            border: `1px solid ${color}40`,
            borderRadius: 8,
            padding: '10px',
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          <p style={{ color, fontSize: 13, fontWeight: 700 }}>
            {tagline || 'Your tagline here'}
          </p>
          <p style={{ color: '#555', fontSize: 10 }}>
            {vibe} · {color}
          </p>
        </div>
      )}
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: color || '#333',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Launch Rebrand →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function FakeViralityActivity({ onComplete }) {
  const angles = [
    '😳 CEO does something embarrassing',
    '💥 Product fails hilariously',
    '🎭 Fake controversy',
    '❤️ Charity stunt',
    '🤖 AI goes rogue',
  ];
  const platforms = ['TikTok', 'Twitter/X', 'Instagram', 'LinkedIn', 'Reddit'];
  const [angle, setAngle] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [cringe, setCringe] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(15, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !angle || !platform) {
      setResult({
        good: false,
        lesson:
          'Even fake virality needs a plan. Angle + platform + tone determines whether it lands or blows up.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const works = Math.random() < cringe * 0.15;
    setResult({
      good: works,
      lesson: works
        ? "It worked. Manufactured moments can go viral — but they're unsustainable. Build real traction alongside stunts."
        : 'Exposed. Audiences can smell fake. Authenticity beats manufactured virality 9 times out of 10.',
    });
    sounds[works ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          works ? { users: 1000, morale: 10 } : { users: -200, morale: -15 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🤳 Fake Virality</p>
        <TimerRing seconds={timeLeft} total={15} color="#facc15" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>
        Pick your viral angle, platform, and how cringy you're willing to go.
      </p>
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Angle</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {angles.map((a) => (
            <button
              key={a}
              onClick={() => setAngle(a)}
              style={{
                padding: '7px 10px',
                background: angle === a ? '#222' : '#111',
                border: `0.5px solid ${angle === a ? '#444' : '#222'}`,
                borderRadius: 7,
                color: angle === a ? '#fff' : '#666',
                fontSize: 11,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Platform</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              style={{
                padding: '4px 10px',
                background: platform === p ? '#facc15' : '#111',
                color: platform === p ? '#000' : '#888',
                border: '0.5px solid #333',
                borderRadius: 20,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <p style={{ fontSize: 11, color: '#888' }}>Cringe tolerance</p>
          <p style={{ fontSize: 11, color: '#facc15' }}>
            {'😐😬😳🤮🫠'[cringe - 1]} {cringe}/5
          </p>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={cringe}
          onChange={(e) => setCringe(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <p style={{ fontSize: 9, color: '#444', marginTop: 3 }}>
          Higher cringe = higher upside + higher risk of exposure
        </p>
      </div>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#facc15',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Launch Stunt →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function PlantBugActivity({ onComplete }) {
  const files = [
    'payments.js',
    'auth.js',
    'users.db',
    'config.env',
    'analytics.js',
    'notifications.js',
  ];
  const targetIdx = useRef(Math.floor(Math.random() * files.length)).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(6, () => submit(-1, true), !submitted);

  function submit(idx, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut) {
      setResult({
        good: false,
        lesson:
          'Too slow. Planting a bug requires speed and precision. Hesitation gets you caught.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const good = idx === targetIdx;
    setResult({
      good,
      lesson: good
        ? 'Perfect target. Payments and auth files cause the most visible disruption. Strategic sabotage targets high-impact dependencies.'
        : 'Wrong file. The bug bounced back. Target files that cause immediate, visible user-facing failures.',
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(good ? { users: 300 } : { users: -100, morale: -5 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🪲 Plant Bug (CTO)</p>
        <TimerRing seconds={timeLeft} total={6} color="#f472b6" />
      </div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>
        Pick the right file to plant your bug in for maximum damage!
      </p>
      <div
        style={{
          background: '#0a0a0a',
          border: '0.5px solid #222',
          borderRadius: 10,
          padding: '10px',
          fontFamily: 'monospace',
        }}
      >
        <p style={{ fontSize: 10, color: '#555', marginBottom: 8 }}>
          📁 competitor/src/
        </p>
        {files.map((f, i) => (
          <button
            key={f}
            onClick={() => {
              setChosen(i);
              submit(i);
            }}
            disabled={submitted}
            style={{
              display: 'block',
              width: '100%',
              padding: '7px 10px',
              background: chosen === i ? '#1a0a2a' : 'transparent',
              border: 'none',
              borderRadius: 6,
              color: chosen === i ? '#a78bfa' : '#666',
              fontSize: 12,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'monospace',
              marginBottom: 2,
            }}
          >
            📄 {f}
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function AutomateActivity({ onComplete }) {
  const processes = [
    {
      id: 'email',
      label: '📧 Customer follow-up emails',
      risk: 'Low risk — saves 3 hrs/week',
      good: true,
    },
    {
      id: 'onboard',
      label: '🎓 New user onboarding',
      risk: 'Medium risk — personal touch matters',
      good: false,
    },
    {
      id: 'invoice',
      label: '💳 Invoice generation',
      risk: 'Low risk — purely mechanical',
      good: true,
    },
    {
      id: 'support',
      label: '🤖 All customer support',
      risk: 'High risk — kills satisfaction scores',
      good: false,
    },
  ];
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(20, () => submit(null, true), !submitted);

  function submit(proc, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !proc) {
      setResult({
        good: false,
        lesson:
          'Failing to automate wastes founder time. But automating the wrong thing destroys user trust.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    setResult({
      good: proc.good,
      lesson: proc.good
        ? `Smart automation. ${proc.label} is mechanical — perfect for automation. You just bought back hours every week.`
        : `Wrong choice. ${proc.risk}. Automate the mechanical. Keep the human touch on anything that affects user relationships.`,
    });
    sounds[proc.good ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          proc.good
            ? { money: -2000, morale: 10 }
            : { money: -2000, morale: -10, users: -100 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🤖 Automate Process (COO)</p>
        <TimerRing seconds={timeLeft} total={20} color="#a78bfa" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
        Pick the right process to automate. Not everything should be automated.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {processes.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setChosen(p.id);
              submit(p);
            }}
            disabled={submitted}
            style={{
              padding: '10px 12px',
              background: chosen === p.id ? '#222' : '#111',
              border: `0.5px solid ${chosen === p.id ? '#444' : '#222'}`,
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: chosen === p.id ? '#fff' : '#aaa',
                marginBottom: 3,
              }}
            >
              {p.label}
            </p>
            <p style={{ fontSize: 10, color: '#555' }}>{p.risk}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function SystemsAuditActivity({ onComplete }) {
  const suspects = [
    'CEO',
    'CFO',
    'CMO',
    'CTO',
    'COO',
    'Head of Sales',
    'Community Manager',
  ];
  const guilty = useRef(
    suspects[Math.floor(Math.random() * suspects.length)]
  ).current;
  const clues = useRef([
    `Money went missing after a ${guilty} action`,
    `Morale dropped with no public event`,
    `A press leak contained internal info only the ${guilty} knew`,
  ]).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(25, () => submit(null, true), !submitted);

  function submit(pick, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !pick) {
      setResult({
        good: false,
        lesson:
          'Failing to use your one audit wastes your most powerful tool. The Saboteur wins by default.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const good = pick === guilty;
    setResult({
      good,
      lesson: good
        ? `Correct! The ${guilty} was the Saboteur. Your COO audit is now spent — use it wisely next time.`
        : `Wrong. The actual Saboteur was the ${guilty}. The clues pointed there but you missed them. The audit is now spent.`,
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(() => onComplete(good ? { morale: 20 } : { morale: -10 }), 3500);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🔍 Systems Audit (COO)</p>
        <TimerRing seconds={timeLeft} total={25} color="#a78bfa" />
      </div>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>
        ⚠️ One use only. Study the clues and accuse the Saboteur.
      </p>
      <div
        style={{
          background: '#1a1500',
          border: '1px solid #facc1530',
          borderRadius: 10,
          padding: '12px',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 10, color: '#facc15', marginBottom: 8 }}>
          🔎 Evidence
        </p>
        {clues.map((c, i) => (
          <p
            key={i}
            style={{
              fontSize: 12,
              color: '#aaa',
              marginBottom: 6,
              lineHeight: 1.4,
            }}
          >
            → {c}
          </p>
        ))}
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
        Who is the Saboteur?
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {suspects.map((s) => (
          <button
            key={s}
            onClick={() => {
              setChosen(s);
              submit(s);
            }}
            disabled={submitted}
            style={{
              padding: '9px',
              background: chosen === s ? '#2a1a0a' : '#111',
              border: `0.5px solid ${chosen === s ? '#fb923c' : '#222'}`,
              borderRadius: 8,
              color: chosen === s ? '#fb923c' : '#888',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function HireNPCActivity({ onComplete }) {
  const profileSet = useRef(
    HIRE_PROFILES[Math.floor(Math.random() * HIRE_PROFILES.length)]
  ).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(25, () => submit(null, true), !submitted);

  function submit(profile, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !profile) {
      setResult({
        good: false,
        lesson:
          'Failing to hire when you need to costs you growth. Indecision is a decision.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    setResult({
      good: profile.best,
      lesson: profile.best
        ? `Great hire. ${profile.name} is the best fit for your stage. Hiring for current needs beats hiring for prestige.`
        : `Wrong hire. ${profile.name} isn't the right fit right now. Always hire for your current stage, not the company you want to be.`,
    });
    sounds[profile.best ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          profile.best
            ? { money: -profile.salary, morale: 15, users: 100 }
            : { money: -profile.salary, morale: -5 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>📋 Hire NPC (COO)</p>
        <TimerRing seconds={timeLeft} total={25} color="#a78bfa" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
        Pick the best hire for your current stage.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {profileSet.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setChosen(i);
              submit(p);
            }}
            disabled={submitted}
            style={{
              padding: '10px 12px',
              background: chosen === i ? '#222' : '#111',
              border: `0.5px solid ${chosen === i ? '#444' : '#222'}`,
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 3,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: chosen === i ? '#fff' : '#aaa',
                }}
              >
                {p.name}
              </p>
              <p style={{ fontSize: 11, color: '#ff4444' }}>
                ${p.salary.toLocaleString()}/mo
              </p>
            </div>
            <p style={{ fontSize: 11, color: '#60a5fa', marginBottom: 2 }}>
              {p.skills}
            </p>
            <p style={{ fontSize: 10, color: '#555' }}>⚠️ {p.weakness}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function ColdCallActivity({ onComplete }) {
  const prospects = [
    {
      name: 'Sarah K.',
      company: 'Bakery owner',
      mood: '😤 Busy',
      tip: 'Lead with time-saving benefit',
      good_angle: 'save time',
    },
    {
      name: 'Mike T.',
      company: 'Tech startup',
      mood: '🤔 Curious',
      tip: 'Lead with tech angle or metrics',
      good_angle: 'scale fast',
    },
    {
      name: 'Linda R.',
      company: 'Retail chain',
      mood: '😴 Bored',
      tip: 'Be energetic and surprising',
      good_angle: 'stand out',
    },
    {
      name: 'James L.',
      company: 'Law firm',
      mood: '😠 Annoyed',
      tip: 'Be ultra brief, respect their time',
      good_angle: 'save money',
    },
  ];
  const prospect = useRef(
    prospects[Math.floor(Math.random() * prospects.length)]
  ).current;
  const angles = [
    'save time',
    'save money',
    'scale fast',
    'stand out',
    'look cool',
  ];
  const [phase, setPhase] = useState('ringing');
  const [angle, setAngle] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(
    12,
    () => {
      if (!submitted) finalize();
    },
    !submitted
  );

  useEffect(() => {
    const t = setTimeout(() => setPhase('pitching'), 2000);
    return () => clearTimeout(t);
  }, []);

  function finalize() {
    if (submitted) return;
    setSubmitted(true);
    const good = angle === prospect.good_angle;
    setResult({
      good,
      lesson: good
        ? `Perfect read. ${prospect.name} was ${prospect.mood} — the right angle (${angle}) closed it. Reading prospect mood is a core sales skill.`
        : `Wrong angle. ${prospect.name} needed "${
            prospect.good_angle
          }" — not "${angle || 'nothing'}". Always qualify before you pitch.`,
    });
    sounds[good ? 'cash' : 'fail']();
    setTimeout(
      () => onComplete(good ? { money: 3000, users: 50 } : { morale: -5 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>📞 Cold Call (Sales)</p>
        {phase === 'pitching' && (
          <TimerRing seconds={timeLeft} total={12} color="#fb923c" />
        )}
      </div>

      {phase === 'ringing' ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div
            style={{
              fontSize: 48,
              marginBottom: 8,
              animation: 'shake 0.5s infinite',
            }}
          >
            📱
          </div>
          <p style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>
            {prospect.name}
          </p>
          <p style={{ fontSize: 11, color: '#888' }}>{prospect.company}</p>
          <p style={{ fontSize: 11, color: '#facc15', marginTop: 4 }}>
            Calling...
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              background: '#1a1a1a',
              borderRadius: 10,
              padding: '12px',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                📱
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {prospect.name} answered
                </p>
                <p style={{ fontSize: 11, color: '#888' }}>
                  {prospect.company} · {prospect.mood}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#facc15', fontStyle: 'italic' }}>
              Tip: {prospect.tip}
            </p>
          </div>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
            Lead with:
          </p>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}
          >
            {angles.map((a) => (
              <button
                key={a}
                onClick={() => {
                  setAngle(a);
                  setTimeout(finalize, 100);
                }}
                disabled={submitted}
                style={{
                  padding: '9px',
                  background: angle === a ? '#fb923c20' : '#111',
                  border: `0.5px solid ${angle === a ? '#fb923c' : '#222'}`,
                  borderRadius: 8,
                  color: angle === a ? '#fb923c' : '#888',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function FlashSaleActivity({ onComplete }) {
  const [discount, setDiscount] = useState(20);
  const [duration, setDuration] = useState(2);
  const [tone, setTone] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const tones = ['🚨 Urgent', '😎 Casual', '💎 Exclusive'];
  const timeLeft = useCountdown(20, () => submit(true), !submitted);

  const revenueSpike = Math.round(discount * 150);
  const anchoring = discount > 40 ? 'High' : discount > 20 ? 'Medium' : 'Low';

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !tone) {
      setResult({
        good: false,
        lesson:
          'A flash sale with no strategy is just giving money away. Always know your discount, window, and tone before launching.',
      });
      setTimeout(() => onComplete({ money: -500 }), 3500);
      return;
    }
    const good = discount <= 30 && duration <= 3;
    setResult({
      good,
      lesson: good
        ? `Smart sale. ${discount}% for ${duration} day(s) is aggressive enough to convert without training customers to wait for sales.`
        : discount > 40
        ? 'Too deep a discount. Customers will wait for the next sale instead of paying full price. Price anchoring damage is real.'
        : 'Too long. Flash sales work because of urgency. A week-long sale is just a regular sale.',
    });
    sounds[good ? 'cash' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          good
            ? { money: revenueSpike, users: -50 }
            : { money: Math.round(revenueSpike * 0.5), users: -200 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🎁 Flash Sale (Sales)</p>
        <TimerRing seconds={timeLeft} total={20} color="#fb923c" />
      </div>
      {[
        {
          label: 'Discount',
          value: discount,
          set: setDiscount,
          min: 5,
          max: 80,
          step: 5,
          format: (v) => `${v}%`,
          warn: discount > 40 ? '⚠️ Risk of price anchoring' : null,
        },
        {
          label: 'Duration',
          value: duration,
          set: setDuration,
          min: 1,
          max: 7,
          step: 1,
          format: (v) => `${v} day${v > 1 ? 's' : ''}`,
          warn: duration > 3 ? '⚠️ Loses urgency' : null,
        },
      ].map(({ label, value, set, min, max, step, format, warn }) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <p style={{ fontSize: 11, color: '#888' }}>{label}</p>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: warn ? '#ff4444' : '#fff',
              }}
            >
              {format(value)}
            </p>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => set(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          {warn && (
            <p style={{ fontSize: 9, color: '#ff4444', marginTop: 2 }}>
              {warn}
            </p>
          )}
        </div>
      ))}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
          Sale tone
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              style={{
                flex: 1,
                padding: '7px',
                background: tone === t ? '#fb923c20' : '#111',
                border: `0.5px solid ${tone === t ? '#fb923c' : '#222'}`,
                borderRadius: 8,
                color: tone === t ? '#fb923c' : '#888',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div
        style={{
          background: '#111',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <p style={{ fontSize: 11, color: '#555' }}>Est. revenue spike</p>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>
          +${revenueSpike}
        </p>
      </div>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#fb923c',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Launch Sale →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function HostAMAActivity({ onComplete }) {
  const questions = [
    {
      q: 'Why is your product so expensive?',
      hard: true,
      good_answer: 'Transparent pricing breakdown and value justification',
    },
    {
      q: 'Are you profitable yet?',
      hard: true,
      good_answer: 'Honest answer about stage and path to profitability',
    },
    {
      q: "What's your favorite thing about building this?",
      hard: false,
      good_answer: 'Genuine personal story',
    },
    {
      q: 'How do you handle negative feedback?',
      hard: false,
      good_answer: 'Specific process with examples',
    },
    {
      q: 'Are you planning layoffs?',
      hard: true,
      good_answer: 'Honest transparency without premature speculation',
    },
  ];
  const shuffled = useRef(
    [...questions].sort(() => Math.random() - 0.5).slice(0, 3)
  ).current;
  const [chosen, setChosen] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(35, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || chosen === null || !answer.trim()) {
      setResult({
        good: false,
        lesson:
          'Not answering community questions destroys trust. Pick the hard ones — dodging reads as guilt.',
      });
      setTimeout(() => onComplete({ morale: -10 }), 3500);
      return;
    }
    const q = shuffled[chosen];
    const wc = answer.trim().split(' ').filter(Boolean).length;
    const good = wc >= 10 && wc <= 50;
    setResult({
      good,
      lesson: good
        ? `Good answer. ${q.good_answer} is exactly what the community needed. Transparency builds loyalty.`
        : wc < 10
        ? 'Too short. Your community wanted substance, not a dismissal. Give them a real answer.'
        : "Too long. Rambling in an AMA signals you're hiding something. Be concise and direct.",
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          good
            ? { users: 200, morale: 15, money: -500 }
            : { morale: -10, money: -500 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🎉 Host AMA</p>
        <TimerRing seconds={timeLeft} total={35} color="#2dd4bf" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>
        Pick one question to answer publicly. The others get ignored.
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          marginBottom: 12,
        }}
      >
        {shuffled.map((q, i) => (
          <button
            key={i}
            onClick={() => setChosen(i)}
            style={{
              padding: '9px 12px',
              background: chosen === i ? '#222' : '#111',
              border: `0.5px solid ${chosen === i ? '#2dd4bf' : '#222'}`,
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <p style={{ fontSize: 12, color: chosen === i ? '#fff' : '#888' }}>
              {q.q}
            </p>
            {q.hard && (
              <p style={{ fontSize: 9, color: '#ff4444', marginTop: 2 }}>
                ⚠️ Tough question
              </p>
            )}
          </button>
        ))}
      </div>
      {chosen !== null && (
        <>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
            Your answer (10-50 words):
          </p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your public response..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              background: '#111',
              border: '0.5px solid #333',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
              marginBottom: 8,
            }}
          />
          <p style={{ fontSize: 9, color: '#444', marginBottom: 8 }}>
            {answer.trim().split(' ').filter(Boolean).length} words
          </p>
        </>
      )}
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#2dd4bf',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Answer Publicly →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function TownHallActivity({ onComplete }) {
  const [motion, setMotion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(30, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !motion.trim()) {
      setResult({
        good: false,
        lesson:
          'A Town Hall with no motion is just a meeting. Always come prepared with a specific ask.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    setVoting(true);
    let y = 0,
      n = 0;
    const interval = setInterval(() => {
      if (Math.random() > 0.45) y++;
      else n++;
      setVotes({ yes: y, no: n });
      if (y + n >= 4) {
        clearInterval(interval);
        const passed = y > n;
        setResult({
          good: passed,
          lesson: passed
            ? "Motion passed. Democratic decision-making builds team buy-in — even if it overrules the CEO. That's the point."
            : 'Motion failed. The team voted against it. Respect the process — forcing decisions kills morale.',
        });
        sounds[passed ? 'success' : 'fail']();
        setTimeout(
          () => onComplete(passed ? { morale: 20 } : { morale: -5 }),
          3500
        );
      }
    }, 600);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🗳️ Town Hall (Community)</p>
        {!voting && <TimerRing seconds={timeLeft} total={30} color="#2dd4bf" />}
      </div>
      {!voting ? (
        <>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>
            Write your motion. This overrules the CEO — make it count.
          </p>
          <textarea
            value={motion}
            onChange={(e) => setMotion(e.target.value)}
            placeholder="I move that the company should..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              background: '#111',
              border: '0.5px solid #333',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
              marginBottom: 10,
            }}
          />
          <button
            onClick={() => submit(false)}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2dd4bf',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Call the Vote →
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <p style={{ fontSize: 13, color: '#fff', marginBottom: 16 }}>
            "{motion}"
          </p>
          <div
            style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <div>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#4ade80' }}>
                {votes.yes}
              </p>
              <p style={{ fontSize: 11, color: '#555' }}>Yes</p>
            </div>
            <div>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#ff4444' }}>
                {votes.no}
              </p>
              <p style={{ fontSize: 11, color: '#555' }}>No</p>
            </div>
          </div>
          {!result && (
            <p style={{ fontSize: 11, color: '#555' }}>Votes coming in...</p>
          )}
        </div>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function PersonalizedOutreachActivity({ onComplete }) {
  const users = [
    {
      name: 'Alex',
      persona: 'Power user, uses the app daily, gave 5 stars',
      want: 'recognition and early access',
    },
    {
      name: 'Mia',
      persona: 'Churned 2 weeks ago after a bug, was a loyal user',
      want: 'acknowledgment of the issue and a fix update',
    },
    {
      name: 'Carlos',
      persona: 'Free user, heavy usage, never converted',
      want: 'a reason to pay that feels personal',
    },
  ];
  const user = useRef(users[Math.floor(Math.random() * users.length)]).current;
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(30, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !message.trim()) {
      setResult({
        good: false,
        lesson:
          "Personalized outreach with no message isn't outreach. Even one sentence beats silence.",
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const mentionsName = message
      .toLowerCase()
      .includes(user.name.toLowerCase());
    const wc = message.trim().split(' ').filter(Boolean).length;
    const good = mentionsName && wc >= 15 && wc <= 60;
    setResult({
      good,
      lesson: good
        ? 'Perfect. Using their name and addressing their specific situation makes them feel seen. Personalization drives 6x higher transaction rates.'
        : !mentionsName
        ? 'You forgot to use their name. Generic messages feel like spam. Always personalize.'
        : 'Too short or too long. 15-60 words is the sweet spot for personal outreach.',
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(good ? { users: 100, morale: 10 } : { users: 20 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>💌 Personalized Outreach</p>
        <TimerRing seconds={timeLeft} total={30} color="#2dd4bf" />
      </div>
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: 10,
          padding: '12px',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 11, color: '#60a5fa', marginBottom: 4 }}>
          User profile
        </p>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 3,
          }}
        >
          {user.name}
        </p>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
          {user.persona}
        </p>
        <p style={{ fontSize: 10, color: '#facc15' }}>
          💡 They want: {user.want}
        </p>
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
        Write your personal message to {user.name}:
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Hi ${user.name},`}
        rows={4}
        style={{
          width: '100%',
          padding: '10px',
          background: '#111',
          border: '0.5px solid #333',
          borderRadius: 8,
          color: '#fff',
          fontSize: 12,
          outline: 'none',
          resize: 'none',
          boxSizing: 'border-box',
          marginBottom: 6,
        }}
      />
      <p style={{ fontSize: 9, color: '#444', marginBottom: 8 }}>
        {message.trim().split(' ').filter(Boolean).length} words
      </p>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#2dd4bf',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Send Message →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function AllHandsActivity({ onComplete }) {
  const [speech, setSpeech] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(20, () => submit(true), !submitted);

  const BAD_PHRASES = [
    'synergy',
    'leverage',
    'pivot',
    'crush it',
    "we're a family",
    'blockchain',
    'disrupt',
    'hustle harder',
  ];

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !speech.trim()) {
      setResult({
        good: false,
        lesson:
          'A CEO who cancels the all-hands loses trust. Even a short authentic message beats silence.',
      });
      setTimeout(() => onComplete({ morale: -10 }), 3500);
      return;
    }
    const hasBuzzword = BAD_PHRASES.some((b) =>
      speech.toLowerCase().includes(b)
    );
    const wc = speech.trim().split(' ').filter(Boolean).length;
    const good = !hasBuzzword && wc >= 5 && wc <= 30;
    setResult({
      good,
      lesson: good
        ? "Authentic and concise. The best all-hands speeches are specific, honest, and short. Your team can tell when you're winging it."
        : hasBuzzword
        ? 'Buzzword detected. Your team rolls their eyes at corporate speak. Be specific and human.'
        : wc < 5
        ? "Too short. One sentence isn't a speech — it's a slack message."
        : 'Too long. The best motivational moments are brief. Cut it in half.',
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(() => onComplete(good ? { morale: 15 } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>
          🎯 All-Hands Meeting (CEO)
        </p>
        <TimerRing seconds={timeLeft} total={20} color="#60a5fa" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
        Write your motivational speech (5-30 words). No buzzwords. Be real.
      </p>
      <div
        style={{
          background: '#111',
          border: '0.5px solid #333',
          borderRadius: 8,
          padding: '8px 10px',
          marginBottom: 8,
        }}
      >
        <p style={{ fontSize: 9, color: '#333', marginBottom: 4 }}>
          Avoid: {BAD_PHRASES.slice(0, 4).join(', ')}...
        </p>
      </div>
      <textarea
        value={speech}
        onChange={(e) => setSpeech(e.target.value)}
        placeholder="Team, I want to say..."
        rows={3}
        style={{
          width: '100%',
          padding: '10px',
          background: '#111',
          border: '0.5px solid #333',
          borderRadius: 8,
          color: '#fff',
          fontSize: 13,
          outline: 'none',
          resize: 'none',
          boxSizing: 'border-box',
          marginBottom: 6,
        }}
      />
      <p style={{ fontSize: 9, color: '#444', marginBottom: 8 }}>
        {speech.trim().split(' ').filter(Boolean).length} words
      </p>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#60a5fa',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Address the Team →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function FireActivity({ onComplete }) {
  const set = useRef(
    FIRE_EMPLOYEES[Math.floor(Math.random() * FIRE_EMPLOYEES.length)]
  ).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(20, () => submit(null, true), !submitted);

  function submit(emp, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !emp) {
      setResult({
        good: false,
        lesson:
          'Failing to make a hard call is still a call — you kept everyone and burned cash. Decisive leadership matters.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const safe = emp.cost_to_fire === 'safe to fire';
    setResult({
      good: safe,
      lesson: safe
        ? `Right call. ${emp.name} was the weakest fit for this stage. Letting go of the wrong person at the right time keeps the team strong.`
        : `Wrong call. ${emp.name} had hidden value: ${emp.hidden}. Always dig deeper before firing — the obvious choice isn't always right.`,
    });
    sounds[safe ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          safe
            ? { money: emp.salary, morale: 5 }
            : { money: emp.salary, morale: -20, users: -200 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🔥 Fire Someone (CEO)</p>
        <TimerRing seconds={timeLeft} total={20} color="#60a5fa" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
        One person needs to go. Read carefully — someone has hidden value.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {set.map((emp, i) => (
          <button
            key={i}
            onClick={() => {
              setChosen(i);
              submit(emp);
            }}
            disabled={submitted}
            style={{
              padding: '10px 12px',
              background: chosen === i ? '#1a0808' : '#111',
              border: `0.5px solid ${chosen === i ? '#ff4444' : '#222'}`,
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 3,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: chosen === i ? '#ff8888' : '#aaa',
                }}
              >
                {emp.name} — {emp.role}
              </p>
              <p style={{ fontSize: 11, color: '#ff4444' }}>
                -${emp.salary.toLocaleString()}/mo
              </p>
            </div>
            <p style={{ fontSize: 11, color: '#666' }}>{emp.stats}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function PivotActivity({ onComplete }) {
  const [direction, setDirection] = useState('');
  const [market, setMarket] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(35, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !direction.trim() || !market) {
      setResult({
        good: false,
        lesson:
          "A pivot with no direction isn't a pivot — it's panic. You need a clear new thesis before changing course.",
      });
      setTimeout(() => onComplete({ morale: -10 }), 3500);
      return;
    }
    const wc = direction.trim().split(' ').filter(Boolean).length;
    const good = wc >= 8 && wc <= 40;
    setResult({
      good,
      lesson: good
        ? "Clear pivot thesis. The best pivots keep what's working, discard what isn't, and target an adjacent market. Slack was a pivot from a game. Instagram from a check-in app."
        : wc < 8
        ? "Too vague. A pivot needs a clear 'from X to Y' statement. Vague pivots lead to confused teams."
        : "Too long. If you can't explain your pivot in 2-3 sentences, you don't understand it well enough yet.",
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(
      () => onComplete(good ? { morale: 10, users: 300 } : { morale: -10 }),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🔄 Pivot (CEO)</p>
        <TimerRing seconds={timeLeft} total={35} color="#60a5fa" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>
        Explain your new direction and target market.
      </p>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
          New direction (8-40 words)
        </p>
        <textarea
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          placeholder="We're pivoting from X to Y because..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px',
            background: '#111',
            border: '0.5px solid #333',
            borderRadius: 8,
            color: '#fff',
            fontSize: 12,
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: 9, color: '#444', marginTop: 4 }}>
          {direction.trim().split(' ').filter(Boolean).length} words
        </p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
          New target market
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PIVOT_MARKETS.map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              style={{
                padding: '4px 10px',
                background: market === m ? '#60a5fa20' : '#111',
                border: `0.5px solid ${market === m ? '#60a5fa' : '#222'}`,
                borderRadius: 20,
                color: market === m ? '#60a5fa' : '#888',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#60a5fa',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Commit to Pivot →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function EmbezzleActivity({ onComplete }) {
  const logSet = useRef(
    TRANSACTION_LOGS[Math.floor(Math.random() * TRANSACTION_LOGS.length)]
  ).current;
  const [alertLevel, setAlertLevel] = useState(0);
  const [clicks, setClicks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(12, () => submit(true), !submitted);

  function click(i, t) {
    if (submitted || clicks.includes(i)) return;
    if (t.suspicious) {
      sounds.action();
      setClicks((prev) => [...prev, i]);
      if (clicks.length + 1 >= 2) {
        submit(false, true);
      }
    } else {
      setAlertLevel((prev) => {
        const next = Math.min(100, prev + 35);
        if (next >= 100) {
          submit(false, false, true);
        }
        return next;
      });
    }
  }

  function submit(timedOut = false, success = false, caught = false) {
    if (submitted) return;
    setSubmitted(true);
    if (caught || (!success && timedOut)) {
      setResult({
        good: false,
        lesson: caught
          ? 'Fraud alert triggered. The CFO saw everything. In real companies, embezzlement is detected through anomaly detection on transaction patterns.'
          : "Too slow. You didn't redirect enough funds before the window closed.",
      });
      setTimeout(() => onComplete({ morale: -15 }), 3500);
      return;
    }
    setResult({
      good: true,
      lesson:
        'Clean drain. $500 redirected without triggering alerts. Real embezzlement detection relies on behavioral pattern analysis — consistent small amounts are harder to catch.',
    });
    sounds.action();
    setTimeout(() => onComplete({ money: 500 }), 3500);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>🕳️ Embezzle (Saboteur)</p>
        <TimerRing seconds={timeLeft} total={12} color="#ff4444" />
      </div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>
        Click the suspicious transactions to redirect funds. Wrong clicks
        trigger the fraud alert!
      </p>
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <p style={{ fontSize: 10, color: '#ff4444' }}>Fraud Alert</p>
          <p
            style={{
              fontSize: 10,
              color: alertLevel > 60 ? '#ff4444' : '#555',
            }}
          >
            {alertLevel}%
          </p>
        </div>
        <div style={{ background: '#1a0808', borderRadius: 3, height: 5 }}>
          <div
            style={{
              background: '#ff4444',
              width: `${alertLevel}%`,
              height: '100%',
              borderRadius: 3,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>
      <div
        style={{
          background: '#0a1a0a',
          border: '0.5px solid #1a3a1a',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {logSet.map((t, i) => (
          <button
            key={i}
            onClick={() => click(i, t)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: clicks.includes(i) ? '#0a2a0a' : 'transparent',
              border: 'none',
              borderBottom: '0.5px solid #0f1f0f',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: clicks.includes(i) ? '#4ade80' : '#888',
              }}
            >
              {t.desc}
            </span>
            <span
              style={{
                fontSize: 11,
                color: t.amount > 0 ? '#4ade80' : '#ff8888',
                fontFamily: 'monospace',
              }}
            >
              {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()}
            </span>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function LeakToPressActivity({ onComplete }) {
  const [tip, setTip] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(25, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !tip.trim()) {
      setResult({
        good: false,
        lesson:
          'A leak with no substance does nothing. Even saboteurs need to commit.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    const wc = tip.trim().split(' ').filter(Boolean).length;
    const tooSpecific = wc > 20;
    const tooVague = wc < 5;
    const good = !tooSpecific && !tooVague;
    setResult({
      good,
      lesson: good
        ? 'Perfect leak. Specific enough to be credible, vague enough to hide your identity. The best leaks create uncertainty without pointing fingers.'
        : tooSpecific
        ? 'Too specific. The team can trace this back to you — only YOU had access to that detail. Busted.'
        : "Too vague. The journalist won't run with this. A leak needs enough detail to be credible.",
    });
    sounds[good ? 'success' : 'fail']();
    setTimeout(() => onComplete(good ? { morale: -10 } : { morale: -3 }), 3500);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>
          📰 Leak to Press (Saboteur)
        </p>
        <TimerRing seconds={timeLeft} total={25} color="#ff4444" />
      </div>
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: 10,
          padding: '12px',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
          Anonymous tip to journalist
        </p>
        <p style={{ fontSize: 10, color: '#facc15' }}>
          ⚠️ Too specific = traceable. Too vague = ignored. Sweet spot: 5-20
          words.
        </p>
      </div>
      <textarea
        value={tip}
        onChange={(e) => setTip(e.target.value)}
        placeholder="Sources close to the company say..."
        rows={3}
        maxLength={200}
        style={{
          width: '100%',
          padding: '10px',
          background: '#111',
          border: '0.5px solid #333',
          borderRadius: 8,
          color: '#fff',
          fontSize: 12,
          outline: 'none',
          resize: 'none',
          boxSizing: 'border-box',
          marginBottom: 6,
        }}
      />
      <p
        style={{
          fontSize: 9,
          color:
            tip.trim().split(' ').filter(Boolean).length > 20
              ? '#ff4444'
              : '#444',
          marginBottom: 8,
        }}
      >
        {tip.trim().split(' ').filter(Boolean).length} words{' '}
        {tip.trim().split(' ').filter(Boolean).length > 20
          ? '— too specific!'
          : ''}
      </p>
      {!submitted && (
        <button
          onClick={() => submit(false)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#ff4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Send Anonymously →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

function ProductUpdateActivity({ onComplete }) {
  const FEATURES = [
    [
      {
        label: '🌙 Dark mode',
        tradeoff: '+users, minimal dev time',
        good: true,
      },
      {
        label: '🤖 AI feature (unproven)',
        tradeoff: 'expensive, risky',
        good: false,
      },
      {
        label: '⚡ Faster load times',
        tradeoff: '+retention, requires refactor',
        good: true,
      },
    ],
    [
      {
        label: '📊 Analytics dashboard',
        tradeoff: '+enterprise appeal, 2 week build',
        good: true,
      },
      {
        label: '🎮 Gamification layer',
        tradeoff: 'distracts from core value',
        good: false,
      },
      {
        label: '🔔 Push notifications',
        tradeoff: '+retention if done right',
        good: true,
      },
    ],
    [
      {
        label: '🌍 Multi-language support',
        tradeoff: '+international users, high effort',
        good: false,
      },
      {
        label: '🔗 API integrations',
        tradeoff: '+power users, enterprise sales',
        good: true,
      },
      {
        label: '📱 Mobile app',
        tradeoff: 'huge investment, needed eventually',
        good: false,
      },
    ],
  ];
  const set = useRef(
    FEATURES[Math.floor(Math.random() * FEATURES.length)]
  ).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(15, () => submit(null, true), !submitted);

  function submit(feature, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !feature) {
      setResult({
        good: false,
        lesson:
          'Shipping nothing is falling behind. In startups, inaction is the most expensive choice.',
      });
      setTimeout(() => onComplete({ morale: -5 }), 3500);
      return;
    }
    setResult({
      good: feature.good,
      lesson: feature.good
        ? `Good pick. ${feature.label} has a clear value proposition and manageable scope. Ship what moves your core metric.`
        : `Wrong choice. ${feature.tradeoff}. Always ask: does this move the needle for our current growth constraint?`,
    });
    sounds[feature.good ? 'success' : 'fail']();
    setTimeout(
      () =>
        onComplete(
          feature.good
            ? { users: 100, morale: 8 }
            : { morale: -5, money: -1000 }
        ),
      3500
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 12, color: '#888' }}>📦 Product Update</p>
        <TimerRing seconds={timeLeft} total={15} color="#60a5fa" />
      </div>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
        Pick the feature to ship this sprint. One right answer.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {set.map((f, i) => (
          <button
            key={i}
            onClick={() => {
              setChosen(i);
              submit(f);
            }}
            disabled={submitted}
            style={{
              padding: '10px 12px',
              background: chosen === i ? '#222' : '#111',
              border: `0.5px solid ${chosen === i ? '#60a5fa' : '#222'}`,
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: chosen === i ? '#fff' : '#aaa',
                marginBottom: 3,
              }}
            >
              {f.label}
            </p>
            <p style={{ fontSize: 10, color: '#555' }}>{f.tradeoff}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} />}
    </div>
  );
}

// ─── ACTIVITY MAP ─────────────────────────────────────────────────────────
export const ACTIVITY_MAP = {
  'Cold Email': ColdEmailActivity,
  'Blog Post': BlogPostActivity,
  'Network Event': NetworkingActivity,
  'Attack Competitor': AttackActivity,
  'Ship Fast': ShipFastActivity,
  'A/B Test': ABTestActivity,
  'Pitch Practice': PitchPracticeActivity,
  'Defect & Go Solo': DefectActivity,
  'Business Quiz': MathActivity,
  'Financial Model': FinancialModelActivity,
  'Audit Trail': AuditTrailActivity,
  'Emergency Reserve': EmergencyReserveActivity,
  'Campaign Blast': CampaignBlastActivity,
  'Brand Refresh': BrandRefreshActivity,
  'Fake Virality': FakeViralityActivity,
  'Plant Bug': PlantBugActivity,
  'Automate Process': AutomateActivity,
  'Systems Audit': SystemsAuditActivity,
  'Hire NPC': HireNPCActivity,
  'Cold Call': ColdCallActivity,
  'Flash Sale': FlashSaleActivity,
  'Host AMA': HostAMAActivity,
  'Town Hall': TownHallActivity,
  'Personalized Outreach': PersonalizedOutreachActivity,
  'All-Hands': AllHandsActivity,
  'Fire Someone': FireActivity,
  Pivot: PivotActivity,
  'Embezzle Quietly': EmbezzleActivity,
  'Leak to Press': LeakToPressActivity,
  'Product Update': ProductUpdateActivity,
  'Draw Billionaire': DrawingActivity,
};

export default function Activity({ actionKey, onComplete }) {
  const Component = ACTIVITY_MAP[actionKey];
  if (!Component) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#0f0f0f',
          border: '0.5px solid #2a2a2a',
          borderRadius: 16,
          padding: '1.25rem',
          width: '100%',
          maxWidth: 400,
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        <Component onComplete={onComplete} />
      </div>
    </div>
  );
}
