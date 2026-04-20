import { useState, useEffect, useRef } from "react";
import { incrementPlayerCount } from "./firebase";
import {
  initGameState, applyGameStateDelta, subscribeToGameState,
  broadcastGameOver, subscribeToGameOver,
  broadcastCountdown, subscribeToCountdown,
  broadcastMarketCondition, subscribeToMarketCondition,
  broadcastPitchStart, subscribeToPitchStart, clearPitchStart,
  broadcastPitchResult, subscribeToPitchResult, clearPitchResult,
  broadcastPitchSuggestion, subscribeToPitchSuggestions, clearPitchSuggestions,
  setPlayerOnline, subscribeToPlayers,
  setPlayerStatus, subscribeToPlayerStatuses,
  broadcastHostTransfer, voteForNewHost, subscribeToHostTransfer, subscribeToHostVotes,
  broadcastAccusation, subscribeToAccusations,
  broadcastSystemMessage, subscribeToSystemMessages,
  broadcastDefection, subscribeToDefection,
  broadcastRivalStats, subscribeToRivalStats,
  broadcastMilestone, subscribeToMilestone,
  submitPlayerSummary,
  incrementTeamStack, subscribeToTeamStacks,
  addFeedItem, subscribeToFeed,
  broadcastEvent, submitEventVote, subscribeToCurrentEvent,
  subscribeToEventVotes, clearCurrentEvent,
} from "./firebase";
import { getEventsForScenario } from "./events";
import { sounds } from "./sounds";
import Activity, { ACTIVITY_MAP } from "./Activity";
import Chat from "./Chat";

// ─── Constants ────────────────────────────────────────────────────
const ROLE_COLORS = {
  "CEO":"#60a5fa","CFO":"#4ade80","CMO":"#facc15",
  "CTO":"#f472b6","COO":"#a78bfa",
  "Head of Sales":"#fb923c","Community Manager":"#2dd4bf",
};
const ROLE_EMOJIS = {
  "CEO":"👑","CFO":"💰","CMO":"📣","CTO":"💻","COO":"⚙️",
  "Head of Sales":"🤝","Community Manager":"🫂",
};
const DIFFICULTY_SETTINGS = {
  intern:  { label:"🎓 Intern",  startMoney:15000, eventInterval:50, consequenceMultiplier:0.5,  burnRate:150,  moraleDecay:1.5,  tint:"rgba(74,222,128,0.03)"  },
  founder: { label:"🚀 Founder", startMoney:10000, eventInterval:35, consequenceMultiplier:1.0,  burnRate:400,  moraleDecay:4.5,  tint:"transparent"            },
  veteran: { label:"⚡ Veteran", startMoney:7500,  eventInterval:25, consequenceMultiplier:1.25, burnRate:700,  moraleDecay:7.5,  tint:"rgba(251,146,60,0.04)"  },
  shark:   { label:"🦈 Shark",   startMoney:5000,  eventInterval:15, consequenceMultiplier:1.5,  burnRate:1200, moraleDecay:12,   tint:"rgba(255,68,68,0.05)"   },
};
const GAME_DURATIONS = { 5:300, 10:600, 15:900, 20:1200 };
const PERSONALITY_QUIRKS = [
  { id:"overconfident", label:"😤 Overconfident", moraleFloor:40, badMult:2.0, goodMult:1.0 },
  { id:"cautious",      label:"🤔 Cautious",      moraleFloor:0,  badMult:0.5, goodMult:0.6 },
  { id:"charismatic",   label:"😎 Charismatic",   moraleFloor:0,  badMult:1.5, goodMult:1.3 },
  { id:"paranoid",      label:"😰 Paranoid",       moraleFloor:0,  badMult:1.0, goodMult:0.8 },
  { id:"lucky",         label:"🍀 Lucky",          moraleFloor:0,  badMult:0.7, goodMult:1.0 },
  { id:"reckless",      label:"🎲 Reckless",       moraleFloor:0,  badMult:2.0, goodMult:2.0 },
  { id:"methodical",    label:"📋 Methodical",     moraleFloor:0,  badMult:1.0, goodMult:1.5 },
  { id:"wildcard",      label:"🃏 Wildcard",       moraleFloor:0,  badMult:1.0, goodMult:1.0 },
];
const ALL_MARKET_CONDITIONS = [
  { id:"recession",            label:"📉 Recession",            desc:"Revenue -30% for 90s",                        duration:90, color:"#ff4444" },
  { id:"ai_hype",              label:"🤖 AI Hype Cycle",        desc:"Tech startups get 2x users",                  duration:60, color:"#a78bfa" },
  { id:"viral_moment",         label:"🔥 Viral Moment",         desc:"Marketing actions 3x effect",                 duration:45, color:"#fb923c" },
  { id:"investor_frenzy",      label:"💰 Investor Frenzy",      desc:"Pitch success rate +50%",                     duration:60, color:"#4ade80" },
  { id:"regulatory_crackdown", label:"⚖️ Regulatory Crackdown", desc:"Paid campaigns blocked",                      duration:75, color:"#facc15" },
  { id:"talent_war",           label:"👔 Talent War",           desc:"Hiring costs 2x",                             duration:60, color:"#60a5fa" },
  { id:"market_crash",         label:"💥 Market Crash",         desc:"All money effects -50%",                      duration:60, color:"#ff4444" },
  { id:"growth_surge",         label:"🚀 Growth Surge",         desc:"All user gains doubled",                      duration:45, color:"#4ade80" },
];
const COMBO_BONUSES = [
  { id:"media_moment",    stacks:{blog:3,network:3,pitch_practice:2}, label:"📰 Media Moment!",    desc:"A journalist writes about you!",        effect:{users:1500,morale:20}  },
  { id:"sales_flywheel",  stacks:{call:8,campaign:4,email:6},         label:"🔄 Sales Flywheel!",  desc:"Auto-converting users to revenue!",     effect:{money:5000,users:500}  },
  { id:"tech_monopoly",   stacks:{ship:5,debt:3,ab:4},                label:"⚡ Tech Monopoly!",   desc:"Your product is untouchable.",          effect:{users:1000,morale:25}  },
  { id:"cult_brand",      stacks:{ama:3,outreach:4,allhands:3},       label:"🌊 Cult Brand!",      desc:"Users are evangelists now.",            effect:{users:2000,morale:30}  },
  { id:"investor_darling",stacks:{pitch_practice:4,model:3,network:4},label:"🦄 Investor Darling!",desc:"VCs are fighting over you. $30k!",     effect:{money:30000,morale:20} },
  { id:"data_empire",     stacks:{ab:6,automate:3,model:4},           label:"📊 Data Empire!",     desc:"Your data advantage is compounding.",   effect:{money:10000,users:500} },
];
const SEASONAL_EVENTS = [
  { triggerTime:0.25, event:{ id:"seasonal_1", tier:1, text:"📅 Tech conference season! Networking has double yield.", options:[{label:"Attend sessions",effect:{morale:10,users:300}},{label:"Skip it",effect:{}}] } },
  { triggerTime:0.5,  event:{ id:"seasonal_2", tier:2, text:"📈 Earnings season — investors are distracted. Pitches less effective.", options:[{label:"Wait it out",effect:{morale:5}},{label:"Pitch anyway",effect:{morale:-5}}] } },
  { triggerTime:0.75, event:{ id:"seasonal_3", tier:3, text:"🏆 Industry awards! High morale earns a nomination.", options:[{label:"Accept nomination",effect:{users:800,morale:20}},{label:"Decline — stay focused",effect:{morale:10}}] } },
];
const USER_MILESTONES  = [1000,5000,10000,50000];
const MONEY_MILESTONES = [50000,100000,250000];
const LEGITIMATE_DROPS = ["Campaign Blast","Brand Refresh","Automate Process","Hire NPC","Host AMA","Paid Campaign","Morale decay","Passive revenue","Defection","Flash Sale","Emergency Reserve"];
const QUIZ_QUESTIONS = [
  { q:"What does 'burn rate' mean?", options:["How fast you're spending money","How hot your servers run","Your marketing spend only","Revenue growth rate"], correct:0, stat:"money", amount:1000, lesson:"Burn rate is how fast a startup spends its cash reserves." },
  { q:"What is 'product-market fit'?", options:["Having a great design","When your product solves a real need at scale","Selling to the right market","Having positive reviews"], correct:1, stat:"users", amount:300, lesson:"Product-market fit: your product grows itself because users genuinely need it." },
  { q:"What does CAC stand for?", options:["Customer Acquisition Cost","Capital Asset Cost","Company Annual Cashflow","Customer Average Cart"], correct:0, stat:"money", amount:1500, lesson:"CAC: what you spend to acquire one customer. If CAC > LTV, you lose money." },
  { q:"What does LTV stand for?", options:["Long Term Value","Lifetime Value","Leverage Total Value","Last Transaction Value"], correct:1, stat:"money", amount:1500, lesson:"LTV: total revenue you expect from one customer over their lifetime." },
  { q:"What is a 'runway'?", options:["Your go-to-market plan","How long until you run out of money","Your hiring pipeline","Time to first revenue"], correct:1, stat:"morale", amount:10, lesson:"Runway = cash / burn rate. Most startups need 18+ months." },
  { q:"What is 'churn rate'?", options:["How fast you hire","How fast customers leave","Revenue growth speed","How fast you ship"], correct:1, stat:"users", amount:500, lesson:"5% monthly churn means losing half your base in a year." },
  { q:"What does B2B mean?", options:["Business to Browser","Back to Basics","Business to Business","Build to Buy"], correct:2, stat:"money", amount:1000, lesson:"B2B: selling to other businesses. Higher prices, longer sales cycles." },
  { q:"What is 'bootstrapping'?", options:["Building with no funding","Copying a competitor","Going viral organically","Building fast"], correct:0, stat:"money", amount:2000, lesson:"Bootstrapping means funding from revenue, not investors." },
  { q:"What does ARR stand for?", options:["Annual Revenue Rate","Annual Recurring Revenue","Average Refund Rate","Adjusted Revenue Ratio"], correct:1, stat:"money", amount:2000, lesson:"ARR: the predictable revenue a subscription business generates per year." },
  { q:"What is 'gross margin'?", options:["Total revenue","Revenue minus cost of goods sold","Net profit","Operating expenses"], correct:1, stat:"money", amount:2000, lesson:"Gross margin = (revenue - COGS) / revenue. SaaS targets 70-80%." },
];

function haptic(pattern = [50]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function isPositiveResult(r) {
  if (!r || typeof r !== "object") return false;
  const { money=0, users=0, morale=0 } = r;
  return (money > 0 || users > 0 || morale > 0) && !(money < -500 || users < -50 || morale < -3);
}

function tallyVotes(votes, numOptions, numPlayers, hostId, isTie=false) {
  const tally = {};
  for (let i=0; i<numOptions; i++) tally[i] = 0;
  Object.values(votes).forEach(v => { if (tally[v] !== undefined) tally[v]++; });
  const majority = Math.floor(numPlayers/2) + 1;
  for (let i=0; i<numOptions; i++) { if (tally[i] >= majority) return { tally, winner:i }; }
  if (isTie && votes[hostId] !== undefined) return { tally, winner:votes[hostId] };
  return { tally, winner:null };
}

function SharedPitchTimer({ startedAt, onExpire }) {
  const DURATION = 90;
  const elapsed  = Math.floor((Date.now() - startedAt) / 1000);
  const [seconds, setSeconds] = useState(Math.max(0, DURATION - elapsed));
  useEffect(() => {
    const t = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { clearInterval(t); onExpire && onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pct = (seconds / DURATION) * 100;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ width:60, height:4, background:"#1a1a1a", borderRadius:2 }}>
        <div style={{ width:`${pct}%`, height:"100%", background:seconds<20?"#ff4444":"#60a5fa", borderRadius:2, transition:"width 1s linear" }} />
      </div>
      <p style={{ fontSize:11, color:seconds<20?"#ff4444":"#555", fontFamily:"monospace" }}>{seconds}s</p>
    </div>
  );
}

function Toast({ message, type="info" }) {
  const colors = { info:"#555", success:"#4ade80", warning:"#facc15", danger:"#ff4444", saboteur:"#a78bfa" };
  return (
    <div style={{
      position:"fixed", top:20, left:"50%", transform:"translateX(-50%)",
      background:"#111", border:`1px solid ${colors[type]}40`,
      borderRadius:10, padding:"10px 18px", zIndex:998,
      maxWidth:"90vw", textAlign:"center",
      boxShadow:`0 4px 20px rgba(0,0,0,0.5)`,
    }}>
      <p style={{ fontSize:13, color:colors[type], fontWeight:500 }}>{message}</p>
    </div>
  );
}

export default function Game({ gameConfig, playerData, onGameOver, onExitRequest }) {
  const diff       = DIFFICULTY_SETTINGS[gameConfig.difficulty || "founder"];
  const duration   = GAME_DURATIONS[gameConfig.gameLength] || 600;
  const EVENTS     = getEventsForScenario(gameConfig?.scenario?.id || "");
  const quirk      = PERSONALITY_QUIRKS.find(q => q.id === playerData.quirk) || PERSONALITY_QUIRKS[0];
  const isSolo     = !!gameConfig.isSolo;
  const roomCode   = gameConfig.roomCode;
  const numPlayers = gameConfig.players ? Object.keys(gameConfig.players).length : 1;

  const [currentHostId, setCurrentHostId] = useState(gameConfig.hostId);
  const isHost = currentHostId === playerData.id || isSolo;

  const [money, setMoney]   = useState(diff.startMoney);
  const [users, setUsers]   = useState(0);
  const [morale, setMorale] = useState(100);

  const [defected, setDefected]               = useState(false);
  const [rivalName, setRivalName]             = useState("");
  const [rivalMoney, setRivalMoney]           = useState(0);
  const [rivalUsers, setRivalUsers]           = useState(0);
  const [rivalMorale, setRivalMorale]         = useState(0);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [defectNameInput, setDefectNameInput] = useState("");

  const [timeLeft, setTimeLeft]               = useState(duration);
  const [countdown, setCountdown]             = useState(null);
  const [gameStarted, setGameStarted]         = useState(isSolo);
  const [currentEvent, setCurrentEvent]       = useState(null);
  const [eventTimeLeft, setEventTimeLeft]     = useState(null);
  const [myVote, setMyVote]                   = useState(null);
  const [eventVotes, setEventVotes]           = useState({});
  const [voteTally, setVoteTally]             = useState({});
  const [log, setLog]                         = useState([]);
  const [feedback, setFeedback]               = useState(null);
  const [gameActive, setGameActive]           = useState(true);
  const [activeTab, setActiveTab]             = useState("actions");
  const [cooldowns, setCooldowns]             = useState({});
  const [stacks, setStacks]                   = useState({});
  const [teamStacks, setTeamStacks]           = useState({});
  const [currentQuiz, setCurrentQuiz]         = useState(null);
  const [quizResult, setQuizResult]           = useState(null);
  const [showInvestorPitch, setShowInvestorPitch] = useState(false);
  const [pitchStartedAt, setPitchStartedAt]   = useState(null);
  const [pitchText, setPitchText]             = useState("");
  const [pitchSuggestions, setPitchSuggestions] = useState([]);
  const [mySuggestion, setMySuggestion]       = useState("");
  const [pitchResponse, setPitchResponse]     = useState(null);
  const [pitchLoading, setPitchLoading]       = useState(false);
  const [pitchUsed, setPitchUsed]             = useState(false);
  const [activeActivity, setActiveActivity]   = useState(null);
  const [activityResult, setActivityResult]   = useState(null);
  const [marketCondition, setMarketCondition] = useState(null);
  const [marketTimeLeft, setMarketTimeLeft]   = useState(0);
  const [comboUnlocked, setComboUnlocked]     = useState([]);
  const [reputation, setReputation]           = useState({ investor:50, press:50, customer:50, competitor:50 });
  const [passiveRevenue, setPassiveRevenue]   = useState(0);
  const [recentStatChange, setRecentStatChange] = useState(null);
  const [statPulse, setStatPulse]             = useState(null);
  const [activityFeed, setActivityFeed]       = useState([]);
  const [onlinePlayers, setOnlinePlayers]     = useState({});
  const [playerStatuses, setPlayerStatuses]   = useState({});
  const [systemMessages, setSystemMessages]   = useState([]);
  const [milestoneFlash, setMilestoneFlash]   = useState(null);
  const [defectionAlert, setDefectionAlert]   = useState(null);
  const [toast, setToast]                     = useState(null);
  const [actionCount, setActionCount]         = useState(0);
  const [idleSeconds, setIdleSeconds]         = useState(0);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [accusations, setAccusations]         = useState([]);
  const [showAccuseModal, setShowAccuseModal] = useState(false);
  const [hostVotes, setHostVotes]             = useState({});
  const [showHostTransferModal, setShowHostTransferModal] = useState(false);
  const [endTensionShown, setEndTensionShown] = useState([]);

  const usedEventsRef      = useRef([]);
  const resolvedEventRef   = useRef(new Set());
  const gameOverFiredRef   = useRef(false);
  const reachedMilesRef    = useRef(new Set());
  const prevMoneyRef       = useRef(diff.startMoney);
  const lastActionTimeRef  = useRef(Date.now());
  const stateRef           = useRef({});
  // FIX: track mounted state to prevent setState after unmount
  const mountedRef         = useRef(true);
  // FIX: track which seasonal events have fired (stable ref, not state — avoids re-creating timer)
  const seasonalTriggeredRef = useRef([]);

  stateRef.current = { money, users, morale, gameActive, stacks, teamStacks, reputation, passiveRevenue, actionCount, defected, rivalMoney, rivalUsers, rivalMorale };

  // FIX: cleanup on unmount
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  function showToast(message, type="info", dur=3000) {
    setToast({ message, type });
    setTimeout(() => { if (mountedRef.current) setToast(null); }, dur);
  }

  function triggerStatPulse(stat) {
    setStatPulse(stat);
    setTimeout(() => { if (mountedRef.current) setStatPulse(null); }, 600);
  }

  useEffect(() => { incrementPlayerCount(); }, []);

  useEffect(() => {
    if (isSolo) return;
    setPlayerOnline(roomCode, playerData.id, true);
    const handleUnload = () => setPlayerOnline(roomCode, playerData.id, false);
    window.addEventListener("beforeunload", handleUnload);
    return () => { window.removeEventListener("beforeunload", handleUnload); setPlayerOnline(roomCode, playerData.id, false); };
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToPlayers(roomCode, players => {
      setOnlinePlayers(players);
      const host = players[currentHostId];
      if (host && host.online === false) setShowHostTransferModal(true);
    });
  }, [currentHostId]);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToHostTransfer(roomCode, newHostId => {
      setCurrentHostId(newHostId);
      setShowHostTransferModal(false);
      if (newHostId === playerData.id) showToast("👑 You are now the host!", "success");
    });
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToHostVotes(roomCode, votes => {
      setHostVotes(votes);
      const tally = {};
      Object.values(votes).forEach(v => { tally[v] = (tally[v]||0) + 1; });
      const majority = Math.floor(numPlayers/2) + 1;
      const winner = Object.entries(tally).find(([,c]) => c >= majority);
      if (winner && isHost) broadcastHostTransfer(roomCode, winner[0]);
    });
  }, [isHost]);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToPlayerStatuses(roomCode, setPlayerStatuses);
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToSystemMessages(roomCode, msgs => setSystemMessages(msgs));
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToAccusations(roomCode, setAccusations);
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToDefection(roomCode, alert => {
      if (alert.playerName !== playerData.name) {
        setDefectionAlert(alert);
        haptic([100, 50, 100]);
        setTimeout(() => { if (mountedRef.current) setDefectionAlert(null); }, 6000);
      }
    });
  }, []);

  useEffect(() => {
    if (isSolo || !defected) return;
    return subscribeToRivalStats(roomCode, playerData.id, stats => {
      if (stats) { setRivalMoney(stats.money||0); setRivalUsers(stats.users||0); setRivalMorale(stats.morale||0); }
    });
  }, [defected]);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToMilestone(roomCode, milestone => {
      if (milestone?.ts && Date.now() - milestone.ts < 8000) {
        setMilestoneFlash(milestone.message);
        haptic([200]);
        sounds.win?.();
        setTimeout(() => { if (mountedRef.current) setMilestoneFlash(null); }, 4000);
      }
    });
  }, []);

  useEffect(() => {
    if (!isSolo) return;
    USER_MILESTONES.forEach(m => {
      if (users >= m && !reachedMilesRef.current.has(`u${m}`)) {
        reachedMilesRef.current.add(`u${m}`);
        setMilestoneFlash(`🎉 ${m.toLocaleString()} users!`);
        haptic([200]);
        sounds.win?.();
        setTimeout(() => { if (mountedRef.current) setMilestoneFlash(null); }, 4000);
      }
    });
    MONEY_MILESTONES.forEach(m => {
      if (money >= m && !reachedMilesRef.current.has(`m${m}`)) {
        reachedMilesRef.current.add(`m${m}`);
        setMilestoneFlash(`💰 $${m.toLocaleString()} in the bank!`);
        haptic([200]);
        sounds.win?.();
        setTimeout(() => { if (mountedRef.current) setMilestoneFlash(null); }, 4000);
      }
    });
  }, [users, money]);

  useEffect(() => {
    if (isSolo || !isHost) return;
    initGameState(roomCode, diff.startMoney);
    let count = 3;
    broadcastCountdown(roomCode, count);
    const t = setInterval(() => {
      count--;
      broadcastCountdown(roomCode, count);
      if (count <= 0) clearInterval(t);
    }, 1000);
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToCountdown(roomCode, val => {
      setCountdown(val);
      if (val === 0) setTimeout(() => {
        if (mountedRef.current) { setGameStarted(true); setCountdown(null); }
      }, 800);
    });
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToGameState(roomCode, ({ money:m, users:u, morale:mo, lastAction:la }) => {
      const prevM = prevMoneyRef.current;
      setMoney(Math.max(0, m||0));
      setUsers(Math.max(0, u||0));
      setMorale(Math.min(100, Math.max(0, mo||0)));

      if (Math.abs((m||0) - prevM) > 1000) triggerStatPulse("money");
      if ((u||0) > 100) triggerStatPulse("users");

      if (isHost) {
        USER_MILESTONES.forEach(ms => {
          if ((u||0) >= ms && !reachedMilesRef.current.has(`u${ms}`)) {
            reachedMilesRef.current.add(`u${ms}`);
            broadcastMilestone(roomCode, `🎉 ${ms.toLocaleString()} users! The team is growing!`);
          }
        });
        MONEY_MILESTONES.forEach(ms => {
          if ((m||0) >= ms && !reachedMilesRef.current.has(`m${ms}`)) {
            reachedMilesRef.current.add(`m${ms}`);
            broadcastMilestone(roomCode, `💰 $${ms.toLocaleString()} in the bank!`);
          }
        });
        const drop = prevM - (m||0);
        if (drop > 400 && drop < 1000 && !LEGITIMATE_DROPS.some(a => (la||"").includes(a))) {
          broadcastSystemMessage(roomCode, `🔍 $${drop.toLocaleString()} drained with no explanation. Someone check the books.`, "saboteur");
        }
        if ((m||0) <= 0 && !gameOverFiredRef.current)  { triggerGameOver("bankrupt"); }
        if ((mo||0) <= 0 && !gameOverFiredRef.current) { triggerGameOver("morale");  }
      }

      prevMoneyRef.current = m||0;

      if (la && la !== playerData.name && Math.abs((m||0) - prevM) > 2000) {
        showToast(`🤝 ${la} just made a big move!`, "success");
      }
    });
  }, [isHost]);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToGameOver(roomCode, reason => {
      if (!gameOverFiredRef.current) { triggerGameOver(reason); }
    });
  }, []);

  useEffect(() => {
    if (!isHost) return;
    const t = setInterval(() => {
      if (!stateRef.current.gameActive) return;
      const mc = ALL_MARKET_CONDITIONS[Math.floor(Math.random() * ALL_MARKET_CONDITIONS.length)];
      if (isSolo) {
        setMarketCondition(mc);
        setMarketTimeLeft(mc.duration);
        sounds.event?.();
        setTimeout(() => { if (mountedRef.current) setMarketCondition(null); }, mc.duration*1000);
      } else {
        broadcastMarketCondition(roomCode, mc);
        broadcastSystemMessage(roomCode, `🌍 Market shift: ${mc.label} — ${mc.desc}`, "warning");
        sounds.event?.();
        setTimeout(() => { if (stateRef.current.gameActive) broadcastMarketCondition(roomCode, null); }, mc.duration*1000);
      }
    }, 45000 + Math.random()*30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (isSolo || isHost) return;
    return subscribeToMarketCondition(roomCode, mc => {
      if (mc) { setMarketCondition(mc); setMarketTimeLeft(Math.max(0, Math.ceil((mc.expiresAt - Date.now())/1000))); }
      else    { setMarketCondition(null); setMarketTimeLeft(0); }
    });
  }, []);

  useEffect(() => {
    if (!marketCondition || (!isSolo && !isHost)) return;
    const t = setInterval(() => setMarketTimeLeft(p => { if (p<=1) { setMarketCondition(null); return 0; } return p-1; }), 1000);
    return () => clearInterval(t);
  }, [marketCondition]);

  useEffect(() => {
    if (isSolo || isHost) return;
    return subscribeToPitchStart(roomCode, startedAt => { setPitchStartedAt(startedAt); setShowInvestorPitch(true); });
  }, []);
  useEffect(() => {
    if (isSolo || isHost) return;
    return subscribeToPitchResult(roomCode, result => { setPitchResponse(result); });
  }, []);
  useEffect(() => {
    if (isSolo || !isHost) return;
    return subscribeToPitchSuggestions(roomCode, setPitchSuggestions);
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToTeamStacks(roomCode, fbStacks => {
      setTeamStacks(fbStacks);
      if (!isHost) return;
      COMBO_BONUSES.forEach(combo => {
        if (comboUnlocked.includes(combo.id)) return;
        if (Object.entries(combo.stacks).every(([k,v]) => (fbStacks[k]||0) >= v)) {
          setComboUnlocked(prev => [...prev, combo.id]);
          applyEffect(combo.effect);
          broadcastSystemMessage(roomCode, `🎉 Team unlocked ${combo.label} ${combo.desc}`, "success");
          sounds.win?.();
        }
      });
    });
  }, [comboUnlocked, isHost]);

  useEffect(() => {
    if (!isSolo) return;
    COMBO_BONUSES.forEach(combo => {
      if (comboUnlocked.includes(combo.id)) return;
      if (Object.entries(combo.stacks).every(([k,v]) => (stacks[k]||0) >= v)) {
        setComboUnlocked(prev => [...prev, combo.id]);
        applyEffect(combo.effect);
        showFeedback(`🎉 ${combo.label} ${combo.desc}`);
        sounds.win?.();
      }
    });
  }, [stacks]);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToFeed(roomCode, items => {
      setActivityFeed(items);
      if (items.length > 0) {
        const latest = items[0];
        if (latest.playerName !== playerData.name && latest.statSummary) {
          const positive = latest.statSummary.includes("+");
          if (positive) showToast(`${ROLE_EMOJIS[latest.role]||"👤"} ${latest.playerName}: ${latest.statSummary}`, "success");
        }
      }
    });
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToCurrentEvent(roomCode, fbEvent => {
      if (!fbEvent || fbEvent.resolved) {
        setCurrentEvent(null); setEventTimeLeft(null);
        setMyVote(null); setEventVotes({}); setVoteTally({});
        return;
      }
      setCurrentEvent(fbEvent);
      setEventTimeLeft(Math.max(0, Math.ceil((fbEvent.expiresAt - Date.now())/1000)));
    });
  }, []);

  useEffect(() => {
    if (isSolo) return;
    return subscribeToEventVotes(roomCode, votes => {
      setEventVotes(votes);
      if (!currentEvent) return;
      const numOpts = currentEvent.options?.length || 2;
      const { tally, winner } = tallyVotes(votes, numOpts, numPlayers, currentHostId);
      setVoteTally(tally);
      if (winner !== null && isHost && !resolvedEventRef.current.has(currentEvent.id)) {
        resolveMultiplayerEvent(currentEvent, winner);
      }
    });
  }, [currentEvent, isHost]);

  // ─── Main timer — FIX: seasonal events checked here instead of separate interval ──
  useEffect(() => {
    if (!gameStarted) return;
    const t = setInterval(() => {
      if (!mountedRef.current) return;
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          if (isSolo) triggerGameOver("survived");
          else if (isHost) triggerGameOver("survived");
          return 0;
        }

        // End-game tension toasts
        if (prev === 61 || prev === 31) {
          const tensionSec = prev - 1;
          setEndTensionShown(p => {
            if (p.includes(tensionSec)) return p;
            showToast(`⏰ ${tensionSec} seconds left — everything counts now!`, "warning", 4000);
            haptic([100, 100, 100]);
            return [...p, tensionSec];
          });
        }

        // FIX: seasonal events checked in main timer tick — no separate interval needed
        const elapsed = (duration - prev) / duration;
        SEASONAL_EVENTS.forEach((se, i) => {
          if (!seasonalTriggeredRef.current.includes(i) && elapsed >= se.triggerTime) {
            seasonalTriggeredRef.current = [...seasonalTriggeredRef.current, i];
            if (isSolo || isHost) triggerEventObj(se.event);
          }
        });

        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameStarted, isHost]);

  useEffect(() => {
    if (!gameStarted) return;
    const t = setInterval(() => {
      if (!stateRef.current.gameActive || (!isSolo && !isHost)) return;
      if (stateRef.current.defected) {
        setRivalMoney(prev => Math.max(0, prev - diff.burnRate));
        addLog(`💸 Rival burn: -$${diff.burnRate}`);
      } else {
        applySharedDelta({ moneyDelta: -diff.burnRate }, "Cash burn", null);
        addLog(`💸 Burn: -$${diff.burnRate} (rent & salaries)`);
      }
    }, 20000);
    return () => clearInterval(t);
  }, [gameStarted, isHost]);

  useEffect(() => {
    if (!gameStarted) return;
    const t = setInterval(() => {
      if (!stateRef.current.gameActive || (!isSolo && !isHost)) return;
      if (stateRef.current.defected) {
        setRivalMorale(prev => Math.min(100, Math.max(quirk.moraleFloor, prev - diff.moraleDecay)));
      } else {
        applySharedDelta({ moraleDelta: -diff.moraleDecay }, "Morale decay", null);
      }
    }, 15000);
    return () => clearInterval(t);
  }, [gameStarted, isHost]);

  useEffect(() => {
    if (!gameStarted) return;
    const t = setInterval(() => {
      if (!stateRef.current.gameActive || (!isSolo && !isHost)) return;
      if (stateRef.current.defected) {
        const passive = Math.floor(stateRef.current.rivalUsers / 100) * 50;
        if (passive > 0) {
          setRivalMoney(prev => prev + passive);
          setPassiveRevenue(passive);
          setTimeout(() => { if (mountedRef.current) setPassiveRevenue(0); }, 2000);
        }
      } else {
        const passive = Math.floor(stateRef.current.users / 100) * 50;
        if (passive > 0) {
          applySharedDelta({ moneyDelta: passive }, "Passive revenue", null);
          setPassiveRevenue(passive);
          setTimeout(() => { if (mountedRef.current) setPassiveRevenue(0); }, 2000);
        }
      }
    }, 30000);
    return () => clearInterval(t);
  }, [gameStarted, isHost]);

  useEffect(() => {
    if (!gameStarted) return;
    const t = setInterval(() => {
      if (!stateRef.current.gameActive) return;
      const idle = Math.floor((Date.now() - lastActionTimeRef.current) / 1000);
      setIdleSeconds(idle);
      if (idle >= 30) {
        // FIX: reset the ref BEFORE setShowIdleWarning so the next tick
        // reads idle=0 and hides the warning, instead of showing it again
        lastActionTimeRef.current = Date.now();
        setShowIdleWarning(false);
        applySharedDelta({ moraleDelta: -8 }, "Inactivity", null);
        if (!isSolo) broadcastSystemMessage(roomCode, `😴 Someone on the team is idle. Get moving!`, "warning");
      } else {
        setShowIdleWarning(idle >= 20);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted || (!isSolo && !isHost)) return;
    const t = setTimeout(() => {
      if (stateRef.current.gameActive && !pitchUsed) {
        setShowInvestorPitch(true);
        if (!isSolo) { const now = Date.now(); setPitchStartedAt(now); broadcastPitchStart(roomCode); }
      }
    }, (duration / 2) * 1000);
    return () => clearTimeout(t);
  }, [gameStarted, isHost]);

  useEffect(() => {
    if (!isSolo || !currentEvent || eventTimeLeft === null) return;
    if (eventTimeLeft <= 0) {
      const worst = currentEvent.options[currentEvent.options.length - 1];
      applyEffect({ money:Math.min(0,(worst.effect.money||0)*1.5), users:Math.min(0,(worst.effect.users||0)*1.5), morale:Math.min(-10,(worst.effect.morale||0)*1.5) });
      addLog("⚠️ Ignored event — penalty");
      showFeedback("⚠️ You ignored that. Penalty applied.");
      setCurrentEvent(null); setEventTimeLeft(null);
      sounds.crisis?.(); return;
    }
    const t = setTimeout(() => setEventTimeLeft(p => p-1), 1000);
    return () => clearTimeout(t);
  }, [isSolo, currentEvent, eventTimeLeft]);

  useEffect(() => {
    if (isSolo || !currentEvent || eventTimeLeft === null) return;
    if (eventTimeLeft <= 0 && isHost && !resolvedEventRef.current.has(currentEvent.id)) {
      const numOpts = currentEvent.options?.length || 2;
      const { winner } = tallyVotes(eventVotes, numOpts, numPlayers, currentHostId, true);
      resolveMultiplayerEvent(currentEvent, winner ?? 0); return;
    }
    if (eventTimeLeft <= 0) return;
    const t = setTimeout(() => setEventTimeLeft(p => p>0?p-1:0), 1000);
    return () => clearTimeout(t);
  }, [isSolo, currentEvent, eventTimeLeft, isHost]);

  useEffect(() => {
    if (!gameStarted) return;
    const interval = diff.eventInterval * 1000;
    const t = setInterval(() => { if (stateRef.current.gameActive && (isSolo || isHost)) triggerNextEvent(); }, interval);
    const init = setTimeout(() => { if (stateRef.current.gameActive && (isSolo || isHost)) triggerNextEvent(); }, 5000);
    return () => { clearInterval(t); clearTimeout(init); };
  }, [gameStarted, isHost]);

  function triggerNextEvent() {
    const available = EVENTS.filter(e => !usedEventsRef.current.includes(e.id));
    if (!available.length) { usedEventsRef.current=[]; return; }
    const pick = available[Math.floor(Math.random() * available.length)];
    usedEventsRef.current = [...usedEventsRef.current, pick.id];
    triggerEventObj(pick);
  }

  function triggerEventObj(event) {
    sounds.event?.();
    if (event.tier >= 3) { sounds.crisis?.(); haptic([200,100,200]); }
    if (isSolo) { setCurrentEvent(event); setEventTimeLeft(20); }
    else broadcastEvent(roomCode, event);
  }

  async function resolveMultiplayerEvent(event, winnerIndex) {
    if (resolvedEventRef.current.has(event.id)) return;
    resolvedEventRef.current.add(event.id);
    const option = event.options[winnerIndex];
    applyEffect(option.effect);
    const msg = `📊 Team voted: "${option.label}"`;
    addLog(msg);
    showFeedback(`✓ ${msg}`);
    await broadcastSystemMessage(roomCode, msg, "info");
    await clearCurrentEvent(roomCode);
  }

  function handleSoloEventChoice(option) {
    sounds.event?.();
    applyEffect(option.effect);
    addLog(`Event: "${option.label}"`);
    setCurrentEvent(null); setEventTimeLeft(null);
    const e = option.effect || {};
    const parts = [];
    if ((e.money||0)!==0)  parts.push(`${e.money>0?"+":""}$${Math.abs(e.money||0).toLocaleString()}`);
    if ((e.users||0)!==0)  parts.push(`${e.users>0?"+":""}${e.users} users`);
    if ((e.morale||0)!==0) parts.push(`${e.morale>0?"+":""}${e.morale}% morale`);
    showFeedback(`✓ ${option.label}${parts.length?" · "+parts.join(" · "):""}`);
  }

  async function handleMultiplayerVote(optionIndex) {
    if (myVote !== null) return;
    setMyVote(optionIndex);
    await submitEventVote(roomCode, playerData.id, optionIndex);
    sounds.action?.();
    lastActionTimeRef.current = Date.now();
  }

  async function applySharedDelta({ moneyDelta=0, usersDelta=0, moraleDelta=0 }, actionKey, statSummary) {
    if (isSolo || defected) {
      if (defected) {
        setRivalMoney(p => Math.max(0, p+moneyDelta));
        setRivalUsers(p => Math.max(0, p+usersDelta));
        setRivalMorale(p => Math.min(100, Math.max(quirk.moraleFloor, p+moraleDelta)));
        if (!isSolo) {
          await broadcastRivalStats(roomCode, playerData.id, {
            money: Math.max(0, stateRef.current.rivalMoney+moneyDelta),
            users: Math.max(0, stateRef.current.rivalUsers+usersDelta),
            morale: Math.min(100, Math.max(quirk.moraleFloor, stateRef.current.rivalMorale+moraleDelta)),
          });
        }
      } else {
        setMoney(p => Math.max(0, p+moneyDelta));
        setUsers(p => Math.max(0, p+usersDelta));
        setMorale(p => Math.min(100, Math.max(quirk.moraleFloor, p+moraleDelta)));
      }
    } else {
      await applyGameStateDelta(roomCode, { moneyDelta, usersDelta, moraleDelta }, playerData.name, actionKey);
      if (statSummary && actionKey) await addFeedItem(roomCode, playerData.name, playerData.role, actionKey, statSummary);
    }
  }

  function applyEffect(effect, extraMult=1) {
    if (!effect) return;
    const s   = stateRef.current;
    const m   = diff.consequenceMultiplier * extraMult;
    const isNeg = (effect.money||0)<0 || (effect.users||0)<0 || (effect.morale||0)<0;
    const qMult = isNeg ? quirk.badMult : quirk.goodMult;
    const isWildcard = quirk.id==="wildcard" && Math.random()<0.2;
    const fe = isWildcard ? { money:-(effect.money||0), users:-(effect.users||0), morale:-(effect.morale||0) } : effect;
    const isLucky = quirk.id==="lucky" && Math.random()<0.3;
    const le = isLucky ? { money:Math.abs(fe.money||0), users:Math.abs(fe.users||0), morale:Math.abs(fe.morale||0) } : fe;
    const md = Math.round((le.money||0)*((le.money||0)<0?m*qMult:1));
    const ud = Math.round((le.users||0)*((le.users||0)<0?m*qMult:1));
    const od = Math.round((le.morale||0)*((le.morale||0)<0?m*qMult:1));
    const parts = [];
    if (md!==0) parts.push(`${md>0?"+":""}$${Math.abs(md).toLocaleString()}`);
    if (ud!==0) parts.push(`${ud>0?"+":""}${ud} users`);
    if (od!==0) parts.push(`${od>0?"+":""}${od}% morale`);
    const summary = parts.join(" · ");
    if (parts.length > 0) {
      const pos = md>=0 && ud>=0 && od>=0;
      setRecentStatChange({ text:summary, positive:pos });
      setTimeout(() => { if (mountedRef.current) setRecentStatChange(null); }, 3000);
      if (Math.abs(md)>1000) triggerStatPulse("money");
      if (Math.abs(ud)>100)  triggerStatPulse("users");
      if (Math.abs(od)>5)    triggerStatPulse("morale");
    }
    applySharedDelta({ moneyDelta:md, usersDelta:ud, moraleDelta:od }, null, null);
    if (isSolo && !defected) {
      if (effect.win) { triggerGameOver("acquired"); return; }
      if (Math.max(0, s.money+md) <= 0) { triggerGameOver("bankrupt"); return; }
      if (Math.min(100, Math.max(quirk.moraleFloor, s.morale+od)) <= 0) { triggerGameOver("morale"); return; }
    }
    if (defected) {
      if (Math.max(0, s.rivalMoney+md) <= 0) { triggerGameOver("bankrupt"); return; }
      if (Math.min(100, Math.max(quirk.moraleFloor, s.rivalMorale+od)) <= 0) { triggerGameOver("morale"); return; }
    }
    if (md>5000)  setReputation(p=>({...p, investor:Math.min(100,p.investor+5)}));
    if (ud>500)   setReputation(p=>({...p, customer:Math.min(100,p.customer+3)}));
    if (od>10)    setReputation(p=>({...p, press:Math.min(100,p.press+2)}));
    if (md<-5000) setReputation(p=>({...p, investor:Math.max(0,p.investor-5)}));
    if (ud<-200)  setReputation(p=>({...p, customer:Math.max(0,p.customer-5)}));
    if (isWildcard) showFeedback("🃏 Wildcard! Outcome reversed!");
    if (isLucky)    showFeedback("🍀 Lucky! Negative flipped positive!");
  }

  function addLog(msg) { setLog(prev => [msg, ...prev].slice(0, 12)); }

  function showFeedback(msg) {
    setFeedback(msg);
    setTimeout(() => { if (mountedRef.current) setFeedback(null); }, 2500);
  }

  function startCooldown(key, seconds) {
    setCooldowns(prev => ({ ...prev, [key]: seconds }));
    const t = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev, [key]: (prev[key]||0) - 1 };
        if (next[key] <= 0) { clearInterval(t); delete next[key]; sounds.cooldown_done?.(); }
        return next;
      });
    }, 1000);
  }

  function addStack(key, amount=1) {
    setStacks(prev => {
      const next = { ...prev, [key]: (prev[key]||0)+amount };
      if (quirk.id==="methodical") next[key] = Math.floor(next[key]*1.5);
      return next;
    });
    if (!isSolo) incrementTeamStack(roomCode, key, quirk.id==="methodical"?Math.ceil(amount*1.5):amount);
  }

  function bumpActionTime() {
    lastActionTimeRef.current = Date.now();
    setIdleSeconds(0);
    setShowIdleWarning(false);
    setActionCount(c => c+1);
  }

  function doAction(key, effect, cooldownSecs, stackKey) {
    if (cooldowns[key]) return;
    if (!gameStarted && !isSolo) return;
    if (ACTIVITY_MAP?.[key]) {
      setActiveActivity({ key, effect, cooldownSecs, stackKey });
      if (!isSolo) setPlayerStatus(roomCode, playerData.id, { action:key, since:Date.now() });
      bumpActionTime();
      return;
    }
    sounds.action?.();
    applyEffect(effect);
    addLog(`Action: ${key}`);
    startCooldown(key, cooldownSecs);
    if (stackKey) addStack(stackKey);
    bumpActionTime();
    showFeedback(key);
  }

  async function handleActivityComplete(result) {
    if (!activeActivity) return;
    const { key, cooldownSecs, stackKey } = activeActivity;
    setActiveActivity(null);
    if (!isSolo) setPlayerStatus(roomCode, playerData.id, null);
    bumpActionTime();
    if (!result) return;
    if (result.defect) {
      setShowDefectModal(true);
      return;
    }
    if (Object.keys(result).length > 0) {
      const md = (result.money||0)<0 ? Math.round((result.money||0)*diff.consequenceMultiplier) : (result.money||0);
      const ud = (result.users||0)<0 ? Math.round((result.users||0)*diff.consequenceMultiplier) : (result.users||0);
      const od = (result.morale||0)<0 ? Math.round((result.morale||0)*diff.consequenceMultiplier) : (result.morale||0);
      const parts = [];
      if (md!==0) parts.push(`${md>0?"+":""}$${Math.abs(md).toLocaleString()}`);
      if (ud!==0) parts.push(`${ud>0?"+":""}${ud} users`);
      if (od!==0) parts.push(`${od>0?"+":""}${od}% morale`);
      const summary = parts.join(" · ");
      const pos = isPositiveResult(result);
      if (parts.length>0) {
        setActivityResult({ key, changes:summary, positive:pos });
        setRecentStatChange({ text:summary, positive:pos });
        if (md>1000) { sounds.win?.(); haptic([100]); }
        setTimeout(() => {
          if (mountedRef.current) { setActivityResult(null); setRecentStatChange(null); }
        }, 4000);
      }
      await applySharedDelta({ moneyDelta:md, usersDelta:ud, moraleDelta:od }, key, summary);
      if (isSolo && !defected) {
        const s = stateRef.current;
        if (Math.max(0,s.money+md)<=0) { triggerGameOver("bankrupt"); return; }
        if (Math.min(100,Math.max(quirk.moraleFloor,s.morale+od))<=0) { triggerGameOver("morale"); return; }
      }
      if (defected) {
        const s = stateRef.current;
        if (Math.max(0,s.rivalMoney+md)<=0) { triggerGameOver("bankrupt"); return; }
        if (Math.min(100,Math.max(quirk.moraleFloor,s.rivalMorale+od))<=0) { triggerGameOver("morale"); return; }
      }
    }
    addLog(`${isPositiveResult(result)?"✓":"✗"} ${key}`);
    startCooldown(key, cooldownSecs);
    if (stackKey) addStack(stackKey);
  }

  async function confirmDefection() {
    if (!defectNameInput.trim()) return;
    const rName = defectNameInput.trim();
    setRivalName(rName);
    setDefected(true);
    setShowDefectModal(false);
    const rm = Math.floor(stateRef.current.money * 0.4);
    const ru = Math.floor(stateRef.current.users * 0.4);
    const ro = Math.floor(stateRef.current.morale * 0.4);
    setRivalMoney(rm); setRivalUsers(ru); setRivalMorale(ro);
    await applySharedDelta({ moneyDelta: -Math.floor(stateRef.current.money*0.6), usersDelta: -Math.floor(stateRef.current.users*0.6) }, "Defection", null);
    if (!isSolo) await broadcastDefection(roomCode, playerData.name, playerData.role, rName);
    haptic([200,100,200]);
    addLog(`💀 You founded ${rName}. No going back.`);
  }

  function triggerQuiz() {
    if (cooldowns["Business Quiz"] || currentQuiz) return;
    setCurrentQuiz(QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)]);
    setQuizResult(null);
  }

  function answerQuiz(idx) {
    if (!currentQuiz || quizResult) return;
    const correct = idx === currentQuiz.correct;
    setQuizResult({ correct, lesson:currentQuiz.lesson });
    if (correct) { applyEffect({ [currentQuiz.stat]: currentQuiz.amount }); addStack("quiz_correct"); sounds.quiz_correct?.(); }
    else { applyEffect({ morale:-5 }); sounds.quiz_wrong?.(); }
    startCooldown("Business Quiz", 30);
    setTimeout(() => {
      if (mountedRef.current) { setCurrentQuiz(null); setQuizResult(null); }
    }, 3500);
  }

  async function submitPitch() {
    if (!pitchText.trim() || pitchLoading) return;
    setPitchLoading(true); setPitchUsed(true);
    const INVESTORS = [
      { name:"Marcus Webb",  bg:"Ex-Goldman Sachs",             cares:"unit economics and clear revenue model",  dealbreaker:"founders who don't know their numbers" },
      { name:"Sandra Chen",  bg:"Ex-Google, early Stripe",      cares:"product-market fit and user growth",      dealbreaker:"vanity metrics without retention" },
      { name:"Raj Patel",    bg:"Built and sold 3 startups",    cares:"founder grit and market size",            dealbreaker:"crowded markets with no differentiation" },
      { name:"Lisa Torres",  bg:"Former YC partner",            cares:"speed of iteration and team strength",    dealbreaker:"solo founders with no technical co-founder" },
      { name:"Devon Black",  bg:"Hedge fund turned angel",      cares:"defensibility and moat",                  dealbreaker:"founders who can't explain their competitive advantage" },
    ];
    const inv = INVESTORS[Math.floor(Math.random() * INVESTORS.length)];
    const s = stateRef.current;

    // ─── Local fallback judge — used when API is unavailable ─────────
    function localPitchJudge(text) {
      const lower = text.toLowerCase();
      const wordCount = text.trim().split(/\s+/).length;
      const hasNumbers = /\$[\d,]+|[\d]+[k%]|\d+ users|\d+%/i.test(text);
      const hasAsk = /ask|raise|invest|funding|seeking/i.test(lower);
      const hasTraction = /users|customers|revenue|growth|mrr|arr|paying/i.test(lower);
      const hasMarket = /market|problem|solution|industry/i.test(lower);
      const score = (wordCount >= 20 ? 1 : 0) + (hasNumbers ? 2 : 0) + (hasAsk ? 1 : 0) + (hasTraction ? 2 : 0) + (hasMarket ? 1 : 0);
      if (score >= 5) {
        return { verdict:"DEAL", money: 35000, morale: 20, text:`${inv.name} leans forward. "You know your numbers, you have traction, and the ask is clear. I've heard a lot of pitches today — this one actually made me think. Let's do this."\n\nDEAL: $35k for 8%` };
      } else if (score >= 3) {
        return { verdict:"MAYBE", morale: 10, text:`${inv.name} tilts her head. "There's something here, but I need more. Show me the retention numbers and come back with a clearer ask. I'm not saying no."\n\nMAYBE: Bring me 3-month retention data and a revised ask` };
      } else if (score >= 2) {
        return { verdict:"COUNTER", morale: 5, text:`${inv.name} taps his pen. "I'll consider a smaller check if you can prove the unit economics. Right now this is more vision than business."\n\nCOUNTER: $10k convertible note, 20% discount, prove CAC under $50` };
      } else {
        return { verdict:"PASS", morale: -10, text:`${inv.name} glances at his phone. "I've seen a thousand pitches. This one doesn't tell me why now, why you, or why I should care. Come back with traction."\n\nPASS: No clear traction or differentiation` };
      }
    }

    try {
      const res = await fetch("/.netlify/functions/claude-proxy", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          system:`You are ${inv.name}, ${inv.bg}. You are judging a startup pitch in a game called Startup Survival.

Context: Startup is "${gameConfig.scenario?.name}". Current stats: $${s.money.toLocaleString()} cash, ${s.users} users, ${Math.round(s.morale)}% morale.
You care most about: ${inv.cares}.
Your dealbreaker: ${inv.dealbreaker}.

Rules:
- Respond in 2-3 punchy sentences reacting to their pitch specifically.
- Reference something concrete from their pitch text.
- You MUST end your response with EXACTLY one of these verdicts on its own line:
  DEAL: $[number]k for [number]%
  COUNTER: [your counteroffer in one sentence]
  PASS: [one-sentence reason]
  MAYBE: [one condition they must meet]
- Do not skip the verdict. Do not wrap it in a sentence. Put it on the last line alone.
- Even a terrible pitch gets a verdict. If it's bad, use PASS.`,
          messages:[{ role:"user", content:pitchText }],
        }),
      });

      // FIX: detect credit exhaustion (402) and other non-200s, use local fallback
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Pitch proxy error:", res.status, errData);
        if (!mountedRef.current) return;
        // Use local judge instead of "investor left the room"
        const local = localPitchJudge(pitchText);
        const result = { text: local.text, investor: inv.name };
        setPitchResponse(result);
        if (!isSolo) { await broadcastPitchResult(roomCode, result); await clearPitchStart(roomCode); await clearPitchSuggestions(roomCode); }
        _applyPitchVerdict(local.verdict, local.money, local.morale, inv);
        if (mountedRef.current) setPitchLoading(false);
        return;
      }

      const data = await res.json();

      // FIX: API-level errors (overloaded, auth, credit exhaustion) — use local fallback
      if (data.error || !data.content?.[0]?.text) {
        console.error("Anthropic API error in pitch:", data.error || "no content");
        if (!mountedRef.current) return;
        const local = localPitchJudge(pitchText);
        const result = { text: local.text, investor: inv.name };
        setPitchResponse(result);
        if (!isSolo) { await broadcastPitchResult(roomCode, result); await clearPitchStart(roomCode); await clearPitchSuggestions(roomCode); }
        _applyPitchVerdict(local.verdict, local.money, local.morale, inv);
        if (mountedRef.current) setPitchLoading(false);
        return;
      }

      const text = data.content[0].text;
      const result = { text, investor:inv.name };
      if (!mountedRef.current) return;
      setPitchResponse(result);
      if (!isSolo) { await broadcastPitchResult(roomCode, result); await clearPitchStart(roomCode); await clearPitchSuggestions(roomCode); }

      // Parse verdict — check last line first, then anywhere in text
      const lines = text.trim().split("\n");
      const lastLine = lines[lines.length - 1].trim();
      const verdictLine = [lastLine, ...lines].find(l =>
        /^(DEAL:|PASS:|COUNTER:|MAYBE:)/i.test(l.trim())
      ) || text;

      const mm = verdictLine.match(/\$(\d+)k/i);
      if (/DEAL:/i.test(verdictLine))    { _applyPitchVerdict("DEAL",    mm ? parseInt(mm[1])*1000 : 50000, 20,  inv); }
      else if (/PASS:/i.test(verdictLine))    { _applyPitchVerdict("PASS",    0, -10, inv); }
      else if (/COUNTER:/i.test(verdictLine)) { _applyPitchVerdict("COUNTER", 0,   5, inv); }
      else if (/MAYBE:/i.test(verdictLine))   { _applyPitchVerdict("MAYBE",   0,  10, inv); }
      else                                     { _applyPitchVerdict("PASS",    0,  -5, inv); }

    } catch (err) {
      console.error("submitPitch exception:", err);
      if (!mountedRef.current) return;
      const local = localPitchJudge(pitchText);
      const result = { text: local.text, investor: inv.name };
      setPitchResponse(result);
      if (!isSolo) { await broadcastPitchResult(roomCode, result).catch(()=>{}); }
      _applyPitchVerdict(local.verdict, local.money, local.morale, inv);
    }
    if (mountedRef.current) setPitchLoading(false);
  }

  function _applyPitchVerdict(verdict, money, morale, inv) {
    if (verdict === "DEAL") {
      applyEffect({ money, morale });
      setReputation(p=>({...p, investor:Math.min(100,p.investor+20)}));
      sounds.win?.(); haptic([300]);
      if (!isSolo) broadcastSystemMessage(roomCode, `🦈 ${inv.name} said DEAL! Funding secured!`, "success");
      addLog(`🦈 ${inv.name}: DEAL!`);
    } else if (verdict === "PASS") {
      applyEffect({ morale: morale || -10 });
      setReputation(p=>({...p, investor:Math.max(0,p.investor-5)}));
      sounds.fail?.();
      if (!isSolo) broadcastSystemMessage(roomCode, `🦈 ${inv.name} passed. Back to work.`, "warning");
      addLog(`🦈 ${inv.name}: Passed`);
    } else if (verdict === "COUNTER") {
      applyEffect({ morale: morale || 5 }); sounds.action?.();
      addLog(`🦈 ${inv.name}: Counter offer`);
    } else if (verdict === "MAYBE") {
      applyEffect({ morale: morale || 10 }); sounds.action?.();
      addLog(`🦈 ${inv.name}: Maybe`);
    }
  }

  async function submitSuggestion() {
    if (!mySuggestion.trim() || isHost) return;
    await broadcastPitchSuggestion(roomCode, playerData.id, playerData.name, mySuggestion.trim());
    setMySuggestion("");
  }

  // Helper: end game for everyone — host broadcasts, non-host also broadcasts so host catches it
  function triggerGameOver(reason) {
    if (gameOverFiredRef.current) return;
    gameOverFiredRef.current = true;
    if (!isSolo) {
      broadcastGameOver(roomCode, reason);
    }
    endGame(reason);
  }
    if (!stateRef.current.gameActive) return;
    setGameActive(false);
    haptic([500]);
    if (!isSolo) {
      submitPlayerSummary(roomCode, playerData.id, {
        name:playerData.name, role:playerData.role,
        isSaboteur:playerData.isSaboteur, quirk:playerData.quirk,
        actionCount:stateRef.current.actionCount,
        stacks:stateRef.current.stacks,
        defected, rivalName, rivalMoney:stateRef.current.rivalMoney,
      });
    }
    // FIX: check mountedRef before calling onGameOver after the delay
    setTimeout(() => {
      if (!mountedRef.current) return;
      onGameOver({
        money: defected ? stateRef.current.rivalMoney : stateRef.current.money,
        users: defected ? stateRef.current.rivalUsers : stateRef.current.users,
        morale: defected ? stateRef.current.rivalMorale : stateRef.current.morale,
        teamMoney: stateRef.current.money,
        reason, stacks:stateRef.current.stacks, log, defected, rivalName,
        role:playerData.role, isSaboteur:playerData.isSaboteur,
        difficulty:gameConfig.difficulty||"founder",
        scenario:gameConfig.scenario?.name||"Unknown",
        scenarioId:gameConfig.scenario?.id||"",
        reputation:stateRef.current.reputation, quirk:playerData.quirk,
        combosUnlocked:comboUnlocked, actionCount:stateRef.current.actionCount,
        roomCode: isSolo ? null : roomCode,
      });
    }, 800);
  }

  const mins = Math.floor(timeLeft/60);
  const secs = timeLeft%60;
  const roleColor  = ROLE_COLORS[playerData.role] || "#888";
  const quirkData  = PERSONALITY_QUIRKS.find(q => q.id===playerData.quirk);
  const tierColors = { 1:"#4ade80", 2:"#facc15", 3:"#ff4444", 4:"#a78bfa" };
  const tierLabels = { 1:"🟢 Opportunity", 2:"🟡 Pressure", 3:"🔴 Crisis", 4:"🟣 Wildcard" };
  const onlineCount = isSolo ? 1 : Object.values(onlinePlayers).filter(p=>p.online!==false).length;
  const critMoney = (!defected && money < 500) || (defected && rivalMoney < 500);
  const critMorale = (!defected && morale < 5) || (defected && rivalMorale < 5);
  const displayMoney  = defected ? rivalMoney  : money;
  const displayUsers  = defected ? rivalUsers  : users;
  const displayMorale = defected ? rivalMorale : morale;

  const universalActions = [
    { key:"Cold Email",        emoji:"📧", cooldown:20,  effect:{users:50},              stack:"email",         desc:"Blast cold emails." },
    { key:"Network Event",     emoji:"🤝", cooldown:45,  effect:{morale:5,money:500},    stack:"network",       desc:"Meet an NPC." },
    { key:"Blog Post",         emoji:"📰", cooldown:60,  effect:{users:30,morale:3},     stack:"blog",          desc:"Build brand authority." },
    { key:"A/B Test",          emoji:"🧪", cooldown:90,  effect:{users:100,money:500},   stack:"ab",            desc:"Data-driven improvements." },
    { key:"Attack Competitor", emoji:"⚔️", cooldown:75,  effect:{users:200},             stack:"attack",        desc:"Steal users." },
    { key:"Pitch Practice",    emoji:"🎤", cooldown:120, effect:{morale:5},              stack:"pitch_practice",desc:"Improve pitch score." },
    { key:"Product Update",    emoji:"📦", cooldown:50,  effect:{users:80,morale:5},     stack:"update",        desc:"Push an improvement." },
    { key:"Business Quiz",     emoji:"📊", cooldown:30,  effect:{},                      stack:"quiz_attempt",  desc:"Answer for stat boosts." },
  ];

  const roleActions = {
    "CEO":               [{key:"All-Hands",       emoji:"🎯",cooldown:60, effect:{morale:10},              stack:"allhands", desc:"Boost team morale."     },{key:"Fire Someone",emoji:"🔥",cooldown:120,effect:{morale:-5,money:2000},stack:"fire",   desc:"Cut dead weight."     },{key:"Pivot",       emoji:"🔄",cooldown:300,effect:{morale:10,users:300},stack:"pivot",  desc:"Change direction."    }],
    "CFO":               [{key:"Financial Model", emoji:"📈",cooldown:60, effect:{money:1000},             stack:"model",   desc:"Preview event impact." },{key:"Emergency Reserve",emoji:"🏦",cooldown:120,effect:{money:2000},stack:"reserve",desc:"Lock away funds."     },{key:"Audit Trail", emoji:"🕵️",cooldown:90,  effect:{morale:5},             stack:"audit",  desc:"Find the saboteur."   }],
    "CMO":               [{key:"Campaign Blast",  emoji:"📢",cooldown:30, effect:{users:300,money:-500},   stack:"campaign",desc:"Targeted blast."         },{key:"Brand Refresh", emoji:"🎨",cooldown:180,effect:{users:300,morale:10,money:-1000},stack:"refresh",desc:"Reset reputation."},{key:"Fake Virality",emoji:"🤳",cooldown:150,effect:{users:500},stack:"viral",desc:"50/50 viral stunt."}],
    "CTO":               [{key:"Ship Fast",       emoji:"⚡",cooldown:30, effect:{users:150,morale:5},     stack:"ship",   desc:"Build feature fast."    },{key:"Fix Tech Debt",emoji:"🐛",cooldown:90,effect:{morale:10,money:1000},stack:"debt",   desc:"Prevent crashes."     },{key:"Plant Bug",   emoji:"🪲",cooldown:120,effect:{users:300},             stack:"plantbug",desc:"Sabotage competitor."}],
    "COO":               [{key:"Automate Process",emoji:"🤖",cooldown:150,effect:{money:-2000,morale:10},  stack:"automate",desc:"Passive gains."          },{key:"Systems Audit",emoji:"🔍",cooldown:300,effect:{morale:15},stack:"sysaudit",desc:"Reveal saboteur."    },{key:"Hire NPC",    emoji:"📋",cooldown:120,effect:{money:-3000,morale:15,users:100},stack:"hire",desc:"Passive booster."}],
    "Head of Sales":     [{key:"Cold Call",       emoji:"📞",cooldown:20, effect:{money:2000,users:50},    stack:"call",   desc:"Direct revenue."        },{key:"Enterprise Pitch",emoji:"💼",cooldown:300,effect:{},stack:"enterprise",desc:"Trigger investor pitch."},{key:"Flash Sale",emoji:"🎁",cooldown:180,effect:{money:5000,users:-100},stack:"sale",desc:"Revenue spike."}],
    "Community Manager": [{key:"Host AMA",        emoji:"🎉",cooldown:90, effect:{users:200,morale:15,money:-500},stack:"ama",desc:"Community love."    },{key:"Town Hall",    emoji:"🗳️",cooldown:300,effect:{morale:20},stack:"townhall",desc:"Overrule CEO."         },{key:"Personalized Outreach",emoji:"💌",cooldown:60,effect:{users:100,morale:10},stack:"outreach",desc:"High retention."}],
  };

  const soloRevenueActions = {
    "CEO":               {key:"Close Deal",       emoji:"🤝",cooldown:90, effect:{money:3000},           stack:"solo_revenue",desc:"CEO closes a deal."},
    "CFO":               {key:"Cost Cutting",     emoji:"✂️",cooldown:60, effect:{money:2000},           stack:"solo_revenue",desc:"Cut costs."},
    "CMO":               {key:"Paid Campaign",    emoji:"💸",cooldown:45, effect:{money:1500,users:200}, stack:"solo_revenue",desc:"Run paid ads."},
    "CTO":               {key:"Freelance Gig",    emoji:"💻",cooldown:120,effect:{money:4000},           stack:"solo_revenue",desc:"Freelance contract."},
    "COO":               {key:"Optimize Revenue", emoji:"⚙️",cooldown:90, effect:{money:2500},           stack:"solo_revenue",desc:"Revenue boost."},
    "Community Manager": {key:"Sponsorship Deal", emoji:"🎗️",cooldown:120,effect:{money:3000,users:100},stack:"solo_revenue",desc:"Land a sponsor."},
  };

  const myRoleActions       = roleActions[playerData.role] || [];
  const mySoloRevenueAction = isSolo && soloRevenueActions[playerData.role];

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"1rem 1rem 6rem", minHeight:"100vh", background:diff.tint, overflowX:"hidden" }}>

      <style>{`
        @keyframes borderPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes critPulse { 0%,100%{box-shadow:0 0 0 0 #ff444400} 50%{box-shadow:0 0 0 6px #ff444430} }
        .stat-pulse { animation: borderPulse 0.6s ease-out; }
        .crit-pulse { animation: critPulse 1.2s ease-in-out infinite; }
      `}</style>

      {milestoneFlash && (
        <div style={{ position:"fixed", top:24, left:"50%", transform:"translateX(-50%)", zIndex:999, background:"#0a1a0a", border:"1px solid #4ade80", borderRadius:12, padding:"12px 24px", textAlign:"center", boxShadow:"0 4px 24px rgba(74,222,128,0.3)", maxWidth:"90vw" }}>
          <p style={{ fontSize:16, fontWeight:700, color:"#4ade80" }}>{milestoneFlash}</p>
        </div>
      )}

      {defectionAlert && (
        <div style={{ position:"fixed", top:24, left:"50%", transform:"translateX(-50%)", zIndex:999, background:"#1a0808", border:"1px solid #ff4444", borderRadius:12, padding:"12px 20px", textAlign:"center", boxShadow:"0 4px 24px rgba(255,68,68,0.3)", maxWidth:"90vw" }}>
          <p style={{ fontSize:14, fontWeight:700, color:"#ff4444" }}>😈 {defectionAlert.playerName} founded {defectionAlert.rivalName}!</p>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}

      {!gameStarted && !isSolo && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:900 }}>
          <p style={{ fontSize:11, color:"#444", textTransform:"uppercase", letterSpacing:2, marginBottom:16 }}>Game starting in</p>
          <p style={{ fontSize:80, fontWeight:700, color:countdown===0?"#4ade80":"#ff4444", fontFamily:"monospace", lineHeight:1 }}>
            {countdown === 0 ? "Go!" : countdown}
          </p>
          <p style={{ color:"#333", fontSize:12, marginTop:16 }}>Get ready — actions unlock at Go!</p>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <div>
          <p style={{ color:"#444", fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>
            {playerData.name} · <span style={{ color:roleColor }}>{playerData.role}</span>
            {playerData.isSaboteur && <span style={{ color:"#ff4444" }}> · 🐀</span>}
            {defected && <span style={{ color:"#ff4444" }}> · ⚔️ Rival</span>}
          </p>
          <p style={{ color:"#333", fontSize:10 }}>{diff.label} · {gameConfig.scenario?.name}</p>
          {quirkData && <p style={{ color:"#555", fontSize:10 }}>{quirkData.label}</p>}
          {!isSolo && <p style={{ color:"#333", fontSize:9 }}>🟢 {onlineCount}/{numPlayers} online · {roomCode}</p>}
          {defected && <p style={{ color:"#ff4444", fontSize:10, fontWeight:700 }}>⚔️ {rivalName}</p>}
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ color:timeLeft<60?"#ff4444":"#444", fontSize:10 }}>TIME LEFT</p>
          <p style={{ fontSize:22, fontWeight:700, color:timeLeft<60?"#ff4444":"#fff", fontFamily:"monospace" }}>
            {mins}:{secs.toString().padStart(2,"0")}
          </p>
          {onExitRequest && (
            <button onClick={onExitRequest} style={{ fontSize:9, color:"#333", background:"none", border:"none", cursor:"pointer", marginTop:2 }}>Leave</button>
          )}
        </div>
      </div>

      {showIdleWarning && (
        <div style={{ background:"#1a1500", border:"0.5px solid #facc1540", borderRadius:8, padding:"6px 12px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ fontSize:11, color:"#facc15" }}>⚠️ Idle warning — morale penalty in {30-idleSeconds}s</p>
          <div style={{ width:60, height:3, background:"#333", borderRadius:2 }}>
            <div style={{ width:`${(idleSeconds/30)*100}%`, height:"100%", background:"#facc15", borderRadius:2, transition:"width 1s" }} />
          </div>
        </div>
      )}

      {marketCondition && (
        <div style={{ background:`${marketCondition.color}15`, border:`0.5px solid ${marketCondition.color}40`, borderRadius:8, padding:"6px 12px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ fontSize:11, color:marketCondition.color, fontWeight:700 }}>{marketCondition.label}</p>
          <p style={{ fontSize:10, color:"#555" }}>{marketCondition.desc} · {marketTimeLeft}s</p>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:8 }}>
        {[
          ["💰","Cash",`$${displayMoney.toLocaleString()}`,displayMoney<500?"#ff4444":"#4ade80","money"],
          ["👥","Users",displayUsers.toLocaleString(),"#60a5fa","users"],
          ["😊","Morale",`${Math.round(displayMorale)}%`,displayMorale<5?"#ff4444":displayMorale<30?"#facc15":"#4ade80","morale"],
        ].map(([icon,label,val,color,key]) => (
          <div key={label}
            className={[statPulse===key?"stat-pulse":"", (key==="money"&&critMoney)||(key==="morale"&&critMorale)?"crit-pulse":""].filter(Boolean).join(" ")}
            style={{ background:"#111", border:`0.5px solid ${(key==="money"&&critMoney)||(key==="morale"&&critMorale)?"#ff4444":"#222"}`, borderRadius:8, padding:"8px", textAlign:"center" }}>
            <p style={{ fontSize:10, color:"#444", textTransform:"uppercase", marginBottom:3 }}>{icon} {label}</p>
            <p style={{ color, fontWeight:700, fontSize:15, fontFamily:"monospace" }}>{val}</p>
          </div>
        ))}
      </div>

      {defected && !isSolo && (
        <div style={{ background:"#1a0808", border:"0.5px solid #ff444430", borderRadius:8, padding:"8px 12px", marginBottom:8 }}>
          <p style={{ fontSize:9, color:"#ff4444", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>⚔️ You vs Original Team</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div>
              <p style={{ fontSize:9, color:"#ff4444", marginBottom:2 }}>{rivalName}</p>
              <p style={{ fontSize:11, fontFamily:"monospace" }}>${rivalMoney.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ fontSize:9, color:"#555", marginBottom:2 }}>Original Team</p>
              <p style={{ fontSize:11, fontFamily:"monospace" }}>${money.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {passiveRevenue > 0 && (
        <div style={{ background:"#0a1a0a", border:"0.5px solid #4ade8030", borderRadius:6, padding:"4px 10px", marginBottom:6, textAlign:"center" }}>
          <p style={{ fontSize:11, color:"#4ade80" }}>💰 +${passiveRevenue} passive revenue</p>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:4, marginBottom:8 }}>
        {Object.entries(reputation).map(([key,val]) => (
          <div key={key} style={{ background:"#111", borderRadius:6, padding:"4px 6px" }}>
            <p style={{ fontSize:8, color:"#444", textTransform:"uppercase", marginBottom:3 }}>{key}</p>
            <div style={{ background:"#1a1a1a", borderRadius:2, height:3 }}>
              <div style={{ background:val>60?"#4ade80":val>30?"#facc15":"#ff4444", width:`${val}%`, height:"100%", borderRadius:2, transition:"width 0.5s" }} />
            </div>
          </div>
        ))}
      </div>

      {!isSolo && gameConfig.roleAssignments && (() => {
        const teammates = Object.entries(gameConfig.roleAssignments)
          .filter(([pid]) => pid !== playerData.id)
          .map(([pid, a]) => ({
            pid, name:gameConfig.players?.[pid]?.name||"Player",
            role:a.role, isOnline:onlinePlayers[pid]?.online!==false,
            status:playerStatuses[pid],
          }));
        if (teammates.length === 0) return null;
        return (
          <div style={{ background:"#0a0f0a", border:"0.5px solid #4ade8020", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
            <p style={{ fontSize:9, color:"#4ade8060", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>👥 Your Team</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", flexShrink:0 }} />
                <span style={{ fontSize:10, color:roleColor, fontWeight:700 }}>{ROLE_EMOJIS[playerData.role]} {playerData.role}</span>
                <span style={{ fontSize:10, color:"#666" }}>{playerData.name} (you)</span>
                {activeActivity && <span style={{ fontSize:9, color:"#facc15", background:"#facc1515", padding:"1px 6px", borderRadius:3 }}>⚡ {activeActivity.key}</span>}
              </div>
              {teammates.map(({ pid, name, role, isOnline, status }) => (
                <div key={pid} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:isOnline?"#4ade80":"#444", flexShrink:0 }} />
                  <span style={{ fontSize:10, color:ROLE_COLORS[role]||"#888" }}>{ROLE_EMOJIS[role]||"👤"} {role}</span>
                  <span style={{ fontSize:10, color:"#555" }}>{name}</span>
                  {status?.action && <span style={{ fontSize:9, color:"#facc15", background:"#facc1515", padding:"1px 6px", borderRadius:3 }}>⚡ {status.action}</span>}
                  {!isOnline && <span style={{ fontSize:9, color:"#ff4444" }}>offline</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {!isSolo && systemMessages.length > 0 && (() => {
        const latest = systemMessages[0];
        const colors = { info:"#555", warning:"#facc15", danger:"#ff4444", success:"#4ade80", saboteur:"#a78bfa" };
        return (
          <div style={{ background:"#0f0a0a", border:`0.5px solid ${colors[latest.type]||"#333"}40`, borderRadius:8, padding:"6px 12px", marginBottom:8 }}>
            <p style={{ fontSize:11, color:colors[latest.type]||"#555" }}>{latest.message}</p>
          </div>
        );
      })()}

      {!isSolo && activityFeed.length > 0 && (
        <div style={{ background:"#0a0f0a", border:"0.5px solid #4ade8015", borderRadius:8, padding:"8px 12px", marginBottom:8 }}>
          <p style={{ fontSize:9, color:"#4ade8060", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>🔴 Team activity</p>
          {activityFeed.slice(0,3).map(item => (
            <p key={item.id} style={{ fontSize:10, color:"#555", marginBottom:3 }}>
              <span style={{ color:ROLE_COLORS[item.role]||"#888" }}>{item.playerName}</span>
              {" · "}{item.actionKey}
              {item.statSummary ? <span style={{ color:"#4ade80" }}> {item.statSummary}</span> : ""}
            </p>
          ))}
        </div>
      )}

      {recentStatChange && (
        <div style={{ background:recentStatChange.positive?"#0a1a0a":"#1a0808", border:`0.5px solid ${recentStatChange.positive?"#4ade8050":"#ff444450"}`, borderRadius:8, padding:"8px 14px", marginBottom:8, textAlign:"center" }}>
          <p style={{ color:recentStatChange.positive?"#4ade80":"#ff4444", fontSize:14, fontWeight:700 }}>{recentStatChange.positive?"📈":"📉"} {recentStatChange.text}</p>
        </div>
      )}

      {activityResult && (
        <div style={{ background:activityResult.positive?"#0a1a0a":"#1a0808", border:`0.5px solid ${activityResult.positive?"#4ade8050":"#ff444450"}`, borderRadius:8, padding:"10px 14px", marginBottom:8 }}>
          <p style={{ color:activityResult.positive?"#4ade80":"#ff4444", fontSize:12, fontWeight:700, marginBottom:2 }}>{activityResult.positive?"✓":"✗"} {activityResult.key} complete</p>
          <p style={{ color:"#888", fontSize:13, fontWeight:700 }}>{activityResult.changes}</p>
        </div>
      )}

      {feedback && !recentStatChange && !activityResult && (
        <div style={{ background:"#1a1a1a", border:"0.5px solid #333", borderRadius:8, padding:"6px 12px", marginBottom:8, color:"#ccc", fontSize:12 }}>{feedback}</div>
      )}

      {currentQuiz && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:400, padding:"1.5rem" }}>
          <div style={{ background:"#0f0f0f", border:"1px solid #60a5fa50", borderRadius:16, padding:"1.25rem", width:"100%", maxWidth:400 }}>
            <p style={{ fontSize:10, color:"#60a5fa", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>📊 Business Quiz</p>
            <p style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:14, lineHeight:1.5 }}>{currentQuiz.q}</p>
            {quizResult ? (
              <div>
                <p style={{ color:quizResult.correct?"#4ade80":"#ff4444", fontSize:13, fontWeight:700, marginBottom:6 }}>{quizResult.correct?"✓ Correct!":"✗ Wrong"}</p>
                <p style={{ color:"#888", fontSize:11 }}>💡 {quizResult.lesson}</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {currentQuiz.options.map((opt,i) => (
                  <button key={i} onClick={() => answerQuiz(i)} style={{ padding:"12px 14px", background:"#111", color:"#aaa", border:"0.5px solid #333", borderRadius:8, fontSize:13, cursor:"pointer", textAlign:"left", minHeight:48 }}>{opt}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {currentEvent && (() => {
        const color = tierColors[currentEvent.tier] || "#333";
        const totalVotes = Object.keys(eventVotes).length;
        return (
          <div style={{ background:"#1a0a0a", border:`1px solid ${color}50`, borderLeft:`3px solid ${color}`, borderRadius:12, padding:"1rem", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <p style={{ fontSize:9, color, textTransform:"uppercase", letterSpacing:1 }}>{tierLabels[currentEvent.tier]||"Event"}</p>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {!isSolo && <p style={{ fontSize:10, color:"#555" }}>👥 {totalVotes}/{numPlayers} voted</p>}
                {eventTimeLeft !== null && <p style={{ fontSize:11, color:eventTimeLeft<=5?"#ff4444":"#555", fontFamily:"monospace", fontWeight:700 }}>{eventTimeLeft}s</p>}
              </div>
            </div>
            <p style={{ fontSize:13, fontWeight:500, marginBottom:12, lineHeight:1.5, color:"#fff" }}>{currentEvent.text}</p>
            {isSolo ? (
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {currentEvent.options.map((opt,i) => (
                  <button key={i} onClick={() => handleSoloEventChoice(opt)} style={{ padding:"11px 14px", background:i===0?"#ff4444":"#222", color:"#fff", border:"0.5px solid #333", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", textAlign:"left", minHeight:48 }}>{opt.label}</button>
                ))}
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {currentEvent.options.map((opt,i) => {
                  const vc = voteTally[i]||0;
                  const pct = numPlayers>0?Math.round((vc/numPlayers)*100):0;
                  const iMine = myVote===i;
                  const leading = vc>0 && vc===Math.max(...Object.values(voteTally));
                  return (
                    <button key={i} onClick={() => handleMultiplayerVote(i)} disabled={myVote!==null}
                      style={{ padding:"11px 14px", background:iMine?"#ff4444":"#222", color:"#fff", border:`0.5px solid ${iMine?"#ff4444":leading?"#facc1550":"#333"}`, borderRadius:8, fontSize:12, cursor:myVote===null?"pointer":"default", textAlign:"left", position:"relative", overflow:"hidden", minHeight:48 }}>
                      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${pct}%`, background:iMine?"#ff444430":"#ffffff10", transition:"width 0.5s" }} />
                      <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span>{opt.label}{iMine?" ✓":""}</span>
                        <span style={{ fontSize:10, color:"#888" }}>{vc>0?`${vc} vote${vc>1?"s":""}`:""}</span>
                      </div>
                    </button>
                  );
                })}
                {myVote!==null && (
                  <p style={{ fontSize:10, color:"#555", textAlign:"center", marginTop:4 }}>
                    {isHost?"Waiting for votes — you'll resolve ties.":"Vote cast. Waiting for team..."}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {showInvestorPitch && !pitchResponse && (isHost||isSolo) && (
        <div style={{ background:"#0a0f1a", border:"1px solid #60a5fa50", borderRadius:12, padding:"1rem", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <p style={{ fontSize:10, color:"#60a5fa", textTransform:"uppercase", letterSpacing:1 }}>🦈 Investor Pitch</p>
            <SharedPitchTimer startedAt={pitchStartedAt||Date.now()} onExpire={() => setShowInvestorPitch(false)} />
          </div>
          {!isSolo && <p style={{ fontSize:11, color:"#facc15", marginBottom:6 }}>👑 Pitch on behalf of the team. Check teammate suggestions below.</p>}
          <textarea value={pitchText} onChange={e=>setPitchText(e.target.value)}
            placeholder="We are building [X] for [Y customers]. We have [Z traction]. We're asking for $[amount] to [goal]..."
            style={{ width:"100%", height:90, background:"#111", border:"0.5px solid #333", borderRadius:8, color:"#fff", fontSize:13, padding:"10px", boxSizing:"border-box", resize:"none", outline:"none", marginBottom:8 }} />
          {!isSolo && pitchSuggestions.length > 0 && (
            <div style={{ background:"#111", borderRadius:8, padding:"8px 10px", marginBottom:8 }}>
              <p style={{ fontSize:9, color:"#555", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>💬 Team suggestions</p>
              {pitchSuggestions.map(s => (
                <div key={s.id} style={{ marginBottom:4 }}>
                  <p style={{ fontSize:10, color:"#60a5fa", marginBottom:1 }}>{s.playerName}:</p>
                  <p style={{ fontSize:11, color:"#888" }}>{s.text}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={submitPitch} disabled={pitchLoading||!pitchText.trim()}
              style={{ flex:1, padding:"12px", background:pitchText.trim()?"#60a5fa":"#222", color:pitchText.trim()?"#000":"#555", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:pitchText.trim()?"pointer":"default", minHeight:48 }}>
              {pitchLoading?"Judging...":"Submit Pitch →"}
            </button>
            <button onClick={() => { setShowInvestorPitch(false); if (!isSolo) { clearPitchStart(roomCode); clearPitchSuggestions(roomCode); } }}
              style={{ padding:"12px 16px", background:"#222", color:"#666", border:"none", borderRadius:8, fontSize:13, cursor:"pointer", minHeight:48 }}>Pass</button>
          </div>
        </div>
      )}

      {showInvestorPitch && !pitchResponse && !isHost && !isSolo && (
        <div style={{ background:"#0a0f1a", border:"1px solid #60a5fa50", borderRadius:12, padding:"1rem", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <p style={{ fontSize:12, color:"#60a5fa", fontWeight:700 }}>🦈 Investor Pitch in progress</p>
            {pitchStartedAt && <SharedPitchTimer startedAt={pitchStartedAt} />}
          </div>
          <p style={{ fontSize:11, color:"#555", marginBottom:10 }}>The host is pitching. Suggest a line below — they can see it in real time.</p>
          <div style={{ display:"flex", gap:6 }}>
            <input value={mySuggestion} onChange={e=>setMySuggestion(e.target.value)}
              placeholder="Suggest a pitch line..."
              style={{ flex:1, padding:"10px", background:"#111", border:"0.5px solid #333", borderRadius:8, color:"#fff", fontSize:12, outline:"none", minHeight:44 }} />
            <button onClick={submitSuggestion} disabled={!mySuggestion.trim()}
              style={{ padding:"10px 16px", background:mySuggestion.trim()?"#60a5fa":"#222", color:mySuggestion.trim()?"#000":"#555", border:"none", borderRadius:8, fontSize:12, cursor:mySuggestion.trim()?"pointer":"default", minHeight:44 }}>Send</button>
          </div>
        </div>
      )}

      {pitchResponse && (
        <div style={{ background:"#0a0f1a", border:"1px solid #60a5fa50", borderRadius:12, padding:"1rem", marginBottom:10 }}>
          <p style={{ fontSize:10, color:"#60a5fa", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>🦈 {pitchResponse.investor} responds</p>
          <p style={{ fontSize:13, color:"#ccc", lineHeight:1.6 }}>{pitchResponse.text}</p>
          <button onClick={() => { setShowInvestorPitch(false); setPitchResponse(null); if (!isSolo) clearPitchResult(roomCode); }}
            style={{ marginTop:10, padding:"8px 16px", background:"#222", color:"#777", border:"none", borderRadius:6, fontSize:12, cursor:"pointer", minHeight:44 }}>Close</button>
        </div>
      )}

      {showDefectModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:"1.5rem" }}>
          <div style={{ background:"#111", border:"1px solid #ff444450", borderRadius:16, padding:"1.5rem", width:"100%", maxWidth:360, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>😈</div>
            <h2 style={{ fontSize:18, fontWeight:700, color:"#ff4444", marginBottom:8 }}>Betray the Company?</h2>
            <p style={{ color:"#555", fontSize:12, lineHeight:1.6, marginBottom:16 }}>
              You'll keep 40% of current stats and compete solo. If your final score beats the team's, you win. There's no going back.
            </p>
            <input value={defectNameInput} onChange={e=>setDefectNameInput(e.target.value)}
              placeholder="Name your rival company..."
              style={{ width:"100%", padding:"12px", background:"#1a1a1a", border:"0.5px solid #333", borderRadius:8, color:"#fff", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:12 }} />
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowDefectModal(false)} style={{ flex:1, padding:"13px", background:"#1a1a1a", color:"#aaa", border:"0.5px solid #333", borderRadius:8, fontSize:13, cursor:"pointer", minHeight:48 }}>Cancel</button>
              <button onClick={confirmDefection} disabled={!defectNameInput.trim()} style={{ flex:1, padding:"13px", background:defectNameInput.trim()?"#ff4444":"#333", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:defectNameInput.trim()?"pointer":"default", minHeight:48 }}>Defect</button>
            </div>
          </div>
        </div>
      )}

      {showHostTransferModal && !isSolo && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:"1.5rem" }}>
          <div style={{ background:"#111", border:"1px solid #facc1550", borderRadius:16, padding:"1.5rem", width:"100%", maxWidth:360, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
            <h2 style={{ fontSize:16, fontWeight:700, color:"#facc15", marginBottom:8 }}>Host Disconnected</h2>
            <p style={{ color:"#555", fontSize:12, lineHeight:1.6, marginBottom:16 }}>Vote for a new host. Whoever gets majority takes over event resolution and pitching.</p>
            {Object.entries(gameConfig.roleAssignments||{})
              .filter(([pid]) => pid !== gameConfig.hostId && onlinePlayers[pid]?.online !== false)
              .map(([pid, a]) => {
                const name = gameConfig.players?.[pid]?.name || a.role;
                const votes = Object.values(hostVotes).filter(v=>v===pid).length;
                return (
                  <button key={pid} onClick={() => voteForNewHost(roomCode, playerData.id, pid)}
                    style={{ width:"100%", padding:"12px", background:"#1a1a1a", border:`0.5px solid ${hostVotes[playerData.id]===pid?"#facc15":"#333"}`, borderRadius:8, marginBottom:8, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", minHeight:48 }}>
                    <span style={{ fontSize:13, color:"#fff" }}>{ROLE_EMOJIS[a.role]} {name} ({a.role})</span>
                    <span style={{ fontSize:11, color:"#facc15" }}>{votes} vote{votes!==1?"s":""}</span>
                  </button>
                );
              })
            }
          </div>
        </div>
      )}

      {showAccuseModal && !isSolo && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:"1.5rem" }}>
          <div style={{ background:"#111", border:"1px solid #a78bfa50", borderRadius:16, padding:"1.5rem", width:"100%", maxWidth:360 }}>
            <div style={{ fontSize:28, textAlign:"center", marginBottom:10 }}>🚨</div>
            <h2 style={{ fontSize:15, fontWeight:700, color:"#a78bfa", marginBottom:8, textAlign:"center" }}>Report Suspicious Activity</h2>
            <p style={{ color:"#555", fontSize:11, lineHeight:1.6, marginBottom:14, textAlign:"center" }}>This will ping the whole team. Who do you suspect?</p>
            {Object.entries(gameConfig.roleAssignments||{})
              .filter(([pid]) => pid !== playerData.id)
              .map(([pid, a]) => {
                const name = gameConfig.players?.[pid]?.name || a.role;
                return (
                  <button key={pid}
                    onClick={() => { broadcastAccusation(roomCode, playerData.id, playerData.name, pid, name); setShowAccuseModal(false); }}
                    style={{ width:"100%", padding:"12px", background:"#1a1a1a", border:"0.5px solid #333", borderRadius:8, marginBottom:8, cursor:"pointer", textAlign:"left", minHeight:48 }}>
                    <span style={{ fontSize:13, color:ROLE_COLORS[a.role]||"#888" }}>{ROLE_EMOJIS[a.role]} {name} ({a.role})</span>
                  </button>
                );
              })
            }
            <button onClick={() => setShowAccuseModal(false)} style={{ width:"100%", padding:"11px", background:"#222", color:"#555", border:"none", borderRadius:8, fontSize:12, cursor:"pointer", marginTop:4, minHeight:44 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:4, marginBottom:10, background:"#111", borderRadius:8, padding:4 }}>
        {["actions","log"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex:1, padding:"9px", background:activeTab===tab?"#222":"none", color:activeTab===tab?"#fff":"#555", border:"none", borderRadius:6, fontSize:12, fontWeight:activeTab===tab?700:400, cursor:"pointer", minHeight:44 }}>
            {tab==="actions"?"⚡ Actions":"📋 Log"}
          </button>
        ))}
      </div>

      {activeTab === "actions" && (
        <div>
          <p style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
            <span style={{ color:roleColor }}>●</span> {playerData.role} Actions
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
            {myRoleActions.map(action => (
              <ActionButton key={action.key} action={action} cooldowns={cooldowns} stacks={stacks} roleColor={roleColor}
                onPress={() => { if (action.key==="Enterprise Pitch") { setShowInvestorPitch(true); return; } doAction(action.key,action.effect,action.cooldown,action.stack); }}
                locked={!gameStarted&&!isSolo} />
            ))}
            {mySoloRevenueAction && (
              <ActionButton action={mySoloRevenueAction} cooldowns={cooldowns} stacks={stacks} roleColor="#facc15"
                onPress={() => doAction(mySoloRevenueAction.key,mySoloRevenueAction.effect,mySoloRevenueAction.cooldown,mySoloRevenueAction.stack)}
                locked={!gameStarted&&!isSolo} />
            )}
          </div>

          <p style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Universal Actions</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
            {universalActions.map(action => (
              <ActionButton key={action.key} action={action} cooldowns={cooldowns} stacks={stacks} roleColor="#555"
                onPress={() => { if (action.key==="Business Quiz") { triggerQuiz(); return; } doAction(action.key,action.effect,action.cooldown,action.stack); }}
                locked={!gameStarted&&!isSolo} />
            ))}
          </div>

          {!isSolo && !defected && (
            <button onClick={() => setShowDefectModal(true)} style={{ width:"100%", padding:"11px", background:"#1a0808", color:"#ff4444", border:"0.5px solid #ff444430", borderRadius:8, fontSize:12, cursor:"pointer", marginBottom:8, minHeight:44 }}>
              💔 Defect & Found Rival Company
            </button>
          )}
          {defected && <p style={{ textAlign:"center", color:"#ff4444", fontSize:12, padding:"8px" }}>😈 You defected. Out-score your old team.</p>}

          {!isSolo && (
            <button onClick={() => setShowAccuseModal(true)} style={{ width:"100%", padding:"9px", background:"#0f0a1a", color:"#a78bfa", border:"0.5px solid #a78bfa30", borderRadius:8, fontSize:11, cursor:"pointer", minHeight:44 }}>
              🚨 Report Suspicious Activity
            </button>
          )}
        </div>
      )}

      {activeTab === "log" && (
        <div style={{ background:"#0a0a0a", border:"0.5px solid #1a1a1a", borderRadius:8, padding:"1rem" }}>
          <p style={{ fontSize:10, color:"#333", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Decision log</p>
          {log.length===0 && <p style={{ color:"#333", fontSize:12 }}>No decisions yet.</p>}
          {log.map((entry,i) => <p key={i} style={{ color:"#444", fontSize:11, marginBottom:5 }}>→ {entry}</p>)}
        </div>
      )}

      {(() => {
        const ds = isSolo ? stacks : teamStacks;
        return Object.keys(ds).length > 0 ? (
          <div style={{ marginTop:10, background:"#0a0f0a", border:"0.5px solid #4ade8015", borderRadius:8, padding:"8px 12px" }}>
            <p style={{ fontSize:9, color:"#4ade8050", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>
              {isSolo?"Active stacks":"Team stacks"}
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {Object.entries(ds).map(([k,v]) => (
                <span key={k} style={{ fontSize:9, background:"#4ade8010", color:"#4ade80", padding:"2px 7px", borderRadius:4 }}>{k} ×{v}</span>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {comboUnlocked.length > 0 && (
        <div style={{ marginTop:8, background:"#0f0a1a", border:"0.5px solid #a78bfa30", borderRadius:8, padding:"8px 12px" }}>
          <p style={{ fontSize:9, color:"#a78bfa80", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Combos unlocked</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {comboUnlocked.map(id => {
              const c = COMBO_BONUSES.find(x=>x.id===id);
              return c ? <span key={id} style={{ fontSize:9, background:"#a78bfa10", color:"#a78bfa", padding:"2px 7px", borderRadius:4 }}>{c.label}</span> : null;
            })}
          </div>
        </div>
      )}

      {activeActivity && (
        <Activity
          actionKey={activeActivity.key}
          onComplete={handleActivityComplete}
          onCancel={() => { setActiveActivity(null); if (!isSolo) setPlayerStatus(roomCode, playerData.id, null); }}
          scenario={gameConfig.scenario}
          difficulty={gameConfig.difficulty}
          quirk={playerData.quirk}
        />
      )}

      <Chat
        roomCode={roomCode}
        playerName={playerData.name}
        playerRole={playerData.role}
        isSaboteur={playerData.isSaboteur}
        onReport={() => setShowAccuseModal(true)}
      />
    </div>
  );


function ActionButton({ action, cooldowns, stacks, onPress, roleColor, locked }) {
  const cd = cooldowns[action.key] || 0;
  const sc = stacks[action.stack] || 0;
  const disabled = cd > 0 || locked;
  return (
    <button onClick={onPress} disabled={disabled}
      style={{ background:disabled?"#0a0a0a":"#111", border:`0.5px solid ${disabled?"#1a1a1a":"#222"}`, borderRadius:8, padding:"10px", cursor:disabled?"default":"pointer", textAlign:"left", opacity:disabled?0.4:1, minHeight:80 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <span style={{ fontSize:20 }}>{action.emoji}</span>
        {sc>0 && <span style={{ fontSize:9, background:"#4ade8015", color:"#4ade80", padding:"1px 5px", borderRadius:3 }}>×{sc}</span>}
      </div>
      <p style={{ fontSize:11, fontWeight:500, color:disabled?"#333":"#fff", marginTop:4, marginBottom:2 }}>{action.key}</p>
      <p style={{ fontSize:10, color:"#444", lineHeight:1.3 }}>
        {locked ? "Starting..." : cd>0 ? `${cd}s` : action.desc}
      </p>
    </button>
  );
}