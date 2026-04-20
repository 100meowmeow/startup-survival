import { useState, useEffect, useRef } from "react";
import { sounds } from "./sounds";

const SCENARIO_PROFILES = {
  rat_app: { name: "An App That's Just Rats", type: "chaos", tone: "weird beats professional", marketing: "conventional fails, bizarre wins", email_tip: "The weirder the better — normal emails look scammy" },
  telehealth: { name: "Telehealth", type: "medical", tone: "professional always", marketing: "evidence-based only", email_tip: "Playful tone will destroy trust with medical audiences" },
  ai_hiring: { name: "AI Hiring Tool", type: "enterprise", tone: "professional and data-driven", marketing: "ROI and compliance focused", email_tip: "Enterprise buyers need formal, specific, numbers-driven pitches" },
  carbon: { name: "Carbon Credit Marketplace", type: "impact", tone: "mission-driven but credible", marketing: "evidence and outcomes", email_tip: "Impact investors want proof, not hype" },
  psychedelic: { name: "Psychedelic Wellness", type: "wellness", tone: "warm and clinical balance", marketing: "research-backed", email_tip: "Sensitive topic — professional tone essential" },
  stock_app: { name: "Gamified Stock App", type: "fintech", tone: "energetic but credible", marketing: "results and social proof", email_tip: "Young audience wants casual but the content must be real" },
  dog_ceo: { name: "Dog CEO Agency", type: "chaos", tone: "playful always wins", marketing: "humor and personality", email_tip: "The more fun the better — this is a novelty brand" },
  taco_dao: { name: "Taco Truck DAO", type: "chaos", tone: "crypto-casual wins", marketing: "community and memes", email_tip: "Normal business language kills the vibe here" },
  luxury_tp: { name: "Luxury Toilet Paper", type: "luxury", tone: "elevated and witty", marketing: "exclusivity and humor", email_tip: "Casual fails, but so does stuffy — witty and elevated wins" },
  mars_real: { name: "Mars Real Estate", type: "chaos", tone: "confident absurdism", marketing: "bold and shameless", email_tip: "Lean into the absurdity — straight-faced chaos wins" },
  default: { name: "Startup", type: "general", tone: "professional with personality", marketing: "value and growth", email_tip: "Match tone to audience — professional for enterprise, casual for consumers" },
};

function getScenarioProfile(scenarioId) {
  return SCENARIO_PROFILES[scenarioId] || SCENARIO_PROFILES.default;
}

const DIFFICULTY_TIMER_MULTIPLIERS = {
  intern: 1.6, founder: 1.0, veteran: 0.75, shark: 0.5,
};

function getTimer(base, difficulty) {
  return Math.round(base * (DIFFICULTY_TIMER_MULTIPLIERS[difficulty] || 1.0));
}

function TimerRing({ seconds, total, color = "#ff4444" }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / total) * circumference;
  return (
    <svg width={50} height={50} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={25} cy={25} r={radius} fill="none" stroke="#222" strokeWidth={4} />
      <circle cx={25} cy={25} r={radius} fill="none"
        stroke={seconds < total * 0.3 ? "#ff4444" : color}
        strokeWidth={4} strokeDasharray={circumference}
        strokeDashoffset={circumference - progress} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s linear" }} />
      <text x={25} y={25} textAnchor="middle" dominantBaseline="middle"
        fill={seconds < total * 0.3 ? "#ff4444" : "#fff"} fontSize={11} fontWeight={700}
        style={{ transform: "rotate(90deg)", transformOrigin: "25px 25px" }}>
        {seconds}
      </text>
    </svg>
  );
}

// ─── LESSON COMPONENT — shows outcome, reason (why), and business principle ───
function Lesson({ text, isGood, statChange, reason }) {
  return (
    <div style={{
      background: isGood ? "#0a1a0a" : "#1a0808",
      border: `0.5px solid ${isGood ? "#4ade8050" : "#ff444450"}`,
      borderRadius: 10,
      padding: "12px 14px",
      marginTop: 10,
    }}>
      {/* Outcome label + stat change */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <p style={{ color: isGood ? "#4ade80" : "#ff4444", fontSize: 13, fontWeight: 700 }}>
          {isGood ? "✓ Nice work." : "✗ Not quite."}
        </p>
        {statChange && (
          <p style={{ color: isGood ? "#4ade80" : "#ff4444", fontSize: 13, fontWeight: 700 }}>
            {statChange}
          </p>
        )}
      </div>
      {/* WHY — specific to what they did */}
      {reason && (
        <p style={{ color: "#ccc", fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>
          {reason}
        </p>
      )}
      {/* General business principle */}
      <p style={{ color: "#666", fontSize: 11, lineHeight: 1.5 }}>
        💡 {text}
      </p>
    </div>
  );
}

function useCountdown(total, onExpire, active = true) {
  const [timeLeft, setTimeLeft] = useState(total);
  const expiredRef = useRef(false);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          clearInterval(t);
          if (!expiredRef.current) { expiredRef.current = true; onExpire(); }
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [active]);
  return timeLeft;
}

// ─── gradeWithAI — returns { score, good, reason, lesson, statChange } ───────
async function gradeWithAI(prompt) {
  try {
    const res = await fetch("/.netlify/functions/claude-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: `You are a strict but fair business judge in a startup simulation game. Grade the player's response.

Reply with ONLY a valid JSON object. No markdown, no backticks, no preamble.

Format:
{
  "score": 0-100,
  "good": true or false,
  "reason": "One specific sentence explaining exactly why this succeeded or failed — reference what they actually wrote or chose",
  "lesson": "One educational sentence about the real business principle at play",
  "statChange": "e.g. +200 users or -$500 or +10% morale"
}

Be scenario-aware and honest. The reason field must be specific to their input, not generic.`,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error("gradeWithAI proxy error:", res.status);
      return _fallbackGrade(prompt);
    }

    const data = await res.json();

    if (data.error || !data.content?.[0]?.text) {
      console.error("gradeWithAI API error:", data.error || "no content field");
      return _fallbackGrade(prompt);
    }

    const raw = data.content[0].text.trim().replace(/```json|```/g, "").trim();

    // Extract JSON even if there's stray text around it
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("gradeWithAI: no JSON found:", raw.slice(0, 200));
      return _fallbackGrade(prompt);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score:     typeof parsed.score === "number" ? parsed.score : 50,
      good:      typeof parsed.good === "boolean" ? parsed.good : parsed.score >= 60,
      reason:    parsed.reason    || (parsed.good ? "Solid execution." : "Didn't land — try a different approach."),
      lesson:    parsed.lesson    || "Keep iterating on your strategy.",
      statChange: parsed.statChange || (parsed.good ? "+100 users" : "-5% morale"),
    };
  } catch (err) {
    console.error("gradeWithAI exception:", err);
    return _fallbackGrade(prompt);
  }
}

// Fallback when AI is unavailable — uses word count heuristic
function _fallbackGrade(prompt) {
  const wordCount = prompt.trim().split(/\s+/).length;
  const good = wordCount > 15;
  return {
    score: good ? 65 : 35,
    good,
    reason: good
      ? "Your response was detailed enough to be convincing."
      : "Your response was too brief or vague — more specificity is needed.",
    lesson: "Specificity wins. Vague answers lose — in pitches, emails, and real business.",
    statChange: good ? "+100 users" : "-5% morale",
  };
}

const EMAIL_SCENARIOS = [
  { audience: "🎓 College Students", tip: "wants: cheap, fast, fun", bestTones: ["Casual", "Playful"], worstTones: ["Professional"], badScenarios: ["telehealth", "ai_hiring", "carbon"] },
  { audience: "🏪 Small Business Owner", tip: "wants: save time, save money", bestTones: ["Casual", "Urgent"], worstTones: ["Playful"] },
  { audience: "🏢 Enterprise Exec", tip: "wants: ROI, compliance, support", bestTones: ["Professional"], worstTones: ["Casual", "Playful"] },
  { audience: "👩‍💻 Freelance Designer", tip: "wants: portfolio, clients, tools", bestTones: ["Casual", "Playful"], worstTones: ["Professional"] },
  { audience: "🏥 Healthcare Worker", tip: "wants: efficiency, compliance, safety", bestTones: ["Professional"], worstTones: ["Playful", "Casual"], badScenarios: ["rat_app", "taco_dao", "dog_ceo"] },
  { audience: "📦 E-commerce Seller", tip: "wants: margins, growth, automation", bestTones: ["Urgent", "Casual"], worstTones: [] },
  { audience: "👨‍🏫 Teacher / Educator", tip: "wants: student outcomes, easy tools", bestTones: ["Casual", "Professional"], worstTones: ["Playful"] },
  { audience: "🏋️ Gym Owner", tip: "wants: members, retention, revenue", bestTones: ["Urgent", "Casual"], worstTones: ["Professional"] },
  { audience: "🎮 Gamer / Content Creator", tip: "wants: fame, revenue, tools", bestTones: ["Playful", "Casual"], worstTones: ["Professional"] },
  { audience: "👴 Retired Professional", tip: "wants: simple, trustworthy, no jargon", bestTones: ["Professional", "Casual"], worstTones: ["Playful", "Urgent"] },
];

const NETWORKING_NPCS = [
  { name: "Sandra Chen", role: "VC Partner", emoji: "👩‍💼", personality: "Blunt. Loves data.", dealbreaker: "small talk", lines: [
    { text: "What's your CAC to LTV ratio?", good: true },
    { text: "We're disrupting the industry.", good: false },
    { text: "Nice shoes. Invest in me. 🌸", good: false },
    { text: "We hit 40% MoM growth last quarter.", good: true },
  ]},
  { name: "Marcus Webb", role: "Angel Investor", emoji: "👨‍💼", personality: "Friendly. Loves founder stories.", dealbreaker: "jargon", lines: [
    { text: "Our synergistic platform leverages AI.", good: false },
    { text: "I quit my job to solve this problem.", good: true },
    { text: "What's your IRR projection?", good: false },
    { text: "Let me tell you why I built this.", good: true },
  ]},
  { name: "Priya Nair", role: "Journalist", emoji: "📰", personality: "Curious. Wants the real story.", dealbreaker: "PR speak", lines: [
    { text: "We're honored to share our journey.", good: false },
    { text: "Honestly? We almost shut down twice.", good: true },
    { text: "I can't comment on that.", good: false },
    { text: "The real problem we're solving is...", good: true },
  ]},
  { name: "James Okafor", role: "Corporate Exec", emoji: "👔", personality: "Risk-averse. Wants proven solutions.", dealbreaker: "hype", lines: [
    { text: "This is revolutionary technology.", good: false },
    { text: "We've reduced costs by 32% for 10 clients.", good: true },
    { text: "Everyone's going to want this soon.", good: false },
    { text: "Here's our case study from a Fortune 500.", good: true },
  ]},
  { name: "Yuki Tanaka", role: "Product Lead", emoji: "🧑‍💻", personality: "Technical. Hates buzzwords.", dealbreaker: "vague claims", lines: [
    { text: "Our AI is next level.", good: false },
    { text: "We use transformer architecture with RLHF.", good: true },
    { text: "The tech is too complex to explain.", good: false },
    { text: "Our p50 latency is 120ms.", good: true },
  ]},
  { name: "Fatima Al-Hassan", role: "Impact Investor", emoji: "🌍", personality: "Mission-driven. Wants measurable impact.", dealbreaker: "profit-only focus", lines: [
    { text: "We're going to make a lot of money.", good: false },
    { text: "We've kept 10,000 tons of CO2 out of the atmosphere.", good: true },
    { text: "Impact is secondary to scale for us.", good: false },
    { text: "Our B-Corp certification starts next quarter.", good: true },
  ]},
  { name: "Carlos Rivera", role: "Startup Founder", emoji: "🚀", personality: "Hustler. Wants to collab or compete.", dealbreaker: "arrogance", lines: [
    { text: "We're the best in the market, honestly.", good: false },
    { text: "I'd love to compare notes — what's your churn?", good: true },
    { text: "Our competitors don't stand a chance.", good: false },
    { text: "We're struggling with the same problem — collab?", good: true },
  ]},
  { name: "Beth Kowalski", role: "Marketing Director", emoji: "📣", personality: "Creative. Hates boring pitches.", dealbreaker: "slides and decks", lines: [
    { text: "Let me pull up our deck.", good: false },
    { text: "Forget the slides — here's what we do.", good: true },
    { text: "Our CAC is quite favorable relative to benchmarks.", good: false },
    { text: "We went viral twice this month. Let me show you.", good: true },
  ]},
  { name: "Devon Black", role: "Hedge Fund Investor", emoji: "💼", personality: "Numbers only. Zero small talk.", dealbreaker: "stories without data", lines: [
    { text: "Our users really love the product.", good: false },
    { text: "MRR is $45k, growing 18% MoM, churn under 2%.", good: true },
    { text: "The market opportunity is massive.", good: false },
    { text: "Here's our unit economics breakdown.", good: true },
  ]},
  { name: "Mei Lin", role: "Government Grant Officer", emoji: "🏛️", personality: "Formal. Loves community impact.", dealbreaker: "profit focus", lines: [
    { text: "We're going to be very profitable.", good: false },
    { text: "We serve underrepresented communities in 3 counties.", good: true },
    { text: "This is a great business opportunity.", good: false },
    { text: "Our social impact metrics are independently verified.", good: true },
  ]},
];

const usedNPCsSession = new Set();

const AB_TESTS = [
  { question: "Which pricing page converts better?", a: { label: "$9/mo, single clean plan", wins: true }, b: { label: "$8.99/mo, 3 confusing tiers" }, lesson: "Simple pricing converts better. Every extra option is a reason not to buy." },
  { question: "Which CTA performs better?", a: { label: '"Start Free Trial"', wins: true }, b: { label: '"Sign Up Now"' }, lesson: '"Start Free Trial" reduces perceived risk and consistently outperforms generic CTAs.' },
  { question: "Which onboarding flow works better?", a: { label: "10-step guided tour" }, b: { label: "Skip straight to the product", wins: true }, lesson: "Get users to their 'aha moment' as fast as possible. Long onboarding kills activation." },
  { question: "Which email subject gets more opens?", a: { label: "Check out our new feature" }, b: { label: '"You\'re losing $500/month without this"', wins: true }, lesson: "Loss aversion subjects outperform vague ones by 30-40%." },
  { question: "Which homepage hero works better?", a: { label: "Product screenshot + tagline", wins: true }, b: { label: "Animated explainer video autoplay" }, lesson: "Static screenshots load faster and convert better. Autoplays annoy users." },
  { question: "Which checkout flow converts better?", a: { label: "Guest checkout available", wins: true }, b: { label: "Forced account creation" }, lesson: "Forced account creation causes 35% cart abandonment. Always offer guest checkout." },
  { question: "Which ad image performs better?", a: { label: "Stock photo of happy people" }, b: { label: "Real user photo, messy desk, authentic", wins: true }, lesson: "Authentic imagery outperforms stock photos. Users recognize staged perfection." },
  { question: "Which support response upsells better?", a: { label: "Answer the question only" }, b: { label: "Answer + mention relevant upgrade", wins: true }, lesson: "Support is a sales channel. A relevant upsell converts at 15%+." },
  { question: "Which referral reward works better?", a: { label: "Cash reward for referrer", wins: true }, b: { label: "Discount for the person referred" }, lesson: "Rewarding the referrer drives more referrals than discounting the new user." },
  { question: "Which notification timing gets more opens?", a: { label: "9am Tuesday morning", wins: true }, b: { label: "Friday afternoon" }, lesson: "Tuesday-Thursday mornings have highest email open rates. Friday afternoons are dead." },
  { question: "Which pricing anchor works better?", a: { label: "Show expensive plan first", wins: true }, b: { label: "Show cheapest plan first" }, lesson: "Showing the expensive plan first makes middle-tier seem reasonable. Classic anchoring." },
  { question: "Which error message retains users better?", a: { label: '"Something went wrong. Try again."' }, b: { label: '"Hang tight — we hit a snag. Back in 2 mins! 🔧"', wins: true }, lesson: "Humanized error messages reduce churn during outages by up to 40%." },
];

const PITCH_OBJECTIONS = [
  { objection: '"Your CAC is too high."', options: [
    { text: "We're working on it.", good: false },
    { text: "Our LTV is 4x CAC — unit economics are strong.", good: true },
    { text: "We'll fix that after funding.", good: false },
    { text: "Our organic CAC is near zero — paid is an experiment.", good: true },
  ], lesson: "Investors want to see you know your numbers AND have a path to improvement." },
  { objection: '"Why would anyone pay for this?"', options: [
    { text: "Because it's really useful!", good: false },
    { text: "We have 200 paying customers at $50/mo.", good: true },
    { text: "Everyone we've shown it to loves it.", good: false },
    { text: "Our NPS is 72 and churn is under 3%.", good: true },
  ], lesson: "Revenue, retention, and NPS are evidence. Enthusiasm is not." },
  { objection: '"What\'s your moat?"', options: [
    { text: "Our product is really hard to build.", good: false },
    { text: "Network effects — each user makes it better.", good: true },
    { text: "We have a patent pending.", good: false },
    { text: "18 months of proprietary training data.", good: true },
  ], lesson: "A real moat is network effects, data, switching costs, or regulation." },
  { objection: '"Your market is too small."', options: [
    { text: "It'll get bigger eventually.", good: false },
    { text: "We dominate a $500M niche that leads to a $5B market.", good: true },
    { text: "Every market starts small.", good: false },
    { text: "Amazon started in books. We're starting in X.", good: true },
  ], lesson: "Dominate a niche first. Narrow wedge into a large market is the right narrative." },
  { objection: '"Why are you the right team?"', options: [
    { text: "We're really passionate about this.", good: false },
    { text: "Our CEO built and sold a company in this space.", good: true },
    { text: "We work really hard.", good: false },
    { text: "10 years domain expertise and 3 failed attempts that taught us everything.", good: true },
  ], lesson: "Investors bet on teams first. Domain expertise plus lived failure is the strongest signal." },
  { objection: '"What happens if Google builds this?"', options: [
    { text: "We'd be flattered.", good: false },
    { text: "Our switching costs and contracts make us defensible for 3-5 years.", good: true },
    { text: "Google can't move fast enough.", good: false },
    { text: "We'd welcome it — validates the market. Our niche loyalty is our moat.", good: true },
  ], lesson: "Acknowledge the threat then explain defensibility. Dismissing competition reads as naive." },
  { objection: '"How do you make money?"', options: [
    { text: "We'll figure out monetization later.", good: false },
    { text: "SaaS subscription — $49/mo per seat, 85% gross margin.", good: true },
    { text: "Multiple revenue streams — ads, subscriptions, data.", good: false },
    { text: "Land and expand — free tier converts at 12% to $99/mo paid.", good: true },
  ], lesson: "A clear, simple revenue model beats 'multiple streams.' Know your gross margin cold." },
  { objection: '"Your churn is too high."', options: [
    { text: "All startups have high churn early.", good: false },
    { text: "We identified the cause — onboarding gap. Fixed it 3 weeks ago, churn halved.", good: true },
    { text: "Our users love the product.", good: false },
    { text: "Cohort analysis shows 6-month+ users have under 1% monthly churn.", good: true },
  ], lesson: "Show you understand WHY churn is happening and what you've done about it." },
];

const MATH_PROBLEMS = [
  { question: "Your startup has $50,000 and spends $8,000/month. How many months of runway?", answer: 6, unit: "months", tolerance: 0, lesson: "Runway = cash / burn rate. Know this number every single day." },
  { question: "1,000 users. 5% convert to paid at $20/month. What's your MRR?", answer: 1000, unit: "$", tolerance: 0, lesson: "MRR = users × conversion × price. Your most important growth metric." },
  { question: "CAC is $40. LTV is $200. What's your LTV:CAC ratio?", answer: 5, unit: "x", tolerance: 0, lesson: "LTV:CAC of 3x+ is healthy. Below 1x means you lose money on every customer." },
  { question: "500 customers. 25 cancel this month. Monthly churn rate (%)?", answer: 5, unit: "%", tolerance: 0, lesson: "5% monthly churn = losing half your base in a year." },
  { question: "$3,600 on ads gets 150 new users. What's your CAC?", answer: 24, unit: "$", tolerance: 0, lesson: "CAC = ad spend / new customers. If CAC > LTV, you're losing money on every sale." },
  { question: "10% MoM growth. Starting with 100 users. How many after 3 months? (round to nearest whole number)", answer: 133, unit: "users", tolerance: 2, lesson: "Compound growth: 100 × 1.1³ ≈ 133. Even modest MoM growth compounds dramatically." },
  { question: "Raise $500k at $2M post-money valuation. What % did you give away?", answer: 25, unit: "%", tolerance: 0, lesson: "Dilution = investment / post-money × 100. Know your cap table before every round." },
  { question: "Revenue $100k. COGS $30k. What's your gross profit?", answer: 70000, unit: "$", tolerance: 0, lesson: "Gross profit = revenue - COGS. SaaS targets 70-80% gross margins." },
  { question: "You have 1,000 users paying $10/month. Your server costs $2,000/month. Monthly profit?", answer: 8000, unit: "$", tolerance: 0, lesson: "Profit = revenue - costs. $10k revenue - $2k costs = $8k. Simple but founders often ignore server costs." },
  { question: "You spend $5,000 on marketing and acquire 100 users. 10 convert to $50/month paid. Monthly ROI in $?", answer: 500, unit: "$", tolerance: 0, lesson: "Marketing ROI = (revenue generated - spend) / spend. $500 MRR on $5k spend = 10% monthly ROI." },
];

const FIRE_SETS = [
  [
    { name: "Jake", role: "Engineer", stats: "Ships fast, misses tests", salary: 9000, hidden: "fixes critical bugs silently at 2am", cost_to_fire: "loses stability" },
    { name: "Mia", role: "Sales", stats: "Closes deals, bad paperwork", salary: 7000, hidden: "has 3 hot leads closing this week", cost_to_fire: "loses pipeline" },
    { name: "Leo", role: "Designer", stats: "Great work, very slow", salary: 6000, hidden: "just finished your best landing page ever", cost_to_fire: "safe to fire" },
  ],
  [
    { name: "Aisha", role: "Marketing", stats: "Creative but unfocused", salary: 6500, hidden: "campaign launches tomorrow with $50k budget", cost_to_fire: "loses campaign" },
    { name: "Tom", role: "Support", stats: "Slow, very thorough", salary: 5000, hidden: "holds all institutional knowledge", cost_to_fire: "loses knowledge" },
    { name: "Zara", role: "BD", stats: "Talks a lot, few closes", salary: 8000, hidden: "just a bad fit", cost_to_fire: "safe to fire" },
  ],
  [
    { name: "Dev", role: "CTO", stats: "Brilliant, hard to manage", salary: 12000, hidden: "owns the entire codebase mentally", cost_to_fire: "loses product" },
    { name: "Chloe", role: "Ops", stats: "Runs everything quietly", salary: 7000, hidden: "entire company runs on her spreadsheets", cost_to_fire: "loses operations" },
    { name: "Raj", role: "Intern", stats: "Learning, not contributing yet", salary: 2000, hidden: "just an intern", cost_to_fire: "safe to fire" },
  ],
  [
    { name: "Nina", role: "Data Analyst", stats: "Produces reports nobody reads", salary: 7500, hidden: "her data is the only reason your pitch deck has numbers", cost_to_fire: "loses credibility" },
    { name: "Sam", role: "PM", stats: "Holds too many meetings", salary: 8000, hidden: "the team would collapse without sprint planning", cost_to_fire: "loses coordination" },
    { name: "Bex", role: "Contractor", stats: "Okay output, very expensive", salary: 10000, hidden: "just a contractor", cost_to_fire: "safe to fire" },
  ],
];

const TRANSACTION_LOGS = [
  [
    { desc: "AWS Invoice", amount: -2100, suspicious: false },
    { desc: "Payroll — Engineering", amount: -8000, suspicious: false },
    { desc: "Transfer to personal account", amount: -500, suspicious: true },
    { desc: "Stripe Revenue", amount: 3200, suspicious: false },
    { desc: "Office supplies", amount: -240, suspicious: false },
    { desc: "Cash withdrawal — no memo", amount: -500, suspicious: true },
    { desc: "Software subscriptions", amount: -890, suspicious: false },
    { desc: "Marketing spend", amount: -1500, suspicious: false },
  ],
  [
    { desc: "Payroll — All staff", amount: -15000, suspicious: false },
    { desc: "Consulting fee — unknown vendor", amount: -3000, suspicious: true },
    { desc: "Google Ads", amount: -2000, suspicious: false },
    { desc: "Duplicate payment — vendor 442", amount: -1200, suspicious: true },
    { desc: "Revenue — Enterprise client", amount: 8000, suspicious: false },
    { desc: "Legal fees", amount: -4000, suspicious: false },
    { desc: "Travel expenses — no receipt", amount: -800, suspicious: true },
    { desc: "Stripe payout", amount: 2100, suspicious: false },
  ],
  [
    { desc: "Server costs", amount: -1800, suspicious: false },
    { desc: "Payment to shell company", amount: -2500, suspicious: true },
    { desc: "Sales commissions", amount: -3000, suspicious: false },
    { desc: "Refund — wrong amount issued", amount: -1500, suspicious: true },
    { desc: "Revenue — Product sales", amount: 5500, suspicious: false },
    { desc: "Office rent", amount: -4000, suspicious: false },
    { desc: "Miscellaneous — unclassified", amount: -600, suspicious: true },
    { desc: "Investor deposit", amount: 25000, suspicious: false },
  ],
  [
    { desc: "Payroll — Sales team", amount: -12000, suspicious: false },
    { desc: "Expense report — CEO personal", amount: -2200, suspicious: true },
    { desc: "Revenue — SaaS subscriptions", amount: 9500, suspicious: false },
    { desc: "Vendor payment — no contract", amount: -1800, suspicious: true },
    { desc: "AWS Reserved Instances", amount: -3200, suspicious: false },
    { desc: "Stripe fees", amount: -450, suspicious: false },
    { desc: "Petty cash withdrawal", amount: -300, suspicious: false },
    { desc: "Wire to overseas account", amount: -4000, suspicious: true },
  ],
];

const HIRE_SETS = [
  [
    { name: "Alex Chen", skills: "Python, React, 5 yrs exp", weakness: "No startup experience", salary: 9000, best: false },
    { name: "Maria Santos", skills: "Full stack, shipped 3 products, 3 yrs exp", weakness: "Asks for equity", salary: 7000, best: true },
    { name: "Derek Powell", skills: "10 yrs exp, enterprise only", weakness: "Hates moving fast", salary: 12000, best: false },
  ],
  [
    { name: "Priya Mehta", skills: "Growth marketing, 2x'd MRR at last job", weakness: "Only knows B2C", salary: 6000, best: true },
    { name: "Scott Williams", skills: "20 years ad agency", weakness: "No digital experience", salary: 9000, best: false },
    { name: "Jess Kim", skills: "Content creator, 500k followers", weakness: "Never done B2B", salary: 5000, best: false },
  ],
  [
    { name: "Omar Hassan", skills: "6 enterprise closes, avg deal $50k", weakness: "Slow to ramp", salary: 8000, best: false },
    { name: "Tina Russo", skills: "SMB sales, 40 deals/month", weakness: "Low deal size", salary: 6000, best: true },
    { name: "Brad King", skills: "Great personality, no track record", weakness: "Unproven", salary: 5000, best: false },
  ],
  [
    { name: "Yuna Park", skills: "Ex-McKinsey, brilliant analyst", weakness: "Never built anything", salary: 11000, best: false },
    { name: "Rico Vega", skills: "Built and scaled ops at 2 startups", weakness: "Doesn't like meetings", salary: 8000, best: true },
    { name: "Casey Jordan", skills: "MBA, lots of frameworks", weakness: "Theory over practice", salary: 9000, best: false },
  ],
];

const PROSPECT_PROFILES = [
  { name: "Sarah K.", company: "Bakery owner", mood: "😤 Busy", tip: "Lead with time-saving benefit", good_angle: "save time", bad_angles: ["look cool", "scale fast"] },
  { name: "Mike T.", company: "Tech startup", mood: "🤔 Curious", tip: "Lead with tech angle or metrics", good_angle: "scale fast", bad_angles: ["look cool"] },
  { name: "Linda R.", company: "Retail chain", mood: "😴 Bored", tip: "Be energetic and surprising", good_angle: "stand out", bad_angles: ["save money"] },
  { name: "James L.", company: "Law firm", mood: "😠 Annoyed", tip: "Ultra brief, respect their time", good_angle: "save money", bad_angles: ["look cool", "scale fast"] },
  { name: "Priya M.", company: "Hospital admin", mood: "🎯 Focused", tip: "Lead with compliance and safety", good_angle: "save time", bad_angles: ["look cool", "stand out"] },
  { name: "Tony V.", company: "Real estate agency", mood: "😎 Confident", tip: "Match their energy, show ROI", good_angle: "save money", bad_angles: [] },
  { name: "Keiko S.", company: "E-learning platform", mood: "🤗 Friendly", tip: "Lead with impact and mission", good_angle: "stand out", bad_angles: ["save money"] },
];

const BILLIONAIRES = [
  { name: "Elon Musk", hints: ["pointy hair", "Tesla logo", "rocket", "Mars planet", "X logo"], emoji: "🚀", keywords: ["musk", "tesla", "space", "rocket", "mars", "x", "twitter"] },
  { name: "Jeff Bezos", hints: ["bald head", "Amazon box", "yacht", "rocket", "smirk"], emoji: "📦", keywords: ["bezos", "amazon", "bald", "box", "yacht"] },
  { name: "Mark Zuckerberg", hints: ["bowl cut", "grey t-shirt", "thumbs up", "VR headset", "robot"], emoji: "👍", keywords: ["zuck", "facebook", "meta", "bowl", "robot", "vr"] },
  { name: "Warren Buffett", hints: ["old man", "Coca Cola", "newspaper", "Omaha", "glasses"], emoji: "📰", keywords: ["buffett", "berkshire", "coke", "omaha", "newspaper"] },
];

const PIVOT_MARKETS = ["B2B SaaS", "Consumer mobile", "Healthcare", "Education", "E-commerce", "Enterprise", "Creator economy", "Climate tech", "Fintech", "Gaming", "Real estate tech", "Legal tech"];

const AUTOMATE_OPTIONS = [
  { id: "email", label: "📧 Customer follow-up emails", risk: "Low risk — saves 3 hrs/week", good: true, lesson: "Email follow-ups are purely mechanical — perfect automation candidate." },
  { id: "onboard", label: "🎓 New user onboarding", risk: "Medium risk — personal touch matters early", good: false, lesson: "Early onboarding needs human touch. Automate it after you've nailed the manual version." },
  { id: "invoice", label: "💳 Invoice generation", risk: "Low risk — purely mechanical", good: true, lesson: "Invoicing is 100% mechanical. Always automate it." },
  { id: "support", label: "🤖 All customer support", risk: "High risk — kills satisfaction scores", good: false, lesson: "Full support automation tanks CSAT. Use it for Tier 1 only, never for complex issues." },
  { id: "reporting", label: "📊 Weekly metrics reports", risk: "Low risk — saves 2 hrs/week", good: true, lesson: "Reporting is mechanical. Automate data collection, spend your time on interpretation." },
  { id: "social", label: "📱 All social media posts", risk: "Medium risk — feels inauthentic", good: false, lesson: "Fully automated social feels robotic. Schedule posts but keep engagement human." },
];

// ─── ACTIVITIES ───────────────────────────────────────────────────────────────

function ColdEmailActivity({ onComplete, scenario, difficulty }) {
  const profile = getScenarioProfile(scenario?.id);
  const timer = getTimer(30, difficulty);
  const tones = ["Professional", "Casual", "Urgent", "Playful"];
  const [emailScenario] = useState(() => EMAIL_SCENARIOS[Math.floor(Math.random() * EMAIL_SCENARIOS.length)]);
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  async function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !subject.trim() || !tone) {
      setResult({ good: false, reason: "You didn't write a subject line or pick a tone before time ran out.", lesson: "A cold email needs a subject line and a tone. Sending blank emails is worse than not sending.", statChange: "-30 users" });
      setTimeout(() => onComplete({ users: -30 }), 3500); return;
    }
    setLoading(true);
    const isBadScenario = emailScenario.badScenarios?.includes(scenario?.id);
    const prompt = `Rate this cold email attempt for a startup called "${profile.name}" (scenario type: ${profile.type}).
Target audience: ${emailScenario.audience} (${emailScenario.tip})
Subject line written: "${subject}"
Tone chosen: ${tone}
Scenario context: ${profile.email_tip}
Best tones for this audience: ${emailScenario.bestTones.join(", ")}
Is this scenario a bad fit for this audience: ${isBadScenario ? "YES — this product would seem scammy or inappropriate to this audience" : "No"}

Grade harshly but fairly. Consider: does the subject line create curiosity? Is it the right length (2-8 words ideal)? Does the tone match the audience AND the scenario type?`;

    const grade = await gradeWithAI(prompt);
    setLoading(false);
    setResult({ good: grade.good, reason: grade.reason, lesson: grade.lesson, statChange: grade.statChange });
    sounds[grade.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(grade.good
      ? { users: 200 + Math.floor(grade.score * 2), money: 300 }
      : { users: Math.max(-100, grade.score - 50) }
    ), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>📧 Cold Email Blast</p>
        <TimerRing seconds={timeLeft} total={timer} color="#60a5fa" />
      </div>
      <div style={{ background: "#fff8", borderRadius: 8, padding: "6px 10px", marginBottom: 8 }}>
        <p style={{ fontSize: 9, color: "#666", marginBottom: 2 }}>Scenario tip: {profile.email_tip}</p>
      </div>
      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ background: "#f1f3f4", padding: "6px 12px", display: "flex", gap: 6, alignItems: "center" }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
          <p style={{ fontSize: 10, color: "#666", marginLeft: 6 }}>New Message — {profile.name}</p>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ borderBottom: "1px solid #eee", paddingBottom: 8, marginBottom: 8 }}>
            <p style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>TO</p>
            <div style={{ background: "#e8f0fe", borderRadius: 20, padding: "4px 12px", display: "inline-block" }}>
              <p style={{ fontSize: 11, color: "#1a73e8" }}>{emailScenario.audience}</p>
            </div>
            <p style={{ fontSize: 9, color: "#bbb", marginTop: 3 }}>💡 {emailScenario.tip}</p>
          </div>
          <div style={{ borderBottom: "1px solid #eee", paddingBottom: 8, marginBottom: 8 }}>
            <p style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>SUBJECT</p>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Write your subject line..." maxLength={60} disabled={submitted}
              style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#333", background: "transparent", boxSizing: "border-box" }} />
            <p style={{ fontSize: 9, color: subject.trim().split(" ").filter(Boolean).length > 8 ? "#ff4444" : "#bbb", marginTop: 2 }}>
              {subject.trim().split(" ").filter(Boolean).length}/8 words ideal
            </p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: "#999", marginBottom: 6 }}>TONE</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tones.map(t => (
                <button key={t} onClick={() => !submitted && setTone(t)}
                  style={{ padding: "3px 10px", background: tone === t ? "#1a73e8" : "#f1f3f4", color: tone === t ? "#fff" : "#555", border: "none", borderRadius: 20, fontSize: 11, cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {!submitted && <button onClick={() => submit(false)} disabled={loading}
        style={{ width: "100%", padding: "10px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        Send →
      </button>}
      {loading && <p style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }}>AI grading your email...</p>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function BlogPostActivity({ onComplete, scenario, difficulty }) {
  const profile = getScenarioProfile(scenario?.id);
  const timer = getTimer(25, difficulty);
  const angles = ["💡 Thought Leadership", "🔥 Hot Take", "📖 Story", "📊 Data-Driven", "❓ Contrarian"];
  const targets = ["Founders", "Investors", "Customers", "Press", "Job Seekers"];
  const [title, setTitle] = useState("");
  const [angle, setAngle] = useState(null);
  const [target, setTarget] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  async function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !title.trim() || !angle || !target) {
      setResult({ good: false, reason: "You didn't complete the post — missing title, angle, or target audience.", lesson: "Content with no direction gets no readers. Always know your angle and audience.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setLoading(true);
    const prompt = `Grade this blog post concept for a startup called "${profile.name}" (type: ${profile.type}).
Title: "${title}"
Angle: ${angle}
Target reader: ${target}
Scenario context: ${profile.tone}

Consider: Is the title compelling? Does it create curiosity or promise value? Is the angle appropriate for the scenario type? Does it match the target reader? 3-10 words is ideal length.`;
    const grade = await gradeWithAI(prompt);
    setLoading(false);
    setResult({ good: grade.good, reason: grade.reason, lesson: grade.lesson, statChange: grade.statChange });
    sounds[grade.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(grade.good
      ? { users: 150 + Math.floor(grade.score * 3), morale: 8 }
      : { users: 20 }
    ), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>📰 Write Blog Post</p>
        <TimerRing seconds={timeLeft} total={timer} color="#facc15" />
      </div>
      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ background: "#f8f9fa", padding: "6px 14px", borderBottom: "1px solid #eee", display: "flex", gap: 10 }}>
          {["B","I","U","H1","H2"].map(s => <span key={s} style={{ fontSize: 11, color: "#666" }}>{s}</span>)}
          <span style={{ fontSize: 10, color: "#aaa", marginLeft: 8 }}>Writing for {profile.name}</span>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Your post title..." maxLength={80} disabled={submitted}
            style={{ width: "100%", border: "none", outline: "none", fontSize: 17, fontWeight: 700, color: "#111", fontFamily: "Georgia,serif", background: "transparent", marginBottom: 8, boxSizing: "border-box" }} />
          <div style={{ height: 1, background: "#eee", marginBottom: 10 }} />
          <p style={{ fontSize: 10, color: "#999", marginBottom: 6 }}>Angle</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            {angles.map(a => <button key={a} onClick={() => !submitted && setAngle(a)} style={{ padding: "3px 9px", background: angle === a ? "#333" : "#f1f3f4", color: angle === a ? "#fff" : "#555", border: "none", borderRadius: 20, fontSize: 10, cursor: "pointer" }}>{a}</button>)}
          </div>
          <p style={{ fontSize: 10, color: "#999", marginBottom: 6 }}>Writing for</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {targets.map(t => <button key={t} onClick={() => !submitted && setTarget(t)} style={{ padding: "3px 9px", background: target === t ? "#333" : "#f1f3f4", color: target === t ? "#fff" : "#555", border: "none", borderRadius: 20, fontSize: 10, cursor: "pointer" }}>{t}</button>)}
          </div>
        </div>
      </div>
      {!submitted && <button onClick={() => submit(false)} style={{ width: "100%", padding: "10px", background: "#333", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Publish →</button>}
      {loading && <p style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }}>AI reviewing your post...</p>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function NetworkingActivity({ onComplete, difficulty }) {
  const timer = getTimer(15, difficulty);
  const available = NETWORKING_NPCS.filter(n => !usedNPCsSession.has(n.name));
  const pool = available.length > 0 ? available : NETWORKING_NPCS;
  const npc = useRef(pool[Math.floor(Math.random() * pool.length)]).current;
  useEffect(() => { usedNPCsSession.add(npc.name); }, []);
  const shuffledLines = useRef([...npc.lines].sort(() => Math.random() - 0.5)).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(line, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !line) {
      setResult({ good: false, reason: "You hesitated and the moment passed. Networking requires confident openers.", lesson: "Hesitation reads as disinterest. Confident specific openers always beat generic ones.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setResult({
      good: line.good,
      reason: line.good
        ? `${npc.name} responded well — that opener matched their style (${npc.personality.toLowerCase()}).`
        : `${npc.name} shut down. Their dealbreaker is ${npc.dealbreaker} and your opener triggered it.`,
      lesson: line.good
        ? `${npc.name} loved it. Knowing your audience is everything.`
        : `${npc.name} walked away. Research who you're talking to first.`,
      statChange: line.good ? "+$1,000 · +100 users · +10% morale" : "-5% morale",
    });
    sounds[line.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(line.good ? { money: 1000, morale: 10, users: 100 } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🤝 Networking Event</p>
        <TimerRing seconds={timeLeft} total={timer} color="#2dd4bf" />
      </div>
      <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{npc.emoji}</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{npc.name}</p>
            <p style={{ fontSize: 11, color: "#60a5fa" }}>{npc.role}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, background: "#222", color: "#888", padding: "2px 8px", borderRadius: 4 }}>{npc.personality}</span>
          <span style={{ fontSize: 10, background: "#1a0808", color: "#ff8888", padding: "2px 8px", borderRadius: 4 }}>❌ {npc.dealbreaker}</span>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>Pick your opening line:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {shuffledLines.map((line, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(line); }} disabled={submitted}
            style={{ padding: "9px 12px", background: chosen === i ? "#222" : "#111", border: "0.5px solid #2a2a2a", borderRadius: 8, color: "#ccc", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
            "{line.text}"
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function AttackActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(8, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const [clicks, setClicks] = useState(0);
  const [pos, setPos] = useState({ x: 45, y: 45 });
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const clicksRef = useRef(0);
  const doneRef = useRef(false);
  const timeLeft = useCountdown(timer, () => { if (!doneRef.current) finish(); }, !done);

  function moveTarget() { setPos({ x: 5 + Math.random() * 80, y: 5 + Math.random() * 75 }); }

  function handleClick() {
    if (done) return;
    sounds.action?.();
    clicksRef.current += 1;
    setClicks(clicksRef.current);
    moveTarget();
  }

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    const c = clicksRef.current;
    const isChaos = profile.type === "chaos";
    const threshold = difficulty === "shark" ? 18 : difficulty === "veteran" ? 14 : 10;
    const good = isChaos ? c >= threshold * 0.7 : c >= threshold;
    setResult({
      good,
      reason: good
        ? `${c} hits landed — enough sustained pressure to pull real users from the competitor.`
        : `Only ${c} hit${c !== 1 ? "s" : ""} — not enough to make a dent. Your competitor barely noticed.`,
      lesson: good
        ? `${c} hits! Aggressive competitive moves compound over time. ${isChaos ? "In your market, weirdly, chaos works." : "Consistent pressure beats one-off attacks."}`
        : "Too slow. Half-measures backfire. Your competitor retaliated.",
      statChange: good ? `+${c * 25} users · +10% morale` : `-100 users · -5% morale`,
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { users: c * 25, morale: 10 } : { users: -100, morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <p style={{ fontSize: 12, color: "#888" }}>⚔️ Attack Competitor</p>
        <TimerRing seconds={timeLeft} total={timer} color="#ff4444" />
      </div>
      <p style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Click the competitor logo as fast as you can!</p>
      <div style={{ position: "relative", height: 150, background: "#0a0a0a", borderRadius: 10, overflow: "hidden", border: "0.5px solid #222", marginBottom: 8 }}>
        {!done && (
          <button onClick={handleClick} style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 30, transition: "left 0.1s, top 0.1s", userSelect: "none" }}>
            🏢
          </button>
        )}
        <p style={{ position: "absolute", bottom: 8, width: "100%", textAlign: "center", fontSize: 16, fontWeight: 700, color: "#ff4444" }}>{clicks} hits</p>
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function ShipFastActivity({ onComplete, difficulty }) {
  const timer = getTimer(10, difficulty);
  const BUG_SETS = [
    [
      { id: 0, code: "const fee = amount * 0.0;", bug: "0.0", fix: "0.029" },
      { id: 1, code: "if (amount = null) return;", bug: "amount = null", fix: "amount === null" },
      { id: 2, code: 'console.log("debug mode on")', bug: 'console.log("debug mode on")', fix: "// removed" },
    ],
    [
      { id: 0, code: "const users = db.getAll()", bug: "db.getAll()", fix: "await db.getAll()" },
      { id: 1, code: "if (user = undefined) redirect();", bug: "user = undefined", fix: "user === undefined" },
      { id: 2, code: "password = req.body.password", bug: "password = req.body.password", fix: "password = hash(req.body.password)" },
    ],
    [
      { id: 0, code: "price = price * 1.0 + tax", bug: "1.0 + tax", fix: "1.0 * (1 + tax)" },
      { id: 1, code: "for (i = 0; i <= arr.length; i++)", bug: "i <= arr.length", fix: "i < arr.length" },
      { id: 2, code: 'api_key = "sk-live-abc123"', bug: '"sk-live-abc123"', fix: "process.env.API_KEY" },
    ],
  ];
  const bugSet = useRef(BUG_SETS[Math.floor(Math.random() * BUG_SETS.length)]).current;
  const [fixed, setFixed] = useState([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const fixedRef = useRef([]);
  const doneRef = useRef(false);
  const timeLeft = useCountdown(timer, () => { if (!doneRef.current) finish(); }, !done);

  function clickBug(id) {
    if (done || fixedRef.current.includes(id)) return;
    sounds.action?.();
    fixedRef.current = [...fixedRef.current, id];
    setFixed([...fixedRef.current]);
  }

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    const count = fixedRef.current.length;
    const good = count >= 2;
    setResult({
      good,
      reason: count === 3
        ? "All 3 bugs caught before shipping — clean release."
        : count === 2
        ? `You missed 1 bug. It's in production now and will surface at the worst possible moment.`
        : `You shipped with ${3 - count} unfixed bug${3 - count > 1 ? "s" : ""}. Expect crashes and churn.`,
      lesson: count === 3
        ? "Perfect ship! Every unfixed bug is technical debt that compounds."
        : count === 2
        ? "Almost clean. That one unfixed bug will appear at the worst time."
        : "Shipped with bugs. This triggers crashes and user churn.",
      statChange: count === 3 ? "+200 users · +10% morale" : count === 2 ? "+100 users" : "-100 users · -10% morale",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(count === 3 ? { users: 200, morale: 10 } : count === 2 ? { users: 100 } : { users: -100, morale: -10 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: "#888" }}>⚡ Ship Fast (CTO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#f472b6" />
      </div>
      <p style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>Click the red bugs to fix them before shipping!</p>
      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: "12px", fontFamily: "monospace", fontSize: 12, lineHeight: 2, marginBottom: 8 }}>
        <div style={{ color: "#a78bfa" }}>{"function processPayment(amount) {"}</div>
        {bugSet.map(bug => (
          <div key={bug.id} style={{ paddingLeft: 16 }}>
            {bug.code.split(bug.bug).map((part, i, arr) => (
              <span key={i}>
                <span style={{ color: "#ccc" }}>{part}</span>
                {i < arr.length - 1 && (fixedRef.current.includes(bug.id)
                  ? <span style={{ color: "#4ade80" }}>{bug.fix}</span>
                  : <span onClick={() => clickBug(bug.id)} style={{ color: "#ff4444", textDecoration: "underline", cursor: "pointer", background: "#ff444415", padding: "0 2px", borderRadius: 3 }}>{bug.bug}</span>
                )}
              </span>
            ))}
          </div>
        ))}
        <div style={{ color: "#a78bfa" }}>{"}"}</div>
      </div>
      <p style={{ fontSize: 11, color: "#555", textAlign: "center", marginBottom: 6 }}>{fixed.length}/3 bugs fixed</p>
      {!done && fixed.length === 3 && (
        <button onClick={() => finish()} style={{ width: "100%", padding: "9px", background: "#4ade80", color: "#000", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Ship It →</button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function FixTechDebtActivity({ onComplete, difficulty }) {
  const timer = getTimer(20, difficulty);
  const DEBT_SETS = [
    {
      title: "Connect the architecture correctly",
      nodes: ["API Gateway", "Auth Service", "Database", "Cache", "Frontend"],
      correct: [[0,1],[1,2],[2,3],[0,4]],
      hint: "API Gateway → Auth → DB → Cache, Gateway → Frontend",
      debtItems: [2, 3],
    },
    {
      title: "Identify which components have tech debt",
      nodes: ["Monolith (5yr old)", "New microservice", "Legacy DB (no indexes)", "Modern API", "jQuery frontend (2012)"],
      debtItems: [0, 2, 4],
      hint: "The old monolith, unindexed DB, and jQuery are the debt",
    },
  ];
  const debtSet = useRef(DEBT_SETS[Math.floor(Math.random() * DEBT_SETS.length)]).current;
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  function toggle(i) { if (submitted) return; setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]); }

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || selected.length === 0) {
      setResult({ good: false, reason: "You ran out of time without flagging any debt.", lesson: "Not addressing tech debt lets it compound silently. Every skipped fix adds to your crash risk.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const correct = debtSet.debtItems || [];
    const hits = selected.filter(i => correct.includes(i)).length;
    const misses = selected.filter(i => !correct.includes(i)).length;
    const good = hits >= 2 && misses === 0;
    setResult({
      good,
      reason: misses > 0
        ? `You flagged ${misses} healthy component${misses > 1 ? "s" : ""} as debt. Refactoring working code wastes sprint time.`
        : hits < 2
        ? `You only caught ${hits} of ${correct.length} debt items. The ones you missed will cause crashes later.`
        : "All debt correctly identified with no false positives.",
      lesson: good
        ? "Great debt identification. Tech debt compounds like financial debt — address it early."
        : misses > 0
        ? "You flagged healthy components as debt. Premature refactoring wastes engineering time."
        : "Missed some debt. The legacy components you left will cause crashes later.",
      statChange: good ? "+$1,000 · +10% morale" : "-5% morale",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { money: 1000, morale: 10 } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🐛 Fix Tech Debt (CTO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#f472b6" />
      </div>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 6 }}>{debtSet.title}</p>
      <p style={{ fontSize: 10, color: "#facc15", marginBottom: 10 }}>💡 Hint: {debtSet.hint}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {debtSet.nodes.map((node, i) => (
          <button key={i} onClick={() => toggle(i)} disabled={submitted}
            style={{ padding: "9px 12px", background: selected.includes(i) ? "#2a0a0a" : "#111", border: `0.5px solid ${selected.includes(i) ? "#ff4444" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left", color: selected.includes(i) ? "#ff8888" : "#888", fontSize: 12 }}>
            {selected.includes(i) ? "⚠️" : "○"} {node}
          </button>
        ))}
      </div>
      {!submitted && (
        <button onClick={() => submit(false)} style={{ width: "100%", padding: "9px", background: "#f472b6", color: "#000", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Address Debt →
        </button>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function ABTestActivity({ onComplete, difficulty }) {
  const timer = getTimer(20, difficulty);
  const usedIdx = useRef(new Set());
  const getTest = () => {
    const available = AB_TESTS.filter((_, i) => !usedIdx.current.has(i));
    const pool = available.length > 0 ? available : AB_TESTS;
    const idx = Math.floor(Math.random() * pool.length);
    usedIdx.current.add(idx);
    return pool[idx];
  };
  const test = useRef(getTest()).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(pick, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !pick) {
      setResult({ good: false, reason: "You didn't pick a version before time ran out.", lesson: "Indecision in A/B testing wastes your sample size.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const correct = pick === "a" ? !!test.a.wins : !!test.b.wins;
    setResult({
      good: correct,
      reason: correct
        ? `Correct — Version ${pick.toUpperCase()} wins in practice. Good data instinct.`
        : `Wrong call. Version ${pick === "a" ? "B" : "A"} actually wins. The data consistently shows this.`,
      lesson: test.lesson,
      statChange: correct ? "+150 users · +$500" : "+30 users",
    });
    sounds[correct ? "success" : "fail"]?.();
    setTimeout(() => onComplete(correct ? { users: 150, money: 500 } : { users: 30 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🧪 A/B Test</p>
        <TimerRing seconds={timeLeft} total={timer} color="#a78bfa" />
      </div>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 14 }}>{test.question}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {["a", "b"].map(pick => (
          <button key={pick} onClick={() => { setChosen(pick); submit(pick); }} disabled={submitted}
            style={{ padding: "12px 8px", background: chosen === pick ? "#a78bfa20" : "#111", border: `1px solid ${chosen === pick ? "#a78bfa" : "#222"}`, borderRadius: 10, color: "#ccc", fontSize: 12, cursor: "pointer", textAlign: "center", lineHeight: 1.5 }}>
            <p style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>Version {pick.toUpperCase()}</p>
            {test[pick].label}
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function PitchPracticeActivity({ onComplete, difficulty }) {
  const timer = getTimer(15, difficulty);
  const usedIdx = useRef(new Set());
  const getQ = () => {
    const available = PITCH_OBJECTIONS.filter((_, i) => !usedIdx.current.has(i));
    const pool = available.length > 0 ? available : PITCH_OBJECTIONS;
    const idx = Math.floor(Math.random() * pool.length);
    usedIdx.current.add(idx);
    return pool[idx];
  };
  const q = useRef(getQ()).current;
  const shuffled = useRef([...q.options].sort(() => Math.random() - 0.5)).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(opt, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !opt) {
      setResult({ good: false, reason: "You froze on the objection. Silence in a pitch is lethal.", lesson: "Freezing on an investor objection is worse than a wrong answer.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setResult({
      good: opt.good,
      reason: opt.good
        ? "Strong answer — you addressed the objection with evidence, not reassurance."
        : "Weak answer — investors need specifics. Reassurances without data don't move them.",
      lesson: q.lesson,
      statChange: opt.good ? "+12% morale" : "-5% morale",
    });
    sounds[opt.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(opt.good ? { morale: 12 } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🎤 Pitch Practice</p>
        <TimerRing seconds={timeLeft} total={timer} color="#fb923c" />
      </div>
      <div style={{ background: "#0a0f1a", border: "1px solid #60a5fa30", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: "#60a5fa", marginBottom: 4 }}>🦈 Investor says:</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{q.objection}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {shuffled.map((opt, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(opt); }} disabled={submitted}
            style={{ padding: "9px 12px", background: chosen === i ? "#222" : "#111", border: "0.5px solid #2a2a2a", borderRadius: 8, color: "#ccc", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
            "{opt.text}"
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function DefectActivity({ onComplete }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(null);

  function confirm() {
    if (text !== "BETRAY") return;
    setSubmitted(true);
    let c = 3;
    setCountdown(c);
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) { clearInterval(t); sounds.defect?.(); onComplete({ defect: true }); }
    }, 1000);
  }

  return (
    <div style={{ textAlign: "center", padding: "1rem 0" }}>
      <div style={{ fontSize: 48, marginBottom: 10 }}>😈</div>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#ff4444", marginBottom: 8 }}>Betray your team?</p>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 16, lineHeight: 1.5 }}>You'll keep 40% of current stats and start a rival company. Your team gets notified. Cannot be undone.</p>
      {!submitted ? (
        <>
          <input value={text} onChange={e => setText(e.target.value.toUpperCase())} placeholder="Type BETRAY to confirm"
            style={{ width: "100%", padding: "11px", background: "#1a0808", border: "1px solid #ff444440", borderRadius: 8, color: "#ff4444", fontSize: 15, fontWeight: 700, letterSpacing: 3, textAlign: "center", outline: "none", boxSizing: "border-box", marginBottom: 10, fontFamily: "monospace" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={confirm} disabled={text !== "BETRAY"}
              style={{ flex: 1, padding: "11px", background: text === "BETRAY" ? "#ff4444" : "#222", color: text === "BETRAY" ? "#fff" : "#555", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: text === "BETRAY" ? "pointer" : "default" }}>
              Defect 😈
            </button>
            <button onClick={() => onComplete(null)}
              style={{ flex: 1, padding: "11px", background: "#222", color: "#888", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              Stay
            </button>
          </div>
        </>
      ) : (
        <div>
          <p style={{ fontSize: 52, fontWeight: 700, color: "#ff4444" }}>{countdown}</p>
          <p style={{ fontSize: 12, color: "#888" }}>Notifying your team...</p>
        </div>
      )}
    </div>
  );
}

function MathActivity({ onComplete, difficulty }) {
  const timer = getTimer(20, difficulty);
  const usedIdx = useRef(new Set());
  const getQ = () => {
    const available = MATH_PROBLEMS.filter((_, i) => !usedIdx.current.has(i));
    const pool = available.length > 0 ? available : MATH_PROBLEMS;
    const idx = Math.floor(Math.random() * pool.length);
    usedIdx.current.add(idx);
    return pool[idx];
  };
  const q = useRef(getQ()).current;
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut && !input.trim()) {
      setResult({ good: false, reason: "You ran out of time without answering.", lesson: q.lesson, statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const val = parseFloat(input.replace(/[^0-9.]/g, ""));
    const tolerance = q.tolerance || 0;
    const correct = Math.abs(val - q.answer) <= (tolerance || q.answer * 0.05);
    setResult({
      good: correct,
      reason: correct
        ? `Correct! The answer is ${q.answer}${q.unit}.`
        : `Wrong — the answer is ${q.answer}${q.unit}. You answered ${val || "nothing"}.`,
      lesson: q.lesson,
      statChange: correct ? "+$2,000 · +10% morale" : "-5% morale",
    });
    sounds[correct ? "success" : "fail"]?.();
    setTimeout(() => onComplete(correct ? { money: 2000, morale: 10 } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🧮 Business Math</p>
        <TimerRing seconds={timeLeft} total={timer} color="#4ade80" />
      </div>
      <div style={{ background: "#0a1a0a", border: "1px solid #4ade8030", borderRadius: 10, padding: "14px", marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#fff", lineHeight: 1.6 }}>{q.question}</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder={`Your answer (${q.unit})`}
          onKeyDown={e => e.key === "Enter" && !submitted && submit(false)} disabled={submitted}
          style={{ flex: 1, padding: "10px 12px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none" }} />
        {!submitted && <button onClick={() => submit(false)} style={{ padding: "10px 16px", background: "#4ade80", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>→</button>}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function DrawingActivity({ onComplete, difficulty }) {
  const timer = getTimer(45, difficulty);
  const billionaire = useRef(BILLIONAIRES[Math.floor(Math.random() * BILLIONAIRES.length)]).current;
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [description, setDescription] = useState("");
  const timeLeft = useCountdown(timer, () => submit(), !submitted);

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
  function startDraw(e) { drawing.current = true; const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); const pos = getPos(e, canvas); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); setHasDrawn(true); }
  function draw(e) { if (!drawing.current) return; e.preventDefault(); const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); const pos = getPos(e, canvas); ctx.lineTo(pos.x, pos.y); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke(); }
  function stopDraw() { drawing.current = false; }
  function clearCanvas() { const canvas = canvasRef.current; canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); setHasDrawn(false); }

  function submit() {
    if (submitted) return;
    setSubmitted(true);
    if (!hasDrawn) {
      setResult({ good: false, reason: "You drew nothing. A blank canvas communicates nothing.", lesson: "Blank pitches get blank responses.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const descLower = description.toLowerCase();
    const keywordMatch = billionaire.keywords.some(k => descLower.includes(k));
    const good = keywordMatch || Math.random() > 0.45;
    setResult({
      good,
      reason: good
        ? `The AI recognizes ${billionaire.name} — you captured the key visual cues.`
        : `Didn't read as ${billionaire.name}. Try including: ${billionaire.hints.slice(0, 2).join(" or ")}.`,
      lesson: good
        ? `Great visual storytelling. Personal branding = immediate recognition.`
        : `Hint: try drawing ${billionaire.hints.slice(0,2).join(" or ")}.`,
      statChange: good ? "+20% morale · +200 users" : "+5% morale",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { morale: 20, users: 200 } : { morale: 5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🎨 Draw Yourself as {billionaire.name}</p>
        <TimerRing seconds={timeLeft} total={timer} color="#f472b6" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Draw yourself as {billionaire.name} {billionaire.emoji}. Include: {billionaire.hints.slice(0,3).join(", ")}.</p>
      <div style={{ background: "#0a0a0a", border: "0.5px solid #333", borderRadius: 10, overflow: "hidden", marginBottom: 6 }}>
        <canvas ref={canvasRef} width={340} height={160} style={{ width: "100%", height: 160, display: "block", touchAction: "none", cursor: "crosshair" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      </div>
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what you drew (optional — helps AI judge)" disabled={submitted}
        style={{ width: "100%", padding: "8px", background: "#111", border: "0.5px solid #333", borderRadius: 6, color: "#888", fontSize: 11, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={clearCanvas} disabled={submitted} style={{ padding: "7px 14px", background: "#222", color: "#888", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Clear</button>
        {!submitted && hasDrawn && (
          <button onClick={submit} style={{ flex: 1, padding: "7px", background: "#f472b6", color: "#000", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Submit →</button>
        )}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function FinancialModelActivity({ onComplete, difficulty }) {
  const timer = getTimer(25, difficulty);
  const TARGETS = [
    { cac: 40, ltv: 200, burn: 8000 },
    { cac: 25, ltv: 150, burn: 5000 },
    { cac: 80, ltv: 400, burn: 15000 },
    { cac: 15, ltv: 90, burn: 3000 },
  ];
  const target = useRef(TARGETS[Math.floor(Math.random() * TARGETS.length)]).current;
  const [cac, setCac] = useState(50);
  const [ltv, setLtv] = useState(150);
  const [burn, setBurn] = useState(10000);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    const cacOff = Math.abs(cac - target.cac) / target.cac;
    const ltvOff = Math.abs(ltv - target.ltv) / target.ltv;
    const burnOff = Math.abs(burn - target.burn) / target.burn;
    const avgOff = (cacOff + ltvOff + burnOff) / 3;
    const good = avgOff < 0.25;
    setResult({
      good,
      reason: good
        ? `Your estimates were within 25% on all three metrics — good financial instincts.`
        : `You were off by an average of ${Math.round(avgOff * 100)}%. Real numbers: CAC $${target.cac}, LTV $${target.ltv}, burn $${target.burn.toLocaleString()}/mo.`,
      lesson: good
        ? `Great estimates! Knowing these lets you predict event impact before it happens.`
        : `These are the heartbeat of your company. Know them cold.`,
      statChange: good ? "+$2,000 · +10% morale" : "-5% morale",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { money: 2000, morale: 10 } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#888" }}>📈 Financial Model</p>
        <TimerRing seconds={timeLeft} total={timer} color="#4ade80" />
      </div>
      <p style={{ fontSize: 11, color: "#777", marginBottom: 12 }}>Estimate your company's key metrics. Closer = better intel.</p>
      {[
        { label: "Customer Acquisition Cost (CAC)", value: cac, set: setCac, min: 5, max: 300, unit: "$", step: 5 },
        { label: "Lifetime Value (LTV)", value: ltv, set: setLtv, min: 20, max: 2000, unit: "$", step: 10 },
        { label: "Monthly Burn Rate", value: burn, set: setBurn, min: 1000, max: 80000, unit: "$", step: 500 },
      ].map(({ label, value, set, min, max, unit, step }) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <p style={{ fontSize: 11, color: "#888" }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{unit}{value.toLocaleString()}</p>
          </div>
          <input type="range" min={min} max={max} step={step} value={value} onChange={e => !submitted && set(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
      ))}
      {!submitted && <button onClick={() => submit(false)} style={{ width: "100%", padding: "10px", background: "#4ade80", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Submit Model →</button>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function AuditTrailActivity({ onComplete, difficulty }) {
  const timer = getTimer(30, difficulty);
  const logSet = useRef(TRANSACTION_LOGS[Math.floor(Math.random() * TRANSACTION_LOGS.length)]).current;
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  function toggle(i) { if (submitted) return; setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]); }

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    const suspiciousIdx = logSet.map((t, i) => t.suspicious ? i : -1).filter(i => i >= 0);
    const correct = suspiciousIdx.filter(i => selected.includes(i)).length;
    const falsePos = selected.filter(i => !suspiciousIdx.includes(i)).length;
    const good = correct >= suspiciousIdx.length && falsePos === 0;
    setResult({
      good,
      reason: good
        ? "Every anomaly found with no false accusations — perfect audit."
        : falsePos > 0
        ? `You flagged ${falsePos} legitimate transaction${falsePos > 1 ? "s" : ""} as suspicious. False accusations damage team trust.`
        : `You missed ${suspiciousIdx.length - correct} suspicious entry${suspiciousIdx.length - correct > 1 ? "ies" : ""}. Every undetected fraud compounds.`,
      lesson: good
        ? "Good CFOs protect without creating paranoia."
        : falsePos > 0
        ? "Verify before flagging. False accusations damage team trust."
        : "Every undetected fraud compounds.",
      statChange: good ? "+$1,000 · +15% morale" : "-5% morale",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { money: 1000, morale: 15 } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🕵️ Audit Trail</p>
        <TimerRing seconds={timeLeft} total={timer} color="#4ade80" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Tap suspicious transactions. Wrong accusations have consequences.</p>
      <div style={{ background: "#0a1a0a", border: "0.5px solid #1a3a1a", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ background: "#0f2a0f", padding: "6px 12px" }}><p style={{ fontSize: 10, color: "#4ade80" }}>🏦 Transaction Log</p></div>
        {logSet.map((t, i) => (
          <button key={i} onClick={() => toggle(i)}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: selected.includes(i) ? "#2a0a0a" : "transparent", border: "none", borderBottom: "0.5px solid #0f2a0f", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 12, color: selected.includes(i) ? "#ff8888" : "#aaa" }}>{t.desc}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: t.amount > 0 ? "#4ade80" : "#ff8888", fontFamily: "monospace" }}>
                {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}
              </span>
              {selected.includes(i) && <span style={{ fontSize: 10, color: "#ff4444" }}>⚠️</span>}
            </div>
          </button>
        ))}
      </div>
      {!submitted && <button onClick={() => submit(false)} style={{ width: "100%", padding: "10px", background: "#4ade80", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Submit Audit →</button>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function EmergencyReserveActivity({ onComplete, difficulty }) {
  const timer = getTimer(15, difficulty);
  const burnRate = useRef(3000 + Math.floor(Math.random() * 12000)).current;
  const nextEventCost = useRef(500 + Math.floor(Math.random() * 8000)).current;
  const [amount, setAmount] = useState(2000);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    const tooMuch = amount > burnRate * 0.65;
    const tooLittle = amount < nextEventCost * 0.8;
    const good = !tooMuch && !tooLittle;
    setResult({
      good,
      reason: good
        ? `$${amount.toLocaleString()} locked — enough to cover the next event without starving operations.`
        : tooMuch
        ? `$${amount.toLocaleString()} is more than 65% of your burn rate. That kills your liquidity.`
        : `$${amount.toLocaleString()} won't cover the next event which could cost up to $${nextEventCost.toLocaleString()}.`,
      lesson: good
        ? `Smart reserve. Covers next event without starving operations.`
        : tooMuch
        ? `Too much locked. Burn rate $${burnRate.toLocaleString()}/mo — that reserve kills liquidity.`
        : `Too little. Next event could cost up to $${nextEventCost.toLocaleString()}.`,
      statChange: good ? `+$${amount.toLocaleString()} protected · +5% morale` : "-5% morale",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { money: amount, morale: 5 } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🏦 Emergency Reserve</p>
        <TimerRing seconds={timeLeft} total={timer} color="#4ade80" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "#111", borderRadius: 8, padding: "10px", textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Monthly burn</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#ff4444", fontFamily: "monospace" }}>${burnRate.toLocaleString()}</p>
        </div>
        <div style={{ background: "#111", borderRadius: 8, padding: "10px", textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Next event est.</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#facc15", fontFamily: "monospace" }}>up to ${nextEventCost.toLocaleString()}</p>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <p style={{ fontSize: 12, color: "#888" }}>Lock away</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#4ade80", fontFamily: "monospace" }}>${amount.toLocaleString()}</p>
        </div>
        <input type="range" min={500} max={20000} step={500} value={amount} onChange={e => !submitted && setAmount(Number(e.target.value))} style={{ width: "100%" }} />
      </div>
      {!submitted && <button onClick={() => submit(false)} style={{ width: "100%", padding: "10px", background: "#4ade80", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Lock It Away →</button>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function CampaignBlastActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(25, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const PERSONAS = [
    { id: "student", label: "🎓 College Student", wants: "cheap, fast, viral", good_headline_style: "emoji, slang, relatable" },
    { id: "parent", label: "👨‍👩‍👧 Busy Parent", wants: "saves time, peace of mind", good_headline_style: "benefit-led, warm" },
    { id: "techbro", label: "💻 Tech Bro", wants: "10x, scalable, disruption", good_headline_style: "bold metrics, buzzwords ok" },
    { id: "retiree", label: "👴 Retired Professional", wants: "simple, trustworthy, no jargon", good_headline_style: "clear, no caps, warm" },
    { id: "creator", label: "🎮 Content Creator", wants: "audience growth, revenue, tools", good_headline_style: "exciting, outcome-focused" },
    { id: "executive", label: "👔 C-Suite Executive", wants: "ROI, efficiency, compliance", good_headline_style: "data-driven, professional" },
  ];
  const persona = useRef(PERSONAS[Math.floor(Math.random() * PERSONAS.length)]).current;
  const [headline, setHeadline] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  async function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !headline.trim()) {
      setResult({ good: false, reason: "No headline submitted — campaign never launched.", lesson: "No headline = no campaign.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setLoading(true);
    const prompt = `Grade this ad headline for a ${profile.name} startup targeting ${persona.label} (${persona.wants}).
Headline: "${headline}"
Good headline style for this audience: ${persona.good_headline_style}
Scenario type: ${profile.type}

Is the headline compelling for this specific audience? Does it speak to what they actually want? Is it scannable in 3 seconds? Does it make sense for the product type?`;
    const grade = await gradeWithAI(prompt);
    setLoading(false);
    setResult({ good: grade.good, reason: grade.reason, lesson: grade.lesson, statChange: grade.statChange });
    sounds[grade.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(grade.good ? { users: 300 + Math.floor(grade.score * 2), money: -500 } : { users: 30, money: -500 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>📢 Campaign Blast</p>
        <TimerRing seconds={timeLeft} total={timer} color="#facc15" />
      </div>
      <div style={{ background: "#1a1500", border: "1px solid #facc1530", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: "#facc15", marginBottom: 4 }}>Target customer for {profile.name}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{persona.label}</p>
        <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>They want: {persona.wants}</p>
        <p style={{ fontSize: 10, color: "#555", marginTop: 2 }}>Good style: {persona.good_headline_style}</p>
      </div>
      <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Your ad headline..." maxLength={60} disabled={submitted}
        style={{ width: "100%", padding: "11px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
      {!submitted && <button onClick={() => submit(false)} disabled={loading} style={{ width: "100%", padding: "10px", background: "#facc15", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Launch Campaign →</button>}
      {loading && <p style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }}>AI grading your headline...</p>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function BrandRefreshActivity({ onComplete, difficulty }) {
  const timer = getTimer(30, difficulty);
  const colors = ["#ff4444","#60a5fa","#4ade80","#facc15","#a78bfa","#fb923c","#f472b6","#2dd4bf","#000","#fff"];
  const vibes = ["Minimal","Bold","Quirky","Corporate","Warm","Dark","Playful","Premium"];
  const [color, setColor] = useState(null);
  const [vibe, setVibe] = useState(null);
  const [tagline, setTagline] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !color || !vibe || !tagline.trim()) {
      setResult({ good: false, reason: "Rebrand incomplete — you need a color, vibe, and tagline.", lesson: "A rebrand with no direction is just noise.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const wc = tagline.trim().split(" ").filter(Boolean).length;
    const good = wc >= 2 && wc <= 6;
    setResult({
      good,
      reason: good
        ? `"${tagline}" is ${wc} words — clean, memorable, and within the ideal range.`
        : wc > 6
        ? `"${tagline}" is ${wc} words — too long to stick. Under 6 words is the gold standard.`
        : `"${tagline}" is only ${wc} word${wc > 1 ? "s" : ""} — too brief to communicate anything.`,
      lesson: good
        ? "Best taglines are 2-5 words and immediately communicate core value."
        : "Tagline too long or too short. Under 6 words is the gold standard.",
      statChange: good ? "+300 users · +15% morale · -$1,000" : "+100 users · -$1,000",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { users: 300, morale: 15, money: -1000 } : { users: 100, money: -1000 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🎨 Brand Refresh</p>
        <TimerRing seconds={timeLeft} total={timer} color="#f472b6" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>Brand color</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {colors.map(c => <button key={c} onClick={() => !submitted && setColor(c)} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: color === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer" }} />)}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>Brand vibe</p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {vibes.map(v => <button key={v} onClick={() => !submitted && setVibe(v)} style={{ padding: "4px 10px", background: vibe === v ? (color || "#fff") : "#111", color: vibe === v ? "#000" : "#888", border: "0.5px solid #333", borderRadius: 20, fontSize: 11, cursor: "pointer" }}>{v}</button>)}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>New tagline (2-6 words)</p>
        <input value={tagline} onChange={e => !submitted && setTagline(e.target.value)} placeholder="e.g. Just Do It" maxLength={50}
          style={{ width: "100%", padding: "10px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>
      {color && vibe && tagline && (
        <div style={{ background: color + "20", border: `1px solid ${color}40`, borderRadius: 8, padding: "10px", marginBottom: 10, textAlign: "center" }}>
          <p style={{ color, fontSize: 13, fontWeight: 700 }}>{tagline}</p>
          <p style={{ color: "#555", fontSize: 10 }}>{vibe} · {color}</p>
        </div>
      )}
      {!submitted && <button onClick={() => submit(false)} style={{ width: "100%", padding: "10px", background: color || "#333", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Launch Rebrand →</button>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function FakeViralityActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(15, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const angles = ["😳 CEO embarrassing moment","💥 Product fails hilariously","🎭 Fake controversy","❤️ Charity stunt","🤖 AI goes rogue","🐀 Rat-themed content"];
  const platforms = ["TikTok","Twitter/X","Instagram","LinkedIn","Reddit"];
  const [angle, setAngle] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [cringe, setCringe] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !angle || !platform) {
      setResult({ good: false, reason: "You didn't pick an angle or platform before time ran out.", lesson: "Even fake virality needs a plan.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const isChaos = profile.type === "chaos";
    const isRat = scenario?.id === "rat_app" && angle.includes("Rat");
    const baseChance = isChaos ? 0.65 : 0.40;
    const works = isRat ? true : Math.random() < (baseChance + cringe * 0.05);
    setResult({
      good: works,
      reason: works
        ? isRat ? "Rats ARE the content — you played it perfectly." : `The ${angle.toLowerCase()} on ${platform} caught fire. Timing and platform matched.`
        : `The stunt landed flat on ${platform}. The audience saw through it.`,
      lesson: works
        ? "Manufactured moments can go viral but they're unsustainable. Build real traction too."
        : "Audiences smell fake. Authenticity beats manufactured virality 9/10.",
      statChange: works ? "+1,000 users · +10% morale" : "-200 users · -15% morale",
    });
    sounds[works ? "success" : "fail"]?.();
    setTimeout(() => onComplete(works ? { users: 1000, morale: 10 } : { users: -200, morale: -15 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🤳 Fake Virality</p>
        <TimerRing seconds={timeLeft} total={timer} color="#facc15" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>Viral angle</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {angles.map(a => <button key={a} onClick={() => !submitted && setAngle(a)} style={{ padding: "7px 10px", background: angle === a ? "#222" : "#111", border: `0.5px solid ${angle === a ? "#444" : "#222"}`, borderRadius: 7, color: angle === a ? "#fff" : "#666", fontSize: 11, cursor: "pointer", textAlign: "left" }}>{a}</button>)}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>Platform</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {platforms.map(p => <button key={p} onClick={() => !submitted && setPlatform(p)} style={{ padding: "4px 10px", background: platform === p ? "#facc15" : "#111", color: platform === p ? "#000" : "#888", border: "0.5px solid #333", borderRadius: 20, fontSize: 11, cursor: "pointer" }}>{p}</button>)}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{ fontSize: 11, color: "#888" }}>Cringe tolerance</p>
          <p style={{ fontSize: 11, color: "#facc15" }}>{"😐😬😳🤮🫠"[cringe-1]} {cringe}/5</p>
        </div>
        <input type="range" min={1} max={5} step={1} value={cringe} onChange={e => !submitted && setCringe(Number(e.target.value))} style={{ width: "100%" }} />
      </div>
      {!submitted && <button onClick={() => submit(false)} style={{ width: "100%", padding: "10px", background: "#facc15", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Launch Stunt →</button>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function PlantBugActivity({ onComplete, difficulty }) {
  const timer = getTimer(6, difficulty);
  const FILES = [
    ["payments.js","auth.js","users.db","config.env","analytics.js","notifications.js"],
    ["checkout.js","login.js","api/users.js","secrets.env","tracking.js","emails.js"],
    ["billing.js","session.js","database.js","keys.env","metrics.js","sms.js"],
  ];
  const fileSet = useRef(FILES[Math.floor(Math.random() * FILES.length)]).current;
  const targetIdx = useRef(Math.floor(Math.random() * fileSet.length)).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(-1, true), !submitted);

  function submit(idx, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut) {
      setResult({ good: false, reason: "Too slow — the window to plant closed.", lesson: "Planting a bug requires speed and precision.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const good = idx === targetIdx;
    setResult({
      good,
      reason: good
        ? `${fileSet[targetIdx]} is a high-impact dependency — maximum disruption.`
        : `${fileSet[idx]} is the wrong target. ${fileSet[targetIdx]} would have caused more damage.`,
      lesson: good
        ? "Perfect target. High-impact dependency files cause maximum disruption."
        : "Wrong file. Target user-facing critical paths.",
      statChange: good ? "+300 users" : "-100 users · -5% morale",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { users: 300 } : { users: -100, morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🪲 Plant Bug (CTO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#f472b6" />
      </div>
      <p style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>Pick the right file for maximum damage!</p>
      <div style={{ background: "#0a0a0a", border: "0.5px solid #222", borderRadius: 10, padding: "10px", fontFamily: "monospace" }}>
        <p style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>📁 competitor/src/</p>
        {fileSet.map((f, i) => (
          <button key={f} onClick={() => { setChosen(i); submit(i); }} disabled={submitted}
            style={{ display: "block", width: "100%", padding: "6px 10px", background: chosen === i ? "#1a0a2a" : "transparent", border: "none", borderRadius: 5, color: chosen === i ? "#a78bfa" : "#555", fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: "monospace", marginBottom: 2 }}>
            📄 {f}
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function AutomateActivity({ onComplete, difficulty }) {
  const timer = getTimer(20, difficulty);
  const shuffled = useRef([...AUTOMATE_OPTIONS].sort(() => Math.random() - 0.5).slice(0, 4)).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(opt, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !opt) {
      setResult({ good: false, reason: "You didn't pick a process to automate.", lesson: "Failing to automate wastes founder time.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setResult({
      good: opt.good,
      reason: opt.good
        ? `${opt.label.replace(/^[^\s]+\s/, "")} is mechanical and repeatable — ideal automation candidate.`
        : `${opt.risk} — automating this too early creates problems you can't easily fix.`,
      lesson: opt.lesson,
      statChange: opt.good ? "+$-2,000 · +10% morale (passive gains unlocked)" : "-$2,000 · -10% morale · -100 users",
    });
    sounds[opt.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(opt.good ? { money: -2000, morale: 10 } : { money: -2000, morale: -10, users: -100 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🤖 Automate Process (COO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#a78bfa" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>Pick the right process to automate. Not everything should be.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {shuffled.map((p, i) => (
          <button key={p.id} onClick={() => { setChosen(i); submit(p); }} disabled={submitted}
            style={{ padding: "10px 12px", background: chosen === i ? "#222" : "#111", border: `0.5px solid ${chosen === i ? "#444" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <p style={{ fontSize: 13, color: chosen === i ? "#fff" : "#aaa", marginBottom: 3 }}>{p.label}</p>
            <p style={{ fontSize: 10, color: "#555" }}>{p.risk}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function SystemsAuditActivity({ onComplete, difficulty }) {
  const timer = getTimer(25, difficulty);
  const suspects = ["CEO","CFO","CMO","CTO","COO","Head of Sales","Community Manager"];
  const guilty = useRef(suspects[Math.floor(Math.random() * suspects.length)]).current;
  const CLUE_SETS = [
    [`Money went missing during a ${guilty} action`, `Morale dropped with no public event`, `A press leak contained info only the ${guilty} knew`],
    [`Competitors knew our pricing before announcement — ${guilty} had access`, `Three anonymous morale drains happened during ${guilty}'s active window`, `The audit log shows unusual ${guilty} activity at 3am`],
    [`The ${guilty}'s device was the last to access the confidential folder`, `Cash withdrawals spike when ${guilty} is online`, `Two teammates noticed ${guilty} acting strangely before bad events`],
  ];
  const clues = useRef(CLUE_SETS[Math.floor(Math.random() * CLUE_SETS.length)]).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(pick, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !pick) {
      setResult({ good: false, reason: "You ran out of time without making an accusation.", lesson: "Failing to use your one audit wastes your most powerful tool.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const good = pick === guilty;
    setResult({
      good,
      reason: good
        ? `Correct — all three clues pointed to the ${guilty}. Good pattern recognition.`
        : `Wrong. The ${guilty} was responsible. Re-read the clues — they all pointed there.`,
      lesson: good
        ? `The ${guilty} was the Saboteur. Audit spent — use it wisely next time.`
        : `Actual Saboteur was the ${guilty}. The clues pointed there but you missed them.`,
      statChange: good ? "+20% morale" : "-10% morale",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { morale: 20 } : { morale: -10 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🔍 Systems Audit (COO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#a78bfa" />
      </div>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 10 }}>⚠️ One use only. Study the clues and accuse.</p>
      <div style={{ background: "#1a1500", border: "1px solid #facc1530", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: "#facc15", marginBottom: 8 }}>🔎 Evidence</p>
        {clues.map((c, i) => <p key={i} style={{ fontSize: 12, color: "#aaa", marginBottom: 6, lineHeight: 1.4 }}>→ {c}</p>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {suspects.map(s => (
          <button key={s} onClick={() => { setChosen(s); submit(s); }} disabled={submitted}
            style={{ padding: "9px", background: chosen === s ? "#2a1a0a" : "#111", border: `0.5px solid ${chosen === s ? "#fb923c" : "#222"}`, borderRadius: 8, color: chosen === s ? "#fb923c" : "#888", fontSize: 11, cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function HireNPCActivity({ onComplete, difficulty }) {
  const timer = getTimer(25, difficulty);
  const set = useRef(HIRE_SETS[Math.floor(Math.random() * HIRE_SETS.length)]).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(profile, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !profile) {
      setResult({ good: false, reason: "You didn't make a hire decision in time.", lesson: "Indecision is a decision. Failing to hire when you need to costs growth.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setResult({
      good: profile.best,
      reason: profile.best
        ? `${profile.name} is the right fit — skills match your current stage and their weakness (${profile.weakness.toLowerCase()}) isn't a blocker right now.`
        : `${profile.name} is wrong for your stage. Their weakness — ${profile.weakness.toLowerCase()} — is a real problem right now.`,
      lesson: profile.best
        ? `Great hire. ${profile.name} is the best fit for your stage. Hire for current needs, not prestige.`
        : `Wrong hire. Not the right fit right now. Always hire for your current stage.`,
      statChange: profile.best ? `+15% morale · +100 users · -$${profile.salary.toLocaleString()}/mo` : `-5% morale · -$${profile.salary.toLocaleString()}/mo`,
    });
    sounds[profile.best ? "success" : "fail"]?.();
    setTimeout(() => onComplete(profile.best ? { money: -profile.salary, morale: 15, users: 100 } : { money: -profile.salary, morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>📋 Hire NPC (COO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#a78bfa" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>Pick the best hire for your current stage.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {set.map((p, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(p); }} disabled={submitted}
            style={{ padding: "10px 12px", background: chosen === i ? "#222" : "#111", border: `0.5px solid ${chosen === i ? "#444" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: chosen === i ? "#fff" : "#aaa" }}>{p.name}</p>
              <p style={{ fontSize: 11, color: "#ff4444" }}>${p.salary.toLocaleString()}/mo</p>
            </div>
            <p style={{ fontSize: 11, color: "#60a5fa", marginBottom: 2 }}>{p.skills}</p>
            <p style={{ fontSize: 10, color: "#555" }}>⚠️ {p.weakness}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function ColdCallActivity({ onComplete, difficulty }) {
  const timer = getTimer(12, difficulty);
  const prospect = useRef(PROSPECT_PROFILES[Math.floor(Math.random() * PROSPECT_PROFILES.length)]).current;
  const angles = ["save time","save money","scale fast","stand out","look cool","reduce risk"];
  const [phase, setPhase] = useState("ringing");
  const [angle, setAngle] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => { if (!submitted) finalize(); }, !submitted);

  useEffect(() => { const t = setTimeout(() => setPhase("pitching"), 1500); return () => clearTimeout(t); }, []);

  function finalize() {
    if (submitted) return;
    setSubmitted(true);
    const good = angle === prospect.good_angle;
    const badAngle = prospect.bad_angles?.includes(angle);
    const statChange = good ? "+$3,000 · +50 users" : badAngle ? "-5% morale · -$500 (angry review)" : "+$500";
    setResult({
      good,
      reason: good
        ? `Perfect read on ${prospect.name} — "${angle}" is exactly what a ${prospect.mood} ${prospect.company} needs to hear.`
        : badAngle
        ? `"${angle}" is on ${prospect.name}'s dealbreaker list. They're ${prospect.mood} and that angle made it worse.`
        : `"${angle}" is okay but ${prospect.name} wanted to hear "${prospect.good_angle}" — you left money on the table.`,
      lesson: good
        ? `Perfect read. ${prospect.name} needed "${angle}" — nailed it. Reading prospect mood is core sales.`
        : badAngle
        ? `Bad angle. ${prospect.name} was ${prospect.mood} — "${angle}" made it worse.`
        : `Decent but not optimal. ${prospect.name} wanted "${prospect.good_angle}".`,
      statChange,
    });
    sounds[good ? "cash" : "fail"]?.();
    setTimeout(() => onComplete(good ? { money: 3000, users: 50 } : badAngle ? { morale: -5, money: -500 } : { money: 500 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>📞 Cold Call (Sales)</p>
        {phase === "pitching" && <TimerRing seconds={timeLeft} total={timer} color="#fb923c" />}
      </div>
      {phase === "ringing" ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
          <p style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{prospect.name}</p>
          <p style={{ fontSize: 11, color: "#888" }}>{prospect.company}</p>
          <p style={{ fontSize: 11, color: "#facc15", marginTop: 4 }}>Calling...</p>
        </div>
      ) : (
        <>
          <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📱</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{prospect.name} answered</p>
                <p style={{ fontSize: 11, color: "#888" }}>{prospect.company} · {prospect.mood}</p>
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#facc15", fontStyle: "italic" }}>Tip: {prospect.tip}</p>
          </div>
          <p style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Lead with:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {angles.map(a => (
              <button key={a} onClick={() => { setAngle(a); setTimeout(finalize, 50); }} disabled={submitted}
                style={{ padding: "9px", background: angle === a ? "#fb923c20" : "#111", border: `0.5px solid ${angle === a ? "#fb923c" : "#222"}`, borderRadius: 8, color: angle === a ? "#fb923c" : "#888", fontSize: 12, cursor: "pointer" }}>
                {a}
              </button>
            ))}
          </div>
        </>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function FlashSaleActivity({ onComplete, difficulty }) {
  const timer = getTimer(20, difficulty);
  const [discount, setDiscount] = useState(20);
  const [duration, setDuration] = useState(2);
  const [tone, setTone] = useState(null);
  const tones = ["🚨 Urgent","😎 Casual","💎 Exclusive","🎉 Celebratory"];
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);
  const revenueSpike = Math.round(discount * 200);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !tone) {
      setResult({ good: false, reason: "No tone selected — campaign launched with no strategy.", lesson: "A flash sale with no strategy is just giving money away.", statChange: "-$500" });
      setTimeout(() => onComplete({ money: -500 }), 3500); return;
    }
    const good = discount <= 35 && duration <= 3;
    setResult({
      good,
      reason: good
        ? `${discount}% for ${duration} day${duration > 1 ? "s" : ""} — deep enough to convert, short enough to feel urgent.`
        : discount > 50
        ? `${discount}% is too deep. Users will now wait for the next sale instead of paying full price.`
        : `${duration} days is too long. A week-long sale has no urgency — it's just a regular sale.`,
      lesson: good
        ? `Smart sale. Converts without training users to wait for discounts.`
        : discount > 50
        ? "Too deep. Users will wait for the next sale instead of paying full price."
        : "Too long. Flash sales work because of urgency. A week-long sale is just a regular sale.",
      statChange: good ? `+$${revenueSpike} · -50 users` : `+$${Math.round(revenueSpike*0.4)} · -200 users`,
    });
    sounds[good ? "cash" : "fail"]?.();
    setTimeout(() => onComplete(good ? { money: revenueSpike, users: -50 } : { money: Math.round(revenueSpike*0.4), users: -200 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🎁 Flash Sale (Sales)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#fb923c" />
      </div>
      {[
        { label: "Discount", value: discount, set: setDiscount, min: 5, max: 80, step: 5, format: v => `${v}%`, warn: discount > 40 },
        { label: "Duration", value: duration, set: setDuration, min: 1, max: 7, step: 1, format: v => `${v} day${v>1?"s":""}`, warn: duration > 3 },
      ].map(({ label, value, set, min, max, step, format, warn }) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <p style={{ fontSize: 11, color: "#888" }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: warn ? "#ff4444" : "#fff" }}>{format(value)}</p>
          </div>
          <input type="range" min={min} max={max} step={step} value={value} onChange={e => !submitted && set(Number(e.target.value))} style={{ width: "100%" }} />
          {warn && <p style={{ fontSize: 9, color: "#ff4444", marginTop: 2 }}>⚠️ Risk of price anchoring damage</p>}
        </div>
      ))}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>Sale tone</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tones.map(t => <button key={t} onClick={() => !submitted && setTone(t)} style={{ flex: 1, padding: "7px", background: tone === t ? "#fb923c20" : "#111", border: `0.5px solid ${tone === t ? "#fb923c" : "#222"}`, borderRadius: 8, color: tone === t ? "#fb923c" : "#888", fontSize: 11, cursor: "pointer" }}>{t}</button>)}
        </div>
      </div>
      <div style={{ background: "#111", borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
        <p style={{ fontSize: 11, color: "#555" }}>Est. revenue spike</p>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>+${revenueSpike.toLocaleString()}</p>
      </div>
      {!submitted && <button onClick={() => submit(false)} style={{ width: "100%", padding: "10px", background: "#fb923c", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Launch Sale →</button>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function HostAMAActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(35, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const QUESTION_SETS = [
    [
      { q: "Why is your product so expensive?", hard: true, hint: "Be transparent about value" },
      { q: "What's your favorite thing about building this?", hard: false, hint: "Personal story works well" },
      { q: "Are you planning layoffs?", hard: true, hint: "Honesty without speculation" },
    ],
    [
      { q: "Are you profitable yet?", hard: true, hint: "Honest about stage and path" },
      { q: "How do you handle negative feedback?", hard: false, hint: "Specific process with examples" },
      { q: "Why should I trust this company with my data?", hard: true, hint: "Specific privacy measures" },
    ],
    [
      { q: "What's the biggest mistake you've made?", hard: false, hint: "Vulnerability builds trust" },
      { q: "Why is your growth slower than competitors?", hard: true, hint: "Own it, explain your strategy" },
      { q: "Will you ever go public?", hard: false, hint: "Honest future thinking" },
    ],
  ];
  const qSet = useRef(QUESTION_SETS[Math.floor(Math.random() * QUESTION_SETS.length)]).current;
  const [chosen, setChosen] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  async function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || chosen === null || !answer.trim()) {
      setResult({ good: false, reason: "You didn't answer a question before time ran out.", lesson: "Not answering destroys trust. Pick the hard ones.", statChange: "-10% morale" });
      setTimeout(() => onComplete({ morale: -10 }), 3500); return;
    }
    setLoading(true);
    const q = qSet[chosen];
    const prompt = `Grade this AMA answer for a ${profile.name} startup CEO.
Question: "${q.q}"
Answer: "${answer}"
Scenario type: ${profile.type}
Hint for good answer: ${q.hint}

Is the answer honest? Specific? Appropriately long (15-60 words ideal)? Does it build trust? Does it match the scenario type?`;
    const grade = await gradeWithAI(prompt);
    setLoading(false);
    setResult({ good: grade.good, reason: grade.reason, lesson: grade.lesson, statChange: grade.statChange });
    sounds[grade.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(grade.good ? { users: 200, morale: 15, money: -500 } : { morale: -10, money: -500 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🎉 Host AMA</p>
        <TimerRing seconds={timeLeft} total={timer} color="#2dd4bf" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Pick one question to answer publicly.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {qSet.map((q, i) => (
          <button key={i} onClick={() => !submitted && setChosen(i)}
            style={{ padding: "9px 12px", background: chosen === i ? "#222" : "#111", border: `0.5px solid ${chosen === i ? "#2dd4bf" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <p style={{ fontSize: 12, color: chosen === i ? "#fff" : "#888" }}>{q.q}</p>
            {q.hard && <p style={{ fontSize: 9, color: "#ff4444", marginTop: 2 }}>⚠️ Tough question — but builds more trust if answered well</p>}
          </button>
        ))}
      </div>
      {chosen !== null && (
        <>
          <p style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>💡 Hint: {qSet[chosen].hint}</p>
          <textarea value={answer} onChange={e => !submitted && setAnswer(e.target.value)} placeholder="Your public response..." rows={3}
            style={{ width: "100%", padding: "10px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 6 }} />
          <p style={{ fontSize: 9, color: "#444", marginBottom: 8 }}>{answer.trim().split(" ").filter(Boolean).length} words</p>
        </>
      )}
      {!submitted && <button onClick={() => submit(false)} disabled={loading} style={{ width: "100%", padding: "10px", background: "#2dd4bf", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Answer Publicly →</button>}
      {loading && <p style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }}>AI reviewing your answer...</p>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function TownHallActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(30, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const CEO_MOTIONS = [
    "The CEO wants to cut salaries by 20% to extend runway",
    "The CEO wants to pivot the entire product to enterprise",
    "The CEO wants to fire the community manager to save costs",
    "The CEO wants to take a $500k investment at 40% equity",
    "The CEO wants to move the whole team to a new city",
    "The CEO wants to launch in 3 new markets simultaneously",
    "The CEO wants to cancel the roadmap and rebuild from scratch",
  ];
  const ceoMotion = useRef(CEO_MOTIONS[Math.floor(Math.random() * CEO_MOTIONS.length)]).current;
  const [motion, setMotion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  async function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !motion.trim()) {
      setResult({ good: false, reason: "No counter-motion submitted before time ran out.", lesson: "A Town Hall with no counter-motion is just complaining. Always come prepared with a specific alternative.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setLoading(true);
    const prompt = `Grade this counter-motion in a startup Town Hall.
CEO's motion: "${ceoMotion}"
Counter-motion proposed: "${motion}"
Company context: ${profile.name} (${profile.type})

Does the counter-motion make logical business sense as an alternative? Is it specific enough to be actionable? Does it address the CEO's underlying concern while offering a better path?`;
    const grade = await gradeWithAI(prompt);
    setLoading(false);

    setVoting(true);
    const passChance = grade.score > 60 ? 0.75 : grade.score > 40 ? 0.50 : 0.25;
    let y = 0, n = 0;
    const interval = setInterval(() => {
      if (Math.random() < passChance) y++; else n++;
      setVotes({ yes: y, no: n });
      if (y + n >= 5) {
        clearInterval(interval);
        const passed = y > n;
        setResult({
          good: passed,
          reason: grade.reason || (passed ? "Your counter-motion carried the room." : "The team wasn't convinced."),
          lesson: passed
            ? grade.lesson || "A well-reasoned counter carries the room."
            : grade.lesson || "The team wasn't convinced by your alternative.",
          statChange: passed ? "+20% morale" : "-5% morale",
        });
        sounds[passed ? "success" : "fail"]?.();
        setTimeout(() => onComplete(passed ? { morale: 20 } : { morale: -5 }), 3500);
      }
    }, 500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🗳️ Town Hall (Community)</p>
        {!voting && <TimerRing seconds={timeLeft} total={timer} color="#2dd4bf" />}
      </div>
      <div style={{ background: "#1a0808", border: "1px solid #ff444430", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: "#ff4444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>⚠️ CEO's motion</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{ceoMotion}</p>
        <p style={{ fontSize: 10, color: "#555", marginTop: 4 }}>You disagree. Write a counter-motion to overrule them.</p>
      </div>
      {!voting ? (
        <>
          {!loading && (
            <>
              <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Your counter-motion — be specific and logical:</p>
              <textarea value={motion} onChange={e => setMotion(e.target.value)}
                placeholder="Instead, I propose that the company should..." rows={3}
                style={{ width: "100%", padding: "10px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 10 }} />
              <button onClick={() => submit(false)}
                style={{ width: "100%", padding: "10px", background: "#2dd4bf", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Call the Vote →
              </button>
            </>
          )}
          {loading && <p style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }}>AI evaluating your motion...</p>}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Counter: "{motion}"</p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 14 }}>
            <div><p style={{ fontSize: 32, fontWeight: 700, color: "#4ade80" }}>{votes.yes}</p><p style={{ fontSize: 11, color: "#555" }}>Yes</p></div>
            <div><p style={{ fontSize: 32, fontWeight: 700, color: "#ff4444" }}>{votes.no}</p><p style={{ fontSize: 11, color: "#555" }}>No</p></div>
          </div>
          {!result && <p style={{ fontSize: 11, color: "#555" }}>Votes coming in...</p>}
        </div>
      )}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function PersonalizedOutreachActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(30, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const USERS = [
    { name: "Alex", persona: "Power user, uses the app daily, gave 5 stars", want: "recognition and early access" },
    { name: "Mia", persona: "Churned 2 weeks ago after a bug, was loyal", want: "acknowledgment and a fix update" },
    { name: "Carlos", persona: "Free user, heavy usage, never converted", want: "a personal reason to pay" },
    { name: "Fatima", persona: "Left a 3-star review mentioning slow support", want: "to feel heard and valued" },
    { name: "Jordan", persona: "Enterprise prospect, viewed pricing page 5 times", want: "a specific ROI case study" },
  ];
  const user = useRef(USERS[Math.floor(Math.random() * USERS.length)]).current;
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  async function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !message.trim()) {
      setResult({ good: false, reason: "No message written — you missed the outreach window.", lesson: "Even one sentence beats silence in personalized outreach.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setLoading(true);
    const prompt = `Grade this personalized outreach message for a ${profile.name} startup.
Recipient: ${user.name} — ${user.persona}
They want: ${user.want}
Message written: "${message}"

Does the message use their name? Does it address their specific situation? Is it the right length (15-80 words)? Does it feel personal or like a template? Does it speak to what they actually want?`;
    const grade = await gradeWithAI(prompt);
    setLoading(false);
    setResult({ good: grade.good, reason: grade.reason, lesson: grade.lesson, statChange: grade.statChange });
    sounds[grade.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(grade.good ? { users: 100, morale: 10 } : { users: 10 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>💌 Personalized Outreach</p>
        <TimerRing seconds={timeLeft} total={timer} color="#2dd4bf" />
      </div>
      <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#60a5fa", marginBottom: 4 }}>User profile</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{user.name}</p>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{user.persona}</p>
        <p style={{ fontSize: 10, color: "#facc15" }}>💡 They want: {user.want}</p>
      </div>
      <textarea value={message} onChange={e => !submitted && setMessage(e.target.value)} placeholder={`Hi ${user.name},`} rows={4}
        style={{ width: "100%", padding: "10px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 6 }} />
      <p style={{ fontSize: 9, color: "#444", marginBottom: 8 }}>{message.trim().split(" ").filter(Boolean).length} words</p>
      {!submitted && <button onClick={() => submit(false)} disabled={loading} style={{ width: "100%", padding: "10px", background: "#2dd4bf", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Send Message →</button>}
      {loading && <p style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }}>AI reviewing your message...</p>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function AllHandsActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(20, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const BAD_PHRASES = ["synergy","leverage","pivot","crush it","we're a family","blockchain","disrupt","hustle harder","move fast","10x"];
  const [speech, setSpeech] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  async function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !speech.trim()) {
      setResult({ good: false, reason: "No speech delivered — the team sat in silence.", lesson: "A CEO who skips the all-hands loses trust. Even a short authentic message beats silence.", statChange: "-10% morale" });
      setTimeout(() => onComplete({ morale: -10 }), 3500); return;
    }
    const foundBuzzword = BAD_PHRASES.find(b => speech.toLowerCase().includes(b));
    if (foundBuzzword) {
      setResult({ good: false, reason: `"${foundBuzzword}" — your team groaned. Corporate buzzwords kill authenticity instantly.`, lesson: "Be specific and human. Buzzword bingo is the fastest way to lose the room.", statChange: "-5% morale" });
      sounds.fail?.();
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setLoading(true);
    const prompt = `Grade this all-hands speech for a ${profile.name} startup (${profile.type}).
Speech: "${speech}"
Context: ${profile.tone}

Is it authentic? Specific? Appropriately concise (5-30 words ideal)? Does it match the tone of this type of company? Does it actually motivate?`;
    const grade = await gradeWithAI(prompt);
    setLoading(false);
    setResult({ good: grade.good, reason: grade.reason, lesson: grade.lesson, statChange: grade.statChange });
    sounds[grade.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(grade.good ? { morale: 15 } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🎯 All-Hands (CEO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#60a5fa" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Write your motivational speech (5-30 words). No buzzwords. Be real.</p>
      <div style={{ background: "#111", border: "0.5px solid #222", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
        <p style={{ fontSize: 9, color: "#333" }}>Avoid: {BAD_PHRASES.slice(0,5).join(", ")}...</p>
      </div>
      <textarea value={speech} onChange={e => !submitted && setSpeech(e.target.value)} placeholder="Team, I want to say..." rows={3}
        style={{ width: "100%", padding: "10px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 6 }} />
      <p style={{ fontSize: 9, color: "#444", marginBottom: 8 }}>{speech.trim().split(" ").filter(Boolean).length} words</p>
      {!submitted && <button onClick={() => submit(false)} disabled={loading} style={{ width: "100%", padding: "10px", background: "#60a5fa", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Address the Team →</button>}
      {loading && <p style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }}>AI grading your speech...</p>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function FireActivity({ onComplete, difficulty }) {
  const timer = getTimer(20, difficulty);
  const set = useRef(FIRE_SETS[Math.floor(Math.random() * FIRE_SETS.length)]).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(emp, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !emp) {
      setResult({ good: false, reason: "You didn't make a decision in time — everyone stays and costs keep burning.", lesson: "Failing to make hard calls is still a call — you kept everyone and burned cash.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const safe = emp.cost_to_fire === "safe to fire";
    setResult({
      good: safe,
      reason: safe
        ? `${emp.name} was the right cut — ${emp.cost_to_fire}. No hidden value lost.`
        : `Wrong call. ${emp.name}'s hidden value: ${emp.hidden}. You didn't dig deep enough before firing.`,
      lesson: safe
        ? `Right call. ${emp.name} was the weakest fit. Letting go of the right person keeps the team strong.`
        : `Wrong call. ${emp.name}'s hidden value: ${emp.hidden}. Always dig deeper before firing.`,
      statChange: safe
        ? `+$${emp.salary.toLocaleString()}/mo saved · +5% morale`
        : `+$${emp.salary.toLocaleString()}/mo saved · -20% morale · -200 users`,
    });
    sounds[safe ? "success" : "fail"]?.();
    setTimeout(() => onComplete(safe ? { money: emp.salary, morale: 5 } : { money: emp.salary, morale: -20, users: -200 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🔥 Fire Someone (CEO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#60a5fa" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>One person needs to go. Someone has hidden value — read carefully.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {set.map((emp, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(emp); }} disabled={submitted}
            style={{ padding: "10px 12px", background: chosen === i ? "#1a0808" : "#111", border: `0.5px solid ${chosen === i ? "#ff4444" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: chosen === i ? "#ff8888" : "#aaa" }}>{emp.name} — {emp.role}</p>
              <p style={{ fontSize: 11, color: "#ff4444" }}>-${emp.salary.toLocaleString()}/mo</p>
            </div>
            <p style={{ fontSize: 11, color: "#666" }}>{emp.stats}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function PivotActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(35, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const [direction, setDirection] = useState("");
  const [market, setMarket] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  async function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !direction.trim() || !market) {
      setResult({ good: false, reason: "No pivot direction or market selected in time.", lesson: "A pivot with no direction isn't a pivot — it's panic.", statChange: "-10% morale" });
      setTimeout(() => onComplete({ morale: -10 }), 3500); return;
    }
    setLoading(true);
    const prompt = `Grade this startup pivot for ${profile.name} (${profile.type}).
Current business: ${profile.name}
New direction: "${direction}"
New market: ${market}

Does the pivot make logical business sense given what they already have? Are they keeping their strengths? Does the new market make sense? Is the explanation clear and specific (8-40 words ideal)?`;
    const grade = await gradeWithAI(prompt);
    setLoading(false);
    setResult({ good: grade.good, reason: grade.reason, lesson: grade.lesson, statChange: grade.statChange });
    sounds[grade.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(grade.good ? { morale: 10, users: 300 } : { morale: -10 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🔄 Pivot (CEO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#60a5fa" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>New direction (8-40 words)</p>
        <textarea value={direction} onChange={e => !submitted && setDirection(e.target.value)} placeholder="We're pivoting from X to Y because..." rows={3}
          style={{ width: "100%", padding: "10px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box" }} />
        <p style={{ fontSize: 9, color: "#444", marginTop: 3 }}>{direction.trim().split(" ").filter(Boolean).length} words</p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>New target market</p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {PIVOT_MARKETS.map(m => <button key={m} onClick={() => !submitted && setMarket(m)} style={{ padding: "4px 10px", background: market === m ? "#60a5fa20" : "#111", border: `0.5px solid ${market === m ? "#60a5fa" : "#222"}`, borderRadius: 20, color: market === m ? "#60a5fa" : "#888", fontSize: 11, cursor: "pointer" }}>{m}</button>)}
        </div>
      </div>
      {!submitted && <button onClick={() => submit(false)} disabled={loading} style={{ width: "100%", padding: "10px", background: "#60a5fa", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Commit to Pivot →</button>}
      {loading && <p style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }}>AI evaluating your pivot...</p>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function EmbezzleActivity({ onComplete, difficulty }) {
  const timer = getTimer(12, difficulty);
  const logSet = useRef(TRANSACTION_LOGS[Math.floor(Math.random() * TRANSACTION_LOGS.length)]).current;
  const [alertLevel, setAlertLevel] = useState(0);
  const [clicks, setClicks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const alertRef = useRef(0);
  const submittedRef = useRef(false);
  const timeLeft = useCountdown(timer, () => { if (!submittedRef.current) submit(true); }, !submitted);

  function click(i, t) {
    if (submitted || clicks.includes(i)) return;
    if (t.suspicious) {
      sounds.action?.();
      const newClicks = [...clicks, i];
      setClicks(newClicks);
      if (newClicks.length >= 2) submit(false, true);
    } else {
      const newAlert = Math.min(100, alertRef.current + 35);
      alertRef.current = newAlert;
      setAlertLevel(newAlert);
      if (newAlert >= 100) submit(false, false, true);
    }
  }

  function submit(timedOut = false, success = false, caught = false) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    if (caught) {
      setResult({ good: false, reason: "You clicked too many legitimate transactions — fraud alert triggered.", lesson: "Real embezzlement is detected through behavioral pattern analysis.", statChange: "-15% morale" });
      setTimeout(() => onComplete({ morale: -15 }), 3500); return;
    }
    if (success) {
      setResult({ good: true, reason: "You targeted the right transactions without triggering the alert.", lesson: "Consistent small amounts are harder to detect than large one-off transfers.", statChange: "+$500 (stolen)" });
      sounds.action?.();
      setTimeout(() => onComplete({ money: 500 }), 3500); return;
    }
    setResult({ good: false, reason: "Too slow — the window closed before you redirected enough.", lesson: "The window closed.", statChange: "-5% morale" });
    setTimeout(() => onComplete({ morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🕳️ Embezzle (Saboteur)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#ff4444" />
      </div>
      <p style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Click suspicious transactions to redirect. Wrong clicks trigger fraud alert!</p>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <p style={{ fontSize: 10, color: "#ff4444" }}>Fraud Alert</p>
          <p style={{ fontSize: 10, color: alertLevel > 60 ? "#ff4444" : "#555" }}>{alertLevel}%</p>
        </div>
        <div style={{ background: "#1a0808", borderRadius: 3, height: 5 }}>
          <div style={{ background: "#ff4444", width: `${alertLevel}%`, height: "100%", borderRadius: 3, transition: "width 0.3s" }} />
        </div>
      </div>
      <div style={{ background: "#0a1a0a", border: "0.5px solid #1a3a1a", borderRadius: 10, overflow: "hidden" }}>
        {logSet.map((t, i) => (
          <button key={i} onClick={() => click(i, t)}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", padding: "8px 12px", background: clicks.includes(i) ? "#0a2a0a" : "transparent", border: "none", borderBottom: "0.5px solid #0f1f0f", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 11, color: clicks.includes(i) ? "#4ade80" : "#888" }}>{t.desc}</span>
            <span style={{ fontSize: 11, color: t.amount > 0 ? "#4ade80" : "#ff8888", fontFamily: "monospace" }}>
              {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}
            </span>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function LeakToPressActivity({ onComplete, difficulty }) {
  const timer = getTimer(25, difficulty);
  const [tip, setTip] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(true), !submitted);

  function submit(timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !tip.trim()) {
      setResult({ good: false, reason: "No tip submitted before time ran out.", lesson: "A leak with no substance does nothing.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const wc = tip.trim().split(" ").filter(Boolean).length;
    const tooSpecific = wc > 20;
    const tooVague = wc < 5;
    const good = !tooSpecific && !tooVague;
    setResult({
      good,
      reason: good
        ? `${wc} words — specific enough to be credible, vague enough to protect your identity.`
        : tooSpecific
        ? `${wc} words is too specific — the team can trace this back to you. You're the only one with that detail.`
        : `${wc} words is too vague — the journalist won't run with it.`,
      lesson: good
        ? "Perfect leak. Specific enough to be credible, vague enough to hide your identity."
        : tooSpecific
        ? "Too specific — the team can trace this back to you. Only you had that detail."
        : "Too vague. The journalist won't run with this.",
      statChange: good ? "-10% team morale (mission success)" : "-3% morale",
    });
    sounds[good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(good ? { morale: -10 } : { morale: -3 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>📰 Leak to Press (Saboteur)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#ff4444" />
      </div>
      <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "12px", marginBottom: 10 }}>
        <p style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>Anonymous tip to journalist</p>
        <p style={{ fontSize: 10, color: "#facc15" }}>⚠️ 5-20 words. Too specific = traceable. Too vague = ignored.</p>
      </div>
      <textarea value={tip} onChange={e => !submitted && setTip(e.target.value)} placeholder="Sources close to the company say..." rows={3} maxLength={200}
        style={{ width: "100%", padding: "10px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 6 }} />
      <p style={{ fontSize: 9, color: tip.trim().split(" ").filter(Boolean).length > 20 ? "#ff4444" : "#444", marginBottom: 8 }}>
        {tip.trim().split(" ").filter(Boolean).length} words {tip.trim().split(" ").filter(Boolean).length > 20 ? "— too specific!" : ""}
      </p>
      {!submitted && <button onClick={() => submit(false)} style={{ width: "100%", padding: "10px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Send Anonymously →</button>}
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function ProductUpdateActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(15, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const FEATURE_SETS = [
    [
      { label: "🌙 Dark mode", tradeoff: "+users, minimal dev time", good: true },
      { label: "🤖 Unproven AI feature", tradeoff: "expensive, risky, unvalidated", good: false },
      { label: "⚡ Faster load times", tradeoff: "+retention, requires refactor", good: true },
    ],
    [
      { label: "📊 Analytics dashboard", tradeoff: "+enterprise appeal, 2 week build", good: true },
      { label: "🎮 Gamification layer", tradeoff: "distracts from core value", good: false },
      { label: "🔔 Push notifications", tradeoff: "+retention if done right", good: true },
    ],
    [
      { label: "🌍 Multi-language (15 languages)", tradeoff: "huge effort, low ROI at current scale", good: false },
      { label: "🔗 API integrations (Slack, Zapier)", tradeoff: "+power users, enterprise sales", good: true },
      { label: "📱 Full mobile app rebuild", tradeoff: "huge investment, not validated yet", good: false },
    ],
    [
      { label: "💬 In-app chat support", tradeoff: "+retention, reduces churn", good: true },
      { label: "🎨 Complete UI redesign", tradeoff: "breaks muscle memory, risky", good: false },
      { label: "📧 Email digest feature", tradeoff: "+engagement, low effort", good: true },
    ],
  ];
  const set = useRef(FEATURE_SETS[Math.floor(Math.random() * FEATURE_SETS.length)]).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(feature, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !feature) {
      setResult({ good: false, reason: "No feature shipped — you shipped nothing and fell behind.", lesson: "Shipping nothing is falling behind. Inaction is the most expensive choice.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setResult({
      good: feature.good,
      reason: feature.good
        ? `${feature.label} is the right call — clear value, manageable scope, moves your core metric.`
        : `${feature.label} is wrong for your stage: ${feature.tradeoff}.`,
      lesson: feature.good
        ? `Good pick for ${profile.name}. Ship what moves your core metric.`
        : `Wrong for your stage. Always ask: does this move our growth constraint right now?`,
      statChange: feature.good ? "+100 users · +8% morale" : "-5% morale · -$1,000",
    });
    sounds[feature.good ? "success" : "fail"]?.();
    setTimeout(() => onComplete(feature.good ? { users: 100, morale: 8 } : { morale: -5, money: -1000 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>📦 Product Update</p>
        <TimerRing seconds={timeLeft} total={timer} color="#60a5fa" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>Pick the right feature to ship for {profile.name}. One right answer.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {set.map((f, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(f); }} disabled={submitted}
            style={{ padding: "10px 12px", background: chosen === i ? "#222" : "#111", border: `0.5px solid ${chosen === i ? "#60a5fa" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <p style={{ fontSize: 13, color: chosen === i ? "#fff" : "#aaa", marginBottom: 3 }}>{f.label}</p>
            <p style={{ fontSize: 10, color: "#555" }}>{f.tradeoff}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function CloseDealtActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(20, difficulty);
  const DEALS = [
    { company: "Mid-size retailer", budget: "$5k/year", objection: "We already have a solution", size: "small" },
    { company: "Regional hospital chain", budget: "$40k/year", objection: "We need security compliance first", size: "large" },
    { company: "Tech startup", budget: "$15k/year", objection: "Your pricing is too high", size: "medium" },
    { company: "University system", budget: "$25k/year", objection: "We need board approval first", size: "medium" },
    { company: "Fortune 500 company", budget: "$200k/year", objection: "We have 6 other vendors to evaluate", size: "enterprise" },
  ];
  const deal = useRef(DEALS[Math.floor(Math.random() * DEALS.length)]).current;
  const RESPONSES = [
    { text: "I understand. Let me show you our ROI data from similar companies.", good: true },
    { text: "We can offer a 30-day pilot at no cost to prove the value.", good: true },
    { text: "That's fine, we'll just go with your competitor then.", good: false },
    { text: "Everyone says that — you'll love it once you try it.", good: false },
    { text: "What would it take to move forward today?", good: true },
    { text: "Our other clients said the same thing before they switched.", good: true },
  ];
  const shuffled = useRef([...RESPONSES].sort(() => Math.random() - 0.5).slice(0, 4)).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(response, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !response) {
      setResult({ good: false, reason: "You didn't respond to the objection in time — the prospect moved on.", lesson: "Silence kills deals. Always have a response to objections.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const revenue = deal.size === "enterprise" ? 8000 : deal.size === "large" ? 5000 : deal.size === "medium" ? 3000 : 1500;
    setResult({
      good: response.good,
      reason: response.good
        ? `"${response.text}" — addresses the objection directly without being pushy. That's what closes deals.`
        : `"${response.text}" — reads as dismissive or desperate. That pushes buyers away.`,
      lesson: response.good
        ? `Deal closed with ${deal.company}! Objection handling requires empathy first, solution second.`
        : `Lost the deal. Objection handling requires empathy first, solution second.`,
      statChange: response.good ? `+$${revenue.toLocaleString()}` : "-5% morale",
    });
    sounds[response.good ? "cash" : "fail"]?.();
    setTimeout(() => onComplete(response.good ? { money: revenue } : { morale: -5 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🤝 Close Deal (CEO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#60a5fa" />
      </div>
      <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: "#60a5fa", marginBottom: 4 }}>Prospect: {deal.company}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Budget: {deal.budget}</p>
        <p style={{ fontSize: 11, color: "#ff8888" }}>Objection: "{deal.objection}"</p>
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>How do you respond?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {shuffled.map((r, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(r); }} disabled={submitted}
            style={{ padding: "9px 12px", background: chosen === i ? "#222" : "#111", border: "0.5px solid #2a2a2a", borderRadius: 8, color: "#ccc", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
            "{r.text}"
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function CostCuttingActivity({ onComplete, difficulty }) {
  const timer = getTimer(15, difficulty);
  const CUTS = [
    { label: "Cancel unused SaaS subscriptions", savings: 800, risk: "Low — nobody will notice", good: true },
    { label: "Cut the office coffee budget", savings: 200, risk: "Medium — team morale impact", good: false },
    { label: "Renegotiate AWS contract", savings: 3000, risk: "Low — just takes a call", good: true },
    { label: "Freeze all hiring for 60 days", savings: 5000, risk: "Low short term, hurts growth later", good: true },
    { label: "Cut team salaries by 15%", savings: 8000, risk: "High — people will quit", good: false },
    { label: "Move to cheaper office space", savings: 2000, risk: "Medium — disruption cost", good: true },
  ];
  const shuffled = useRef([...CUTS].sort(() => Math.random() - 0.5).slice(0, 4)).current;
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(cut, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !cut) {
      setResult({ good: false, reason: "No cut made — costs kept burning with no action.", lesson: "Failing to cut costs when needed burns runway.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setResult({
      good: cut.good,
      reason: cut.good
        ? `"${cut.label}" — saves $${cut.savings.toLocaleString()}/mo with ${cut.risk.toLowerCase()}.`
        : `"${cut.label}" — ${cut.risk.toLowerCase()}. The cost savings don't justify the damage.`,
      lesson: cut.good
        ? `Smart cut. Ruthless cost discipline separates startups that survive from ones that don't.`
        : `Wrong cut. Cutting costs that destroy morale or team capability costs more than you save.`,
      statChange: cut.good ? `+$${cut.savings.toLocaleString()}` : "-10% morale",
    });
    sounds[cut.good ? "cash" : "fail"]?.();
    setTimeout(() => onComplete(cut.good ? { money: cut.savings } : { morale: -10 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>✂️ Cost Cutting (CFO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#4ade80" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>Pick the best cost to cut right now. Not all cuts are equal.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {shuffled.map((cut, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(cut); }} disabled={submitted}
            style={{ padding: "10px 12px", background: chosen === i ? "#222" : "#111", border: `0.5px solid ${chosen === i ? "#444" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <p style={{ fontSize: 12, color: chosen === i ? "#fff" : "#aaa", marginBottom: 3 }}>{cut.label}</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontSize: 10, color: "#555" }}>{cut.risk}</p>
              <p style={{ fontSize: 10, color: "#4ade80" }}>-${cut.savings.toLocaleString()}/mo</p>
            </div>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function PaidCampaignActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(20, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const CHANNELS = [
    { label: "Google Search Ads", cost: 2000, fit: ["enterprise","medical","fintech"], lesson: "Search ads work when people are actively searching for your solution." },
    { label: "TikTok Ads", cost: 1000, fit: ["chaos","consumer"], lesson: "TikTok works for viral consumer products but kills enterprise credibility." },
    { label: "LinkedIn Ads", cost: 3000, fit: ["enterprise","impact"], lesson: "LinkedIn is expensive but reaches decision makers in B2B." },
    { label: "Reddit Ads", cost: 800, fit: ["chaos","general"], lesson: "Reddit users hate ads but love authentic community engagement." },
    { label: "Newsletter Sponsorship", cost: 1500, fit: ["general","enterprise"], lesson: "Newsletter sponsorships have high intent audiences and trust transfer." },
    { label: "Influencer Partnership", cost: 2500, fit: ["consumer","chaos","luxury"], lesson: "Influencers work for consumer products with strong visual appeal." },
  ];
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(channel, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !channel) {
      setResult({ good: false, reason: "No channel selected — budget spent with no campaign launched.", lesson: "No channel selected means wasted budget. Always match channel to audience.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const fits = channel.fit.split(",");
    const isGoodFit = fits.includes(profile.type) || fits.includes("general");
    const users = isGoodFit ? Math.floor(300 + Math.random() * 400) : Math.floor(50 + Math.random() * 100);
    setResult({
      good: isGoodFit,
      reason: isGoodFit
        ? `${channel.label} is a strong fit for ${profile.type} companies — audience intent matches.`
        : `${channel.label} is a poor fit for ${profile.type}. Wrong audience for your product type.`,
      lesson: channel.lesson,
      statChange: isGoodFit ? `+${users} users · -$${channel.cost.toLocaleString()}` : `-$${channel.cost.toLocaleString()} · +${users} users (poor fit)`,
    });
    sounds[isGoodFit ? "success" : "fail"]?.();
    setTimeout(() => onComplete(isGoodFit ? { users, money: -channel.cost } : { users: Math.floor(users * 0.3), money: -channel.cost }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>💸 Paid Campaign (CMO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#facc15" />
      </div>
      <div style={{ background: "#1a1500", border: "0.5px solid #facc1530", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
        <p style={{ fontSize: 10, color: "#facc15" }}>Your scenario: {profile.name} · Type: {profile.type}</p>
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Pick the best paid channel for your product type.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {CHANNELS.map((c, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(c); }} disabled={submitted}
            style={{ padding: "9px 12px", background: chosen === i ? "#222" : "#111", border: `0.5px solid ${chosen === i ? "#facc15" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontSize: 12, color: chosen === i ? "#fff" : "#aaa" }}>{c.label}</p>
              <p style={{ fontSize: 10, color: "#ff4444" }}>-${c.cost.toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function FreelanceGigActivity({ onComplete, difficulty }) {
  const timer = getTimer(15, difficulty);
  const GIGS = [
    { client: "E-commerce startup", task: "Build a checkout flow", pay: 4000, time: "3 days", risk: "Low", good: true },
    { client: "Fortune 500", task: "6-month enterprise contract", pay: 25000, time: "6 months", risk: "High — distracts from your startup", good: false },
    { client: "Non-profit", task: "Website redesign pro bono", pay: 0, time: "2 weeks", risk: "Zero revenue", good: false },
    { client: "Local business", task: "Fix a specific bug", pay: 800, time: "4 hours", risk: "Very low", good: true },
    { client: "Another startup", task: "Technical consulting call", pay: 500, time: "1 hour", risk: "None", good: true },
  ];
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(gig, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !gig) {
      setResult({ good: false, reason: "No gig selected — you left revenue on the table.", lesson: "Any revenue is better than none when you're bootstrapping.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setResult({
      good: gig.good,
      reason: gig.good
        ? `${gig.client} — $${gig.pay.toLocaleString()} for ${gig.time} work. Good time-to-revenue ratio.`
        : gig.pay === 0
        ? `Pro bono work pays nothing. You need revenue, not goodwill right now.`
        : `${gig.client} — ${gig.time} is too long. A 6-month contract kills your startup focus.`,
      lesson: gig.good
        ? `Freelancing is a great way to extend runway without giving up equity.`
        : `Take gigs that pay well relative to time and don't distract from your core product.`,
      statChange: gig.good ? `+$${gig.pay.toLocaleString()}` : gig.pay === 0 ? "-10% morale (no revenue)" : "-10% morale (too distracting)",
    });
    sounds[gig.good ? "cash" : "fail"]?.();
    setTimeout(() => onComplete(gig.good ? { money: gig.pay } : { morale: -10 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>💻 Freelance Gig (CTO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#f472b6" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>Pick the right freelance gig. Time is your scarcest resource.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {GIGS.map((g, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(g); }} disabled={submitted}
            style={{ padding: "10px 12px", background: chosen === i ? "#222" : "#111", border: `0.5px solid ${chosen === i ? "#444" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <p style={{ fontSize: 12, color: chosen === i ? "#fff" : "#aaa" }}>{g.client}</p>
              <p style={{ fontSize: 11, color: g.pay > 0 ? "#4ade80" : "#ff4444", fontFamily: "monospace" }}>${g.pay.toLocaleString()}</p>
            </div>
            <p style={{ fontSize: 10, color: "#555" }}>{g.task} · {g.time}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function OptimizeRevenueActivity({ onComplete, difficulty }) {
  const timer = getTimer(20, difficulty);
  const OPTIMIZATIONS = [
    { label: "Reduce payment processing fees by switching to Stripe", impact: "+$800/mo margin", good: true, lesson: "Payment processing fees compound at scale. Optimizing them is pure margin improvement." },
    { label: "Upsell current users to annual plans at 20% discount", impact: "+$5,000 upfront cash", good: true, lesson: "Annual plans improve cash flow and reduce churn. The 20% discount pays for itself in retention." },
    { label: "Add a free tier to attract more users", impact: "-$2,000/mo support cost", good: false, lesson: "Free tiers work but dramatically increase support burden. Only do this if you have the infrastructure." },
    { label: "Auto-charge expired credit cards without notification", impact: "+short term, legal risk", good: false, lesson: "Charging without consent is illegal and destroys trust. Never cut corners on billing ethics." },
    { label: "Offer referral bonuses to existing customers", impact: "+users, -$500 cost", good: true, lesson: "Referral programs have the highest ROI of any acquisition channel — you only pay for results." },
  ];
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(opt, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !opt) {
      setResult({ good: false, reason: "No optimization selected — opportunity missed.", lesson: "Revenue optimization requires action. Waiting costs you money every month.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    setResult({
      good: opt.good,
      reason: opt.good
        ? `"${opt.label}" — ${opt.impact}. Clean win with no downside.`
        : `"${opt.label}" — ${opt.impact}. The risk far outweighs the short-term gain.`,
      lesson: opt.lesson,
      statChange: opt.good ? "+$2,500 · +5% morale" : "-10% morale · legal risk",
    });
    sounds[opt.good ? "cash" : "fail"]?.();
    setTimeout(() => onComplete(opt.good ? { money: 2500, morale: 5 } : { morale: -10 }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>⚙️ Optimize Revenue (COO)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#a78bfa" />
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>Pick the best revenue optimization right now.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {OPTIMIZATIONS.map((o, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(o); }} disabled={submitted}
            style={{ padding: "10px 12px", background: chosen === i ? "#222" : "#111", border: `0.5px solid ${chosen === i ? "#444" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <p style={{ fontSize: 12, color: chosen === i ? "#fff" : "#aaa", marginBottom: 3 }}>{o.label}</p>
            <p style={{ fontSize: 10, color: "#555" }}>{o.impact}</p>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

function SponsorshipDealActivity({ onComplete, scenario, difficulty }) {
  const timer = getTimer(20, difficulty);
  const profile = getScenarioProfile(scenario?.id);
  const SPONSORS = [
    { name: "Tech newsletter (50k subscribers)", fit: "enterprise,general", pay: 2000, users: 200, lesson: "Newsletter sponsorships reach high-intent audiences already interested in your space." },
    { name: "Gaming YouTube channel (2M subs)", fit: "chaos,consumer", pay: 3000, users: 500, lesson: "Gaming audiences are young and engaged — great for consumer apps with fun branding." },
    { name: "Finance podcast (100k listeners)", fit: "fintech,enterprise", pay: 4000, users: 300, lesson: "Finance audiences have purchasing power and trust established podcast sponsors." },
    { name: "Wellness Instagram influencer", fit: "wellness,consumer,luxury", pay: 2500, users: 400, lesson: "Wellness influencers have highly engaged followings that trust product recommendations." },
    { name: "Startup community Slack group", fit: "general,enterprise", pay: 500, users: 150, lesson: "Startup communities are small but have high conversion rates — founders buy tools." },
  ];
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timeLeft = useCountdown(timer, () => submit(null, true), !submitted);

  function submit(sponsor, timedOut = false) {
    if (submitted) return;
    setSubmitted(true);
    if (timedOut || !sponsor) {
      setResult({ good: false, reason: "No sponsor selected — opportunity missed.", lesson: "Pick the right channel for your audience.", statChange: "-5% morale" });
      setTimeout(() => onComplete({ morale: -5 }), 3500); return;
    }
    const fits = sponsor.fit.split(",");
    const isGoodFit = fits.includes(profile.type) || fits.includes("general");
    setResult({
      good: isGoodFit,
      reason: isGoodFit
        ? `${sponsor.name} is a strong fit for ${profile.type} — audience alignment is high.`
        : `${sponsor.name} reaches the wrong audience for ${profile.type}. Poor channel fit.`,
      lesson: sponsor.lesson,
      statChange: isGoodFit
        ? `+$${sponsor.pay.toLocaleString()} · +${sponsor.users} users`
        : `+$${Math.round(sponsor.pay * 0.3).toLocaleString()} · +${Math.round(sponsor.users * 0.2)} users (poor fit)`,
    });
    sounds[isGoodFit ? "cash" : "fail"]?.();
    setTimeout(() => onComplete(isGoodFit ? { money: sponsor.pay, users: sponsor.users } : { money: Math.round(sponsor.pay * 0.3), users: Math.round(sponsor.users * 0.2) }), 3500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#888" }}>🎗️ Sponsorship Deal (Community)</p>
        <TimerRing seconds={timeLeft} total={timer} color="#2dd4bf" />
      </div>
      <div style={{ background: "#0a1a1a", border: "0.5px solid #2dd4bf20", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
        <p style={{ fontSize: 10, color: "#2dd4bf" }}>Your product: {profile.name} · Type: {profile.type}</p>
      </div>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Pick the best sponsorship channel for your audience.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {SPONSORS.map((s, i) => (
          <button key={i} onClick={() => { setChosen(i); submit(s); }} disabled={submitted}
            style={{ padding: "10px 12px", background: chosen === i ? "#222" : "#111", border: `0.5px solid ${chosen === i ? "#2dd4bf" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <p style={{ fontSize: 12, color: chosen === i ? "#fff" : "#aaa" }}>{s.name}</p>
              <p style={{ fontSize: 10, color: "#4ade80" }}>+${s.pay.toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>
      {result && <Lesson text={result.lesson} isGood={result.good} statChange={result.statChange} reason={result.reason} />}
    </div>
  );
}

// ─── ACTIVITY MAP ─────────────────────────────────────────────────────────────
export const ACTIVITY_MAP = {
  "Cold Email": ColdEmailActivity,
  "Blog Post": BlogPostActivity,
  "Network Event": NetworkingActivity,
  "Attack Competitor": AttackActivity,
  "Ship Fast": ShipFastActivity,
  "Fix Tech Debt": FixTechDebtActivity,
  "A/B Test": ABTestActivity,
  "Pitch Practice": PitchPracticeActivity,
  "Defect & Go Solo": DefectActivity,
  "Business Quiz": MathActivity,
  "Financial Model": FinancialModelActivity,
  "Audit Trail": AuditTrailActivity,
  "Emergency Reserve": EmergencyReserveActivity,
  "Campaign Blast": CampaignBlastActivity,
  "Brand Refresh": BrandRefreshActivity,
  "Fake Virality": FakeViralityActivity,
  "Plant Bug": PlantBugActivity,
  "Automate Process": AutomateActivity,
  "Systems Audit": SystemsAuditActivity,
  "Hire NPC": HireNPCActivity,
  "Cold Call": ColdCallActivity,
  "Flash Sale": FlashSaleActivity,
  "Host AMA": HostAMAActivity,
  "Town Hall": TownHallActivity,
  "Personalized Outreach": PersonalizedOutreachActivity,
  "All-Hands": AllHandsActivity,
  "Fire Someone": FireActivity,
  "Pivot": PivotActivity,
  "Embezzle Quietly": EmbezzleActivity,
  "Leak to Press": LeakToPressActivity,
  "Product Update": ProductUpdateActivity,
  "Draw Billionaire": DrawingActivity,
  "Close Deal": CloseDealtActivity,
  "Cost Cutting": CostCuttingActivity,
  "Paid Campaign": PaidCampaignActivity,
  "Freelance Gig": FreelanceGigActivity,
  "Optimize Revenue": OptimizeRevenueActivity,
  "Sponsorship Deal": SponsorshipDealActivity,
};

export default function Activity({ actionKey, onComplete, onCancel, scenario, difficulty, quirk }) {
  const Component = ACTIVITY_MAP[actionKey];
  if (!Component) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "1rem" }}>
      <div style={{ background: "#0f0f0f", border: "0.5px solid #2a2a2a", borderRadius: 16, padding: "1.25rem", width: "100%", maxWidth: 400, maxHeight: "88vh", overflowY: "auto" }}>
        <Component onComplete={onComplete} scenario={scenario} difficulty={difficulty} quirk={quirk} />
      </div>
    </div>
  );
}