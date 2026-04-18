import { useState, useEffect, useRef, useCallback } from "react";
import { getEventsForScenario } from "./events";
import { sounds } from "./sounds";
import Activity, { ACTIVITY_MAP } from "./Activity";
import Chat from "./Chat";

const QUIZ_QUESTIONS = [
  { q: "What does 'burn rate' mean?", options: ["How fast you're spending money", "How hot your servers run", "Your marketing spend only", "Revenue growth rate"], correct: 0, stat: "money", amount: 1000, lesson: "Burn rate is how fast a startup spends its cash reserves." },
  { q: "What is 'product-market fit'?", options: ["Having a great design", "When your product solves a real need at scale", "Selling to the right market", "Having positive reviews"], correct: 1, stat: "users", amount: 300, lesson: "Product-market fit is when your product grows itself because users genuinely need it." },
  { q: "What does CAC stand for?", options: ["Customer Acquisition Cost", "Capital Asset Cost", "Company Annual Cashflow", "Customer Average Cart"], correct: 0, stat: "money", amount: 1500, lesson: "CAC is what you spend to acquire one customer. If CAC > LTV you lose money on every customer." },
  { q: "What does LTV stand for?", options: ["Long Term Value", "Lifetime Value", "Leverage Total Value", "Last Transaction Value"], correct: 1, stat: "money", amount: 1500, lesson: "LTV is the total revenue you expect from one customer over their lifetime." },
  { q: "What is a 'runway'?", options: ["Your go-to-market plan", "How long until you run out of money", "Your hiring pipeline", "Time to first revenue"], correct: 1, stat: "morale", amount: 10, lesson: "Runway = cash / burn rate. Most startups need 18+ months." },
  { q: "What is 'churn rate'?", options: ["How fast you hire", "How fast customers leave", "Revenue growth speed", "How fast you ship"], correct: 1, stat: "users", amount: 500, lesson: "5% monthly churn means losing half your base in a year." },
  { q: "What does B2B mean?", options: ["Business to Browser", "Back to Basics", "Business to Business", "Build to Buy"], correct: 2, stat: "money", amount: 1000, lesson: "B2B means selling to other businesses. Higher prices, longer sales cycles." },
  { q: "What is 'bootstrapping'?", options: ["Building with no funding", "Copying a competitor", "Going viral organically", "Building fast"], correct: 0, stat: "money", amount: 2000, lesson: "Bootstrapping means funding from revenue, not investors." },
  { q: "What is 'equity'?", options: ["Your company's debt", "Ownership stake", "Monthly revenue", "Credit line"], correct: 1, stat: "morale", amount: 15, lesson: "Giving equity means giving up a % of the company forever." },
  { q: "What does ARR stand for?", options: ["Annual Revenue Rate", "Annual Recurring Revenue", "Average Refund Rate", "Adjusted Revenue Ratio"], correct: 1, stat: "money", amount: 2000, lesson: "ARR is the predictable revenue a subscription business generates per year." },
  { q: "What is a 'term sheet'?", options: ["A hiring contract", "An investment offer document", "A product roadmap", "A legal settlement"], correct: 1, stat: "money", amount: 1500, lesson: "A term sheet outlines investment terms. Step one of a funding round." },
  { q: "What is 'gross margin'?", options: ["Total revenue", "Revenue minus cost of goods sold", "Net profit", "Operating expenses"], correct: 1, stat: "money", amount: 2000, lesson: "Gross margin = (revenue - COGS) / revenue. SaaS targets 70-80%." },
];

const ROLE_COLORS = {
  "CEO": "#60a5fa", "CFO": "#4ade80", "CMO": "#facc15",
  "CTO": "#f472b6", "COO": "#a78bfa",
  "Head of Sales": "#fb923c", "Community Manager": "#2dd4bf",
};

const DIFFICULTY_SETTINGS = {
  intern:  { label: "🎓 Intern",   startMoney: 15000, eventInterval: 50, consequenceMultiplier: 0.5,  tint: "rgba(74,222,128,0.03)",  timerMultiplier: 1.5 },
  founder: { label: "🚀 Founder",  startMoney: 10000, eventInterval: 35, consequenceMultiplier: 1.0,  tint: "transparent",             timerMultiplier: 1.0 },
  veteran: { label: "⚡ Veteran",  startMoney: 7500,  eventInterval: 25, consequenceMultiplier: 1.25, tint: "rgba(251,146,60,0.04)",   timerMultiplier: 0.8 },
  shark:   { label: "🦈 Shark",    startMoney: 5000,  eventInterval: 15, consequenceMultiplier: 1.5,  tint: "rgba(255,68,68,0.05)",    timerMultiplier: 0.6 },
};

const GAME_DURATIONS = { 5: 300, 10: 600, 15: 900, 20: 1200 };

const PERSONALITY_QUIRKS = [
  { id: "overconfident", label: "😤 Overconfident", desc: "Your morale never drops below 40% — but bad decisions cost double.", moraleFloor: 40, badMultiplier: 2.0, goodMultiplier: 1.0 },
  { id: "cautious", label: "🤔 Cautious", desc: "Your actions always work — but at 60% effectiveness.", moraleFloor: 0, badMultiplier: 0.5, goodMultiplier: 0.6 },
  { id: "charismatic", label: "😎 Charismatic", desc: "Networking and AMA always succeed — but financial decisions are riskier.", moraleFloor: 0, badMultiplier: 1.5, goodMultiplier: 1.3 },
  { id: "paranoid", label: "😰 Paranoid", desc: "You see all saboteur actions — but you're 20% slower on all activities.", moraleFloor: 0, badMultiplier: 1.0, goodMultiplier: 0.8 },
  { id: "lucky", label: "🍀 Lucky", desc: "Random events have a 30% chance to flip to the positive outcome.", moraleFloor: 0, badMultiplier: 0.7, goodMultiplier: 1.0 },
  { id: "reckless", label: "🎲 Reckless", desc: "All outcomes are doubled — double wins AND double losses.", moraleFloor: 0, badMultiplier: 2.0, goodMultiplier: 2.0 },
  { id: "methodical", label: "📋 Methodical", desc: "Stacks build 50% faster — but you can only do one action at a time.", moraleFloor: 0, badMultiplier: 1.0, goodMultiplier: 1.5 },
  { id: "wildcard", label: "🃏 Wildcard", desc: "Every action has a 20% chance of a completely random outcome.", moraleFloor: 0, badMultiplier: 1.0, goodMultiplier: 1.0 },
];

const MARKET_CONDITIONS = [
  { id: "recession", label: "📉 Recession", desc: "Revenue -30% for 90s", effect: { revenueMultiplier: 0.7 }, duration: 90, color: "#ff4444" },
  { id: "ai_hype", label: "🤖 AI Hype Cycle", desc: "Tech startups get 2x users from all actions", effect: { userMultiplier: 2.0 }, duration: 60, color: "#a78bfa" },
  { id: "viral_moment", label: "🔥 Viral Moment", desc: "All marketing actions have 3x effect", effect: { marketingMultiplier: 3.0 }, duration: 45, color: "#fb923c" },
  { id: "investor_frenzy", label: "💰 Investor Frenzy", desc: "Pitch success rate +50% for 60s", effect: { pitchBonus: 1.5 }, duration: 60, color: "#4ade80" },
  { id: "regulatory_crackdown", label: "⚖️ Regulatory Crackdown", desc: "Healthcare/fintech can't run paid campaigns", effect: { campaignBlocked: true }, duration: 75, color: "#facc15" },
  { id: "talent_war", label: "👔 Talent War", desc: "Hiring costs 2x but quality is higher", effect: { hireMultiplier: 2.0 }, duration: 60, color: "#60a5fa" },
  { id: "market_crash", label: "💥 Market Crash", desc: "All money effects -50% for 60s", effect: { moneyMultiplier: 0.5 }, duration: 60, color: "#ff4444" },
  { id: "growth_surge", label: "🚀 Growth Surge", desc: "All user gains doubled for 45s", effect: { userMultiplier: 2.0 }, duration: 45, color: "#4ade80" },
];

const COMBO_BONUSES = [
  { id: "media_moment", stacks: { blog: 3, network: 3, pitch_practice: 2 }, label: "📰 Media Moment!", desc: "A journalist writes about you unprompted!", effect: { users: 1500, morale: 20 } },
  { id: "sales_flywheel", stacks: { call: 8, campaign: 4, email: 6 }, label: "🔄 Sales Flywheel!", desc: "Auto-converting users to revenue every 60s!", effect: { money: 5000, users: 500 } },
  { id: "tech_monopoly", stacks: { ship: 5, debt: 3, ab: 4 }, label: "⚡ Tech Monopoly!", desc: "Your product is untouchable. Competitor attacks fail permanently.", effect: { users: 1000, morale: 25 } },
  { id: "cult_brand", stacks: { ama: 3, outreach: 4, allhands: 3 }, label: "🌊 Cult Brand!", desc: "Users are evangelists now. Organic growth activated.", effect: { users: 2000, morale: 30 } },
  { id: "investor_darling", stacks: { pitch_practice: 4, model: 3, network: 4 }, label: "🦄 Investor Darling!", desc: "VCs are fighting over you. Bonus $30k incoming!", effect: { money: 30000, morale: 20 } },
  { id: "data_empire", stacks: { ab: 6, automate: 3, model: 4 }, label: "📊 Data Empire!", desc: "Your data advantage is compounding. All decisions show predicted outcomes.", effect: { money: 10000, users: 500 } },
];

const SEASONAL_EVENTS = [
  { triggerTime: 0.25, event: { tier: 1, text: "📅 Tech conference season begins! Networking events have double yield for 2 minutes.", options: [{ label: "Attend every session", effect: { morale: 10, users: 300 } }, { label: "Skip it", effect: {} }] } },
  { triggerTime: 0.5,  event: { tier: 2, text: "📈 Earnings season — investors are distracted. Pitch success rate drops 30% for 90 seconds.", options: [{ label: "Wait it out", effect: { morale: 5 } }, { label: "Pitch anyway", effect: { morale: -5 } }] } },
  { triggerTime: 0.75, event: { tier: 3, text: "🏆 Industry awards announced. If your morale is above 70%, you're nominated.", options: [{ label: "Accept the nomination", effect: { users: 800, morale: 20 } }, { label: "Decline — stay focused", effect: { morale: 10 } }] } },
];

export default function Game({ gameConfig, playerData, onGameOver }) {
  const difficulty = DIFFICULTY_SETTINGS[gameConfig.difficulty || "founder"];
  const duration = GAME_DURATIONS[gameConfig.gameLength] || 600;
  const EVENTS = getEventsForScenario(gameConfig?.scenario?.id || "");
  const quirk = PERSONALITY_QUIRKS.find(q => q.id === playerData.quirk) || PERSONALITY_QUIRKS[0];

  const [money, setMoney] = useState(difficulty.startMoney);
  const [users, setUsers] = useState(0);
  const [morale, setMorale] = useState(100);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventTimeLeft, setEventTimeLeft] = useState(null);
  const [log, setLog] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [gameActive, setGameActive] = useState(true);
  const [activeTab, setActiveTab] = useState("actions");
  const [cooldowns, setCooldowns] = useState({});
  const [stacks, setStacks] = useState({});
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [showInvestorPitch, setShowInvestorPitch] = useState(false);
  const [pitchText, setPitchText] = useState("");
  const [pitchResponse, setPitchResponse] = useState(null);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchUsed, setPitchUsed] = useState(false);
  const [defected, setDefected] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null);
  const [activityResult, setActivityResult] = useState(null);
  const [marketCondition, setMarketCondition] = useState(null);
  const [marketTimeLeft, setMarketTimeLeft] = useState(0);
  const [comboUnlocked, setComboUnlocked] = useState([]);
  const [reputation, setReputation] = useState({ investor: 50, press: 50, customer: 50, competitor: 50 });
  const [chaosTokens, setChaosTokens] = useState(3);
  const [passiveRevenue, setPassiveRevenue] = useState(0);
  const [recentStatChange, setRecentStatChange] = useState(null);
  const [seasonalTriggered, setSeasonalTriggered] = useState([]);

  const usedEventsRef = useRef([]);
  const stateRef = useRef({});
  stateRef.current = { money, users, morale, gameActive, stacks, reputation, passiveRevenue };

  // Main timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); endGame("survived"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Passive revenue from users
  useEffect(() => {
    const t = setInterval(() => {
      if (!stateRef.current.gameActive) return;
      const passive = Math.floor(stateRef.current.users / 100) * 50;
      if (passive > 0) {
        setMoney(prev => prev + passive);
        setPassiveRevenue(passive);
        setTimeout(() => setPassiveRevenue(0), 2000);
      }
    }, 30000);
    return () => clearInterval(t);
  }, []);

  // Morale passive decay
  useEffect(() => {
    const t = setInterval(() => {
      if (!stateRef.current.gameActive) return;
      setMorale(prev => {
        const decay = difficulty.consequenceMultiplier * 1;
        const newMorale = Math.max(0, prev - decay);
        if (newMorale <= 0) endGame("morale");
        return newMorale;
      });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  // Market conditions
  useEffect(() => {
    const interval = 45000 + Math.random() * 30000;
    const t = setInterval(() => {
      if (!stateRef.current.gameActive) return;
      const condition = MARKET_CONDITIONS[Math.floor(Math.random() * MARKET_CONDITIONS.length)];
      setMarketCondition(condition);
      setMarketTimeLeft(condition.duration);
      addLog(`🌍 Market: ${condition.label} — ${condition.desc}`);
      sounds.event();
    }, interval);
    return () => clearInterval(t);
  }, []);

  // Market condition countdown
  useEffect(() => {
    if (!marketCondition) return;
    const t = setInterval(() => {
      setMarketTimeLeft(prev => {
        if (prev <= 1) { setMarketCondition(null); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [marketCondition]);

  // Seasonal events
  useEffect(() => {
    const t = setInterval(() => {
      const elapsed = (duration - timeLeft) / duration;
      SEASONAL_EVENTS.forEach((se, i) => {
        if (!seasonalTriggered.includes(i) && elapsed >= se.triggerTime) {
          setSeasonalTriggered(prev => [...prev, i]);
          setCurrentEvent(se.event);
          setEventTimeLeft(20);
          sounds.event();
        }
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, seasonalTriggered]);

  // Event timer — auto-resolve if ignored
  useEffect(() => {
    if (!currentEvent || eventTimeLeft === null) return;
    if (eventTimeLeft <= 0) {
      const worstOption = currentEvent.options[currentEvent.options.length - 1];
      applyEffect(worstOption.effect, 1.5);
      addLog(`⚠️ You ignored an event. Worst outcome applied automatically.`);
      setFeedback("You ignored that. It cost you. ⚠️");
      setTimeout(() => setFeedback(null), 3000);
      setCurrentEvent(null);
      setEventTimeLeft(null);
      sounds.crisis();
      return;
    }
    const t = setTimeout(() => setEventTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [currentEvent, eventTimeLeft]);

  // Events
  useEffect(() => {
    const interval = difficulty.eventInterval * 1000;
    const t = setInterval(() => {
      if (stateRef.current.gameActive) triggerEvent();
    }, interval);
    setTimeout(() => { if (stateRef.current.gameActive) triggerEvent(); }, 4000);
    return () => clearInterval(t);
  }, []);

  // Auto investor pitch at midpoint
  useEffect(() => {
    const t = setTimeout(() => {
      if (stateRef.current.gameActive && !pitchUsed) setShowInvestorPitch(true);
    }, (duration / 2) * 1000);
    return () => clearTimeout(t);
  }, []);

  // Combo detection
  useEffect(() => {
    COMBO_BONUSES.forEach(combo => {
      if (comboUnlocked.includes(combo.id)) return;
      const achieved = Object.entries(combo.stacks).every(([k, v]) => (stacks[k] || 0) >= v);
      if (achieved) {
        setComboUnlocked(prev => [...prev, combo.id]);
        applyEffect(combo.effect);
        setFeedback(`🎉 ${combo.label} ${combo.desc}`);
        setTimeout(() => setFeedback(null), 4000);
        addLog(`🎉 COMBO: ${combo.label}`);
        sounds.win();
      }
    });
  }, [stacks]);

  function triggerEvent() {
    const available = EVENTS.filter(e => !usedEventsRef.current.includes(e.id));
    if (!available.length) { usedEventsRef.current = []; return; }
    const pick = available[Math.floor(Math.random() * available.length)];
    usedEventsRef.current = [...usedEventsRef.current, pick.id];
    setCurrentEvent(pick);
    setEventTimeLeft(20);
    sounds.event();
    if (pick.tier >= 3) sounds.crisis();
  }

  function applyEffect(effect, extraMultiplier = 1) {
    if (!effect) return;
    const s = stateRef.current;
    const m = difficulty.consequenceMultiplier * extraMultiplier;
    const quirkMult = effect.money < 0 || effect.users < 0 || effect.morale < 0
      ? quirk.badMultiplier : quirk.goodMultiplier;

    // Apply personality wildcard
    const isWildcard = quirk.id === "wildcard" && Math.random() < 0.2;
    const finalEffect = isWildcard ? {
      money: effect.money ? -effect.money : 0,
      users: effect.users ? -effect.users : 0,
      morale: effect.morale ? -effect.morale : 0,
    } : effect;

    // Apply lucky quirk
    const isLucky = quirk.id === "lucky" && Math.random() < 0.3;
    const luckyEffect = isLucky ? {
      money: Math.abs(finalEffect.money || 0),
      users: Math.abs(finalEffect.users || 0),
      morale: Math.abs(finalEffect.morale || 0),
    } : finalEffect;

    const moneyChange = Math.round((luckyEffect.money || 0) * (luckyEffect.money < 0 ? m * quirkMult : 1));
    const userChange = Math.round((luckyEffect.users || 0) * (luckyEffect.users < 0 ? m * quirkMult : 1));
    const moraleChange = Math.round((luckyEffect.morale || 0) * (luckyEffect.morale < 0 ? m * quirkMult : 1));

    const newMoney = Math.max(0, s.money + moneyChange);
    const newUsers = Math.max(0, s.users + userChange);
    const newMorale = Math.min(100, Math.max(quirk.moraleFloor, s.morale + moraleChange));

    setMoney(newMoney);
    setUsers(newUsers);
    setMorale(newMorale);

    // Show stat change
    const changes = [];
    if (moneyChange !== 0) changes.push(`${moneyChange > 0 ? "+" : ""}$${Math.abs(moneyChange).toLocaleString()}`);
    if (userChange !== 0) changes.push(`${userChange > 0 ? "+" : ""}${userChange} users`);
    if (moraleChange !== 0) changes.push(`${moraleChange > 0 ? "+" : ""}${moraleChange}% morale`);
    if (changes.length > 0) {
      const isPositive = moneyChange >= 0 && userChange >= 0 && moraleChange >= 0;
      setRecentStatChange({ text: changes.join(" · "), positive: isPositive });
      setTimeout(() => setRecentStatChange(null), 3000);
    }

    // Update reputation
    if (luckyEffect.money > 5000) setReputation(prev => ({ ...prev, investor: Math.min(100, prev.investor + 5) }));
    if (luckyEffect.users > 500) setReputation(prev => ({ ...prev, customer: Math.min(100, prev.customer + 3) }));
    if (luckyEffect.morale > 10) setReputation(prev => ({ ...prev, press: Math.min(100, prev.press + 2) }));
    if (luckyEffect.money < -5000) setReputation(prev => ({ ...prev, investor: Math.max(0, prev.investor - 5) }));
    if (luckyEffect.users < -200) setReputation(prev => ({ ...prev, customer: Math.max(0, prev.customer - 5) }));

    if (isWildcard) { setFeedback("🃏 Wildcard! Outcome reversed!"); setTimeout(() => setFeedback(null), 2000); }
    if (isLucky) { setFeedback("🍀 Lucky! Negative flipped positive!"); setTimeout(() => setFeedback(null), 2000); }

    if (effect.win) { endGame("acquired"); return; }
    if (newMoney <= 0) { endGame("bankrupt"); return; }
    if (newMorale <= 0) { endGame("morale"); return; }
  }

  function handleEventChoice(option) {
    sounds.event();
    applyEffect(option.effect);
    addLog(`Event: "${option.label}"`);
    setCurrentEvent(null);
    setEventTimeLeft(null);

    const effect = option.effect || {};
    const positives = [];
    const negatives = [];
    if ((effect.money || 0) > 0) positives.push(`+$${effect.money.toLocaleString()}`);
    if ((effect.money || 0) < 0) negatives.push(`-$${Math.abs(effect.money).toLocaleString()}`);
    if ((effect.users || 0) > 0) positives.push(`+${effect.users} users`);
    if ((effect.users || 0) < 0) negatives.push(`${effect.users} users`);
    if ((effect.morale || 0) > 0) positives.push(`+${effect.morale}% morale`);
    if ((effect.morale || 0) < 0) negatives.push(`${effect.morale}% morale`);

    const isGood = positives.length >= negatives.length;
    const summary = [...positives, ...negatives].join(" · ") || "No immediate effect.";
    const tone = isGood ? "Good call." : negatives.length > 1 ? "You'll regret that." : "Risky move.";
    setFeedback(`${isGood ? "✓" : "✗"} ${tone} ${summary}`);
    setTimeout(() => setFeedback(null), 3500);
  }

  function addLog(msg) {
    setLog(prev => [msg, ...prev].slice(0, 12));
  }

  function startCooldown(key, seconds) {
    setCooldowns(prev => ({ ...prev, [key]: seconds }));
    const t = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev, [key]: (prev[key] || 0) - 1 };
        if (next[key] <= 0) { clearInterval(t); delete next[key]; sounds.cooldown_done(); }
        return next;
      });
    }, 1000);
  }

  function addStack(key) {
    setStacks(prev => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      const bonus = quirk.id === "methodical" ? 0.5 : 0;
      if (bonus > 0) next[key] = Math.floor(next[key] * (1 + bonus));
      return next;
    });
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
    const { key, cooldownSecs, stackKey } = activeActivity;
    setActiveActivity(null);
    if (!result) return;
    if (result.defect) {
      setDefected(true);
      applyEffect({ money: -Math.floor(stateRef.current.money * 0.6), users: -Math.floor(stateRef.current.users * 0.6) });
      addLog("💀 You defected!");
      setFeedback("😈 You defected! Starting rival company...");
      setTimeout(() => setFeedback(null), 3000);
    } else {
      applyEffect(result);
      const changes = [];
      if (result.money) changes.push(`${result.money > 0 ? "+" : ""}$${Math.abs(result.money).toLocaleString()}`);
      if (result.users) changes.push(`${result.users > 0 ? "+" : ""}${result.users} users`);
      if (result.morale) changes.push(`${result.morale > 0 ? "+" : ""}${result.morale}% morale`);
      setActivityResult({ key, changes: changes.join(" · ") || "No change", positive: (result.money || 0) >= 0 && (result.users || 0) >= 0 });
      setTimeout(() => setActivityResult(null), 4000);
    }
    addLog(`✓ ${key}: ${result.users ? (result.users > 0 ? "+" : "") + result.users + " users " : ""}${result.money ? (result.money > 0 ? "+" : "") + "$" + Math.abs(result.money).toLocaleString() : ""}`);
    startCooldown(key, cooldownSecs);
    if (stackKey) addStack(stackKey);
  }

  function triggerQuiz() {
    if (cooldowns["Business Quiz"] || currentQuiz) return;
    const q = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    setCurrentQuiz(q);
    setQuizResult(null);
  }

  function answerQuiz(idx) {
    if (!currentQuiz || quizResult) return;
    const correct = idx === currentQuiz.correct;
    setQuizResult({ correct, lesson: currentQuiz.lesson });
    if (correct) {
      applyEffect({ [currentQuiz.stat]: currentQuiz.amount });
      addStack("quiz_correct");
      sounds.quiz_correct();
    } else {
      applyEffect({ morale: -5 });
      sounds.quiz_wrong();
    }
    startCooldown("Business Quiz", 30);
    setTimeout(() => { setCurrentQuiz(null); setQuizResult(null); }, 3500);
  }

  async function submitPitch() {
    if (!pitchText.trim() || pitchLoading) return;
    setPitchLoading(true);
    setPitchUsed(true);
    const INVESTORS = [
      { name: "Marcus Webb", background: "Ex-Goldman Sachs", cares: "unit economics and clear revenue model", dealbreaker: "founders who don't know their numbers" },
      { name: "Sandra Chen", background: "Ex-Google, early Stripe investor", cares: "product-market fit and user growth", dealbreaker: "vanity metrics without retention" },
      { name: "Raj Patel", background: "Built and sold 3 startups", cares: "founder grit and market size", dealbreaker: "crowded markets with no differentiation" },
      { name: "Lisa Torres", background: "Former Y Combinator partner", cares: "speed of iteration and team strength", dealbreaker: "solo founders with no technical co-founder" },
      { name: "Devon Black", background: "Hedge fund turned angel investor", cares: "defensibility and moat", dealbreaker: "founders who can't explain their competitive advantage" },
    ];
    const investor = INVESTORS[Math.floor(Math.random() * INVESTORS.length)];
    try {
      const scenario = gameConfig.scenario?.name || "a startup";
      const res = await fetch("/.netlify/functions/claude-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are ${investor.name}, ${investor.background}. You are judging a startup pitch in a multiplayer business simulation game called Startup Survival. The startup is: ${scenario}. Current stats: $${stateRef.current.money.toLocaleString()} cash, ${stateRef.current.users} users, ${stateRef.current.morale}% team morale. You care most about ${investor.cares}. Your deal-breaker is: ${investor.dealbreaker}. Respond in 3-4 sentences max, in character as this specific investor. Be direct, occasionally harsh, always educational about real business. Vary your responses — sometimes intrigued, sometimes skeptical, sometimes impressed, sometimes brutal. End with exactly one verdict on its own line: DEAL: $[amount]k for [equity]% | COUNTER: [specific counter offer] | PASS: [one brutal specific reason] | MAYBE: [what you need to see before deciding]`,
          messages: [{ role: "user", content: pitchText }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "The investor had to leave early.";
      setPitchResponse({ text, investor: investor.name });
      if (text.includes("DEAL:")) {
        const moneyMatch = text.match(/\$(\d+)k/);
        const dealMoney = moneyMatch ? parseInt(moneyMatch[1]) * 1000 : 50000;
        applyEffect({ money: dealMoney, morale: 20 });
        setReputation(prev => ({ ...prev, investor: Math.min(100, prev.investor + 20) }));
        sounds.win();
      } else if (text.includes("PASS:")) {
        applyEffect({ morale: -10 });
        setReputation(prev => ({ ...prev, investor: Math.max(0, prev.investor - 5) }));
        sounds.fail();
      } else if (text.includes("COUNTER:")) {
        applyEffect({ morale: 5 });
        sounds.action();
      } else if (text.includes("MAYBE:")) {
        applyEffect({ morale: 10 });
        sounds.action();
      }
      addLog(`🦈 Pitch to ${investor.name}: ${text.includes("DEAL:") ? "DEAL!" : text.includes("PASS:") ? "Passed" : text.includes("COUNTER:") ? "Counter offer" : "Maybe"}`);
    } catch (err) {
      setPitchResponse({ text: "Connection error. Try again.", investor: "Unknown" });
    }
    setPitchLoading(false);
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
        difficulty: gameConfig.difficulty || "founder",
        scenario: gameConfig.scenario?.name || "Unknown",
        scenarioId: gameConfig.scenario?.id || "",
        reputation: stateRef.current.reputation,
        quirk: playerData.quirk,
        combosUnlocked: comboUnlocked,
      });
    }, 800);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const roleColor = ROLE_COLORS[playerData.role] || "#888";
  const quirkData = PERSONALITY_QUIRKS.find(q => q.id === playerData.quirk);

  const universalActions = [
    { key: "Cold Email", emoji: "📧", cooldown: 20, effect: { users: 50 }, stack: "email", desc: "Blast cold emails." },
    { key: "Network Event", emoji: "🤝", cooldown: 45, effect: { morale: 5, money: 500 }, stack: "network", desc: "Meet an NPC." },
    { key: "Blog Post", emoji: "📰", cooldown: 60, effect: { users: 30, morale: 3 }, stack: "blog", desc: "Build brand authority." },
    { key: "A/B Test", emoji: "🧪", cooldown: 90, effect: { users: 100, money: 500 }, stack: "ab", desc: "Data-driven improvements." },
    { key: "Attack Competitor", emoji: "⚔️", cooldown: 75, effect: { users: 200 }, stack: "attack", desc: "Steal users." },
    { key: "Pitch Practice", emoji: "🎤", cooldown: 120, effect: { morale: 5 }, stack: "pitch_practice", desc: "Improve pitch score." },
    { key: "Product Update", emoji: "📦", cooldown: 50, effect: { users: 80, morale: 5 }, stack: "update", desc: "Push an improvement." },
    { key: "Business Quiz", emoji: "📊", cooldown: 30, effect: {}, stack: "quiz_attempt", desc: "Answer for stat boosts." },
  ];

  const roleActions = {
    "CEO": [
      { key: "All-Hands", emoji: "🎯", cooldown: 60, effect: { morale: 10 }, stack: "allhands", desc: "Boost team morale." },
      { key: "Fire Someone", emoji: "🔥", cooldown: 120, effect: { morale: -5, money: 2000 }, stack: "fire", desc: "Cut dead weight." },
      { key: "Pivot", emoji: "🔄", cooldown: 300, effect: { morale: 10, users: 300 }, stack: "pivot", desc: "Change direction." },
    ],
    "CFO": [
      { key: "Financial Model", emoji: "📈", cooldown: 60, effect: { money: 1000 }, stack: "model", desc: "Preview event impact." },
      { key: "Emergency Reserve", emoji: "🏦", cooldown: 120, effect: { money: 2000 }, stack: "reserve", desc: "Lock away funds." },
      { key: "Audit Trail", emoji: "🕵️", cooldown: 90, effect: { morale: 5 }, stack: "audit", desc: "Find the saboteur." },
    ],
    "CMO": [
      { key: "Campaign Blast", emoji: "📢", cooldown: 30, effect: { users: 300, money: -500 }, stack: "campaign", desc: "Targeted blast." },
      { key: "Brand Refresh", emoji: "🎨", cooldown: 180, effect: { users: 300, morale: 10, money: -1000 }, stack: "refresh", desc: "Reset reputation." },
      { key: "Fake Virality", emoji: "🤳", cooldown: 150, effect: { users: 500 }, stack: "viral", desc: "50/50 viral stunt." },
    ],
    "CTO": [
      { key: "Ship Fast", emoji: "⚡", cooldown: 30, effect: { users: 150, morale: 5 }, stack: "ship", desc: "Build feature fast." },
      { key: "Fix Tech Debt", emoji: "🐛", cooldown: 90, effect: { morale: 10, money: 1000 }, stack: "debt", desc: "Prevent crashes." },
      { key: "Plant Bug", emoji: "🪲", cooldown: 120, effect: { users: 300 }, stack: "plantbug", desc: "Sabotage competitor." },
    ],
    "COO": [
      { key: "Automate Process", emoji: "🤖", cooldown: 150, effect: { money: -2000, morale: 10 }, stack: "automate", desc: "Passive gains." },
      { key: "Systems Audit", emoji: "🔍", cooldown: 300, effect: { morale: 15 }, stack: "sysaudit", desc: "Reveal saboteur." },
      { key: "Hire NPC", emoji: "📋", cooldown: 120, effect: { money: -3000, morale: 15, users: 100 }, stack: "hire", desc: "Add passive booster." },
    ],
    "Head of Sales": [
      { key: "Cold Call", emoji: "📞", cooldown: 20, effect: { money: 2000, users: 50 }, stack: "call", desc: "Direct revenue." },
      { key: "Enterprise Pitch", emoji: "💼", cooldown: 300, effect: {}, stack: "enterprise", desc: "Trigger investor pitch." },
      { key: "Flash Sale", emoji: "🎁", cooldown: 180, effect: { money: 5000, users: -100 }, stack: "sale", desc: "Revenue spike." },
    ],
    "Community Manager": [
      { key: "Host AMA", emoji: "🎉", cooldown: 90, effect: { users: 200, morale: 15, money: -500 }, stack: "ama", desc: "Community love." },
      { key: "Town Hall", emoji: "🗳️", cooldown: 300, effect: { morale: 20 }, stack: "townhall", desc: "Overrule CEO." },
      { key: "Personalized Outreach", emoji: "💌", cooldown: 60, effect: { users: 100, morale: 10 }, stack: "outreach", desc: "High retention." },
    ],
  };

  // Solo revenue actions for non-sales roles
  const soloRevenueActions = {
    "CEO": { key: "Close Deal", emoji: "🤝", cooldown: 90, effect: { money: 3000 }, stack: "solo_revenue", desc: "CEO closes a deal directly." },
    "CFO": { key: "Cost Cutting", emoji: "✂️", cooldown: 60, effect: { money: 2000 }, stack: "solo_revenue", desc: "Cut costs, save money." },
    "CMO": { key: "Paid Campaign", emoji: "💸", cooldown: 45, effect: { money: 1500, users: 200 }, stack: "solo_revenue", desc: "Run a paid ad campaign." },
    "CTO": { key: "Freelance Gig", emoji: "💻", cooldown: 120, effect: { money: 4000 }, stack: "solo_revenue", desc: "Take a freelance contract." },
    "COO": { key: "Optimize Revenue", emoji: "⚙️", cooldown: 90, effect: { money: 2500 }, stack: "solo_revenue", desc: "Operational revenue boost." },
    "Community Manager": { key: "Sponsorship Deal", emoji: "🎗️", cooldown: 120, effect: { money: 3000, users: 100 }, stack: "solo_revenue", desc: "Land a community sponsor." },
  };

  const myRoleActions = roleActions[playerData.role] || [];
  const mySoloRevenueAction = gameConfig.isSolo && soloRevenueActions[playerData.role];
  const tierColors = { 1: "#4ade80", 2: "#facc15", 3: "#ff4444", 4: "#a78bfa" };
  const tierLabels = { 1: "🟢 Opportunity", 2: "🟡 Pressure", 3: "🔴 Crisis", 4: "🟣 Wildcard" };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "1rem 1rem 5rem", minHeight: "100vh", background: difficulty.tint }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <p style={{ color: "#444", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            {playerData.name} · <span style={{ color: roleColor }}>{playerData.role}</span>
            {playerData.isSaboteur && <span style={{ color: "#ff4444" }}> · 🐀</span>}
          </p>
          <p style={{ color: "#333", fontSize: 10 }}>{difficulty.label} · {gameConfig.scenario?.name}</p>
          {quirkData && <p style={{ color: "#555", fontSize: 10 }}>{quirkData.label}</p>}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: timeLeft < 60 ? "#ff4444" : "#444", fontSize: 10 }}>TIME LEFT</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: timeLeft < 60 ? "#ff4444" : "#fff", fontFamily: "monospace" }}>
            {mins}:{secs.toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Market condition banner */}
      {marketCondition && (
        <div style={{ background: `${marketCondition.color}15`, border: `0.5px solid ${marketCondition.color}40`, borderRadius: 8, padding: "6px 12px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 11, color: marketCondition.color, fontWeight: 700 }}>{marketCondition.label}</p>
          <p style={{ fontSize: 10, color: "#555" }}>{marketCondition.desc} · {marketTimeLeft}s</p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        {[
          ["💰", "Cash", `$${money.toLocaleString()}`, money < 3000 ? "#ff4444" : "#4ade80"],
          ["👥", "Users", users.toLocaleString(), "#60a5fa"],
          ["😊", "Morale", `${Math.round(morale)}%`, morale < 30 ? "#ff4444" : morale < 60 ? "#facc15" : "#4ade80"],
        ].map(([icon, label, val, color]) => (
          <div key={label} style={{ background: "#111", border: "0.5px solid #222", borderRadius: 8, padding: "8px", textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "#444", textTransform: "uppercase", marginBottom: 3 }}>{icon} {label}</p>
            <p style={{ color, fontWeight: 700, fontSize: 15, fontFamily: "monospace" }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Passive revenue indicator */}
      {passiveRevenue > 0 && (
        <div style={{ background: "#0a1a0a", border: "0.5px solid #4ade8030", borderRadius: 6, padding: "4px 10px", marginBottom: 6, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#4ade80" }}>💰 +${passiveRevenue} passive revenue from {users} users</p>
        </div>
      )}

      {/* Reputation bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
        {Object.entries(reputation).map(([key, val]) => (
          <div key={key} style={{ background: "#111", borderRadius: 6, padding: "4px 6px" }}>
            <p style={{ fontSize: 8, color: "#444", textTransform: "uppercase", marginBottom: 3 }}>{key}</p>
            <div style={{ background: "#1a1a1a", borderRadius: 2, height: 3 }}>
              <div style={{ background: val > 60 ? "#4ade80" : val > 30 ? "#facc15" : "#ff4444", width: `${val}%`, height: "100%", borderRadius: 2, transition: "width 0.5s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Chaos tokens */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 10, color: "#444" }}>Chaos tokens:</p>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < chaosTokens ? "#a78bfa" : "#222", border: "0.5px solid #333" }} />
        ))}
        {chaosTokens > 0 && (
          <button onClick={() => { setChaosTokens(p => p - 1); setFeedback("🃏 Chaos token used! Role restriction lifted for 30s."); setTimeout(() => setFeedback(null), 3000); }}
            style={{ fontSize: 9, padding: "2px 8px", background: "#a78bfa20", color: "#a78bfa", border: "0.5px solid #a78bfa30", borderRadius: 4, cursor: "pointer" }}>
            Use token
          </button>
        )}
      </div>

      {/* Stat change overlay */}
      {recentStatChange && (
        <div style={{ background: recentStatChange.positive ? "#0a1a0a" : "#1a0808", border: `0.5px solid ${recentStatChange.positive ? "#4ade8050" : "#ff444450"}`, borderRadius: 8, padding: "8px 14px", marginBottom: 8, textAlign: "center" }}>
          <p style={{ color: recentStatChange.positive ? "#4ade80" : "#ff4444", fontSize: 14, fontWeight: 700 }}>
            {recentStatChange.positive ? "📈" : "📉"} {recentStatChange.text}
          </p>
        </div>
      )}

      {/* Activity result */}
      {activityResult && (
        <div style={{ background: activityResult.positive ? "#0a1a0a" : "#1a0808", border: `0.5px solid ${activityResult.positive ? "#4ade8050" : "#ff444450"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
          <p style={{ color: activityResult.positive ? "#4ade80" : "#ff4444", fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
            {activityResult.positive ? "✓" : "✗"} {activityResult.key} complete
          </p>
          <p style={{ color: "#888", fontSize: 13, fontWeight: 700 }}>{activityResult.changes}</p>
        </div>
      )}

      {/* Feedback toast */}
      {feedback && !recentStatChange && !activityResult && (
        <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 8, padding: "6px 12px", marginBottom: 8, color: "#ccc", fontSize: 12 }}>
          {feedback}
        </div>
      )}

      {/* Quiz modal */}
      {currentQuiz && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: "1rem" }}>
          <div style={{ background: "#0f0f0f", border: "1px solid #60a5fa50", borderRadius: 16, padding: "1.25rem", width: "100%", maxWidth: 400 }}>
            <p style={{ fontSize: 10, color: "#60a5fa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📊 Business Quiz</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 14, lineHeight: 1.5 }}>{currentQuiz.q}</p>
            {quizResult ? (
              <div>
                <p style={{ color: quizResult.correct ? "#4ade80" : "#ff4444", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  {quizResult.correct ? "✓ Correct!" : "✗ Wrong"}
                </p>
                <p style={{ color: "#888", fontSize: 11 }}>💡 {quizResult.lesson}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {currentQuiz.options.map((opt, i) => (
                  <button key={i} onClick={() => answerQuiz(i)}
                    style={{ padding: "10px 12px", background: "#111", color: "#aaa", border: "0.5px solid #333", borderRadius: 8, fontSize: 12, cursor: "pointer", textAlign: "left" }}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active event */}
      {currentEvent && (
        <div style={{ background: "#1a0a0a", border: `1px solid ${tierColors[currentEvent.tier] || "#333"}50`, borderLeft: `3px solid ${tierColors[currentEvent.tier] || "#333"}`, borderRadius: 12, padding: "1rem", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <p style={{ fontSize: 9, color: tierColors[currentEvent.tier], textTransform: "uppercase", letterSpacing: 1 }}>
              {tierLabels[currentEvent.tier] || "Event"}
            </p>
            {eventTimeLeft !== null && (
              <p style={{ fontSize: 11, color: eventTimeLeft <= 5 ? "#ff4444" : "#555", fontFamily: "monospace", fontWeight: 700 }}>
                {eventTimeLeft}s to decide
              </p>
            )}
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, lineHeight: 1.5, color: "#fff" }}>{currentEvent.text}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {currentEvent.options.map((opt, i) => (
              <button key={i} onClick={() => handleEventChoice(opt)}
                style={{ padding: "9px 14px", background: i === 0 ? "#ff4444" : "#222", color: "#fff", border: "0.5px solid #333", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Investor pitch */}
      {showInvestorPitch && !pitchResponse && (
        <div style={{ background: "#0a0f1a", border: "1px solid #60a5fa50", borderRadius: 12, padding: "1rem", marginBottom: 10 }}>
          <p style={{ fontSize: 10, color: "#60a5fa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🦈 Investor Pitch</p>
          <p style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>An investor walked in. Pitch your startup in 90 seconds.</p>
          <textarea value={pitchText} onChange={e => setPitchText(e.target.value)}
            placeholder="We are building... our customer is... our traction... we need..."
            style={{ width: "100%", height: 80, background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 12, padding: "8px", boxSizing: "border-box", resize: "none", outline: "none", marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={submitPitch} disabled={pitchLoading || !pitchText.trim()}
              style={{ flex: 1, padding: "9px", background: pitchText.trim() ? "#60a5fa" : "#222", color: pitchText.trim() ? "#000" : "#555", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: pitchText.trim() ? "pointer" : "default" }}>
              {pitchLoading ? "Judging..." : "Submit Pitch →"}
            </button>
            <button onClick={() => setShowInvestorPitch(false)}
              style={{ padding: "9px 14px", background: "#222", color: "#666", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
              Pass
            </button>
          </div>
        </div>
      )}

      {pitchResponse && (
        <div style={{ background: "#0a0f1a", border: "1px solid #60a5fa50", borderRadius: 12, padding: "1rem", marginBottom: 10 }}>
          <p style={{ fontSize: 10, color: "#60a5fa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🦈 {pitchResponse.investor} responds</p>
          <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{pitchResponse.text}</p>
          <button onClick={() => { setShowInvestorPitch(false); setPitchResponse(null); }}
            style={{ marginTop: 10, padding: "6px 14px", background: "#222", color: "#777", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
            Close
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10, background: "#111", borderRadius: 8, padding: 4 }}>
        {["actions", "log"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: "7px", background: activeTab === tab ? "#222" : "none", color: activeTab === tab ? "#fff" : "#555", border: "none", borderRadius: 6, fontSize: 12, fontWeight: activeTab === tab ? 700 : 400, cursor: "pointer", textTransform: "capitalize" }}>
            {tab === "actions" ? "⚡ Actions" : "📋 Log"}
          </button>
        ))}
      </div>

      {activeTab === "actions" && (
        <div>
          <p style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            <span style={{ color: roleColor }}>●</span> {playerData.role} Actions
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
            {myRoleActions.map(action => (
              <ActionButton key={action.key} action={action} cooldowns={cooldowns} stacks={stacks}
                onPress={() => {
                  if (action.key === "Enterprise Pitch") { setShowInvestorPitch(true); return; }
                  doAction(action.key, action.effect, action.cooldown, action.stack);
                }} roleColor={roleColor} difficulty={gameConfig.difficulty} />
            ))}
            {mySoloRevenueAction && (
              <ActionButton action={{ ...mySoloRevenueAction, cooldown: mySoloRevenueAction.cooldown }} cooldowns={cooldowns} stacks={stacks}
                onPress={() => doAction(mySoloRevenueAction.key, mySoloRevenueAction.effect, mySoloRevenueAction.cooldown, mySoloRevenueAction.stack)}
                roleColor="#facc15" difficulty={gameConfig.difficulty} />
            )}
          </div>

          <p style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Universal Actions</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
            {universalActions.map(action => (
              <ActionButton key={action.key} action={action} cooldowns={cooldowns} stacks={stacks}
                onPress={() => {
                  if (action.key === "Business Quiz") { triggerQuiz(); return; }
                  doAction(action.key, action.effect, action.cooldown, action.stack);
                }} roleColor="#555" difficulty={gameConfig.difficulty} />
            ))}
          </div>

          {!gameConfig.isSolo && !defected && (
            <button onClick={() => doAction("Defect & Go Solo", {}, 0, null)}
              style={{ width: "100%", padding: "9px", background: "#1a0808", color: "#ff4444", border: "0.5px solid #ff444430", borderRadius: 8, fontSize: 12, cursor: "pointer", marginBottom: 8 }}>
              💔 Defect & Go Solo
            </button>
          )}

          {defected && (
            <p style={{ textAlign: "center", color: "#ff4444", fontSize: 12, padding: "8px" }}>😈 You defected. Out-earn your old team to win the Judas Award.</p>
          )}
        </div>
      )}

      {activeTab === "log" && (
        <div style={{ background: "#0a0a0a", border: "0.5px solid #1a1a1a", borderRadius: 8, padding: "1rem" }}>
          <p style={{ fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Decision log</p>
          {log.length === 0 && <p style={{ color: "#333", fontSize: 12 }}>No decisions yet.</p>}
          {log.map((entry, i) => <p key={i} style={{ color: "#444", fontSize: 11, marginBottom: 5 }}>→ {entry}</p>)}
        </div>
      )}

      {/* Stacks */}
      {Object.keys(stacks).length > 0 && (
        <div style={{ marginTop: 10, background: "#0a0f0a", border: "0.5px solid #4ade8015", borderRadius: 8, padding: "8px 12px" }}>
          <p style={{ fontSize: 9, color: "#4ade8050", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Active stacks</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {Object.entries(stacks).map(([k, v]) => (
              <span key={k} style={{ fontSize: 9, background: "#4ade8010", color: "#4ade80", padding: "2px 7px", borderRadius: 4 }}>
                {k} ×{v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Combo unlocked display */}
      {comboUnlocked.length > 0 && (
        <div style={{ marginTop: 8, background: "#0f0a1a", border: "0.5px solid #a78bfa30", borderRadius: 8, padding: "8px 12px" }}>
          <p style={{ fontSize: 9, color: "#a78bfa80", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Combos unlocked</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {comboUnlocked.map(id => {
              const combo = COMBO_BONUSES.find(c => c.id === id);
              return combo ? <span key={id} style={{ fontSize: 9, background: "#a78bfa10", color: "#a78bfa", padding: "2px 7px", borderRadius: 4 }}>{combo.label}</span> : null;
            })}
          </div>
        </div>
      )}

      {/* Activity modal */}
      {activeActivity && (
        <Activity
          actionKey={activeActivity.key}
          onComplete={handleActivityComplete}
          onCancel={() => setActiveActivity(null)}
          scenario={gameConfig.scenario}
          difficulty={gameConfig.difficulty}
          quirk={playerData.quirk}
        />
      )}

      <Chat roomCode={gameConfig.roomCode} playerName={playerData.name} playerRole={playerData.role} isSaboteur={playerData.isSaboteur} />
    </div>
  );
}

function ActionButton({ action, cooldowns, stacks, onPress, roleColor, difficulty }) {
  const cd = cooldowns[action.key] || 0;
  const stackCount = stacks[action.stack] || 0;
  const onCooldown = cd > 0;
  const diffMult = { intern: 1.5, founder: 1.0, veteran: 0.8, shark: 0.6 }[difficulty] || 1.0;
  return (
    <button onClick={onPress} disabled={onCooldown}
      style={{ background: onCooldown ? "#0a0a0a" : "#111", border: `0.5px solid ${onCooldown ? "#1a1a1a" : "#222"}`, borderRadius: 8, padding: "10px", cursor: onCooldown ? "default" : "pointer", textAlign: "left", opacity: onCooldown ? 0.4 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 18 }}>{action.emoji}</span>
        {stackCount > 0 && <span style={{ fontSize: 9, background: "#4ade8015", color: "#4ade80", padding: "1px 5px", borderRadius: 3 }}>×{stackCount}</span>}
      </div>
      <p style={{ fontSize: 11, fontWeight: 500, color: onCooldown ? "#333" : "#fff", marginTop: 4, marginBottom: 2 }}>{action.key}</p>
      <p style={{ fontSize: 10, color: "#444", lineHeight: 1.3 }}>{onCooldown ? `${cd}s` : action.desc}</p>
    </button>
  );
}