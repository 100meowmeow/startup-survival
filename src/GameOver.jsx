import { useState, useEffect } from "react";
import ResultCard from "./ResultCard";
import { sounds } from "./sounds";
import { submitScore, unlockScore, getRealRank, getTopScores } from "./firebase";

const TITLES = [
  { id: "corporate_rat",  label: "🐀 Corporate Rat",       explanation: "You were the Saboteur and successfully tanked the company without getting caught.",            condition: (s) => s.isSaboteur && s.reason !== "survived" },
  { id: "deep_cover",     label: "🕵️ Deep Cover",           explanation: "You were the Saboteur and survived to the end undetected.",                                    condition: (s) => s.isSaboteur && s.reason === "survived" },
  { id: "silent_deadly",  label: "🐍 Silently Deadly",      explanation: "You drained company resources repeatedly without ever being caught.",                           condition: (s) => s.isSaboteur && (s.stacks?.drain || 0) >= 3 },
  { id: "judas",          label: "💔 Judas Award",          explanation: "You betrayed your team AND outperformed them.",                                                  condition: (s) => s.defected && s.money > 20000 },
  { id: "first_quit",     label: "🏃 First to Quit",        explanation: "You defected and abandoned your team.",                                                         condition: (s) => s.defected },
  { id: "clown",          label: "🤡 Clown Founder",        explanation: "You went bankrupt while chasing viral moments.",                                                 condition: (s) => s.reason === "bankrupt" && (s.stacks?.viral || 0) > 0 },
  { id: "self_destruct",  label: "🧨 Self Destruct",        explanation: "Your own flash sale strategy bankrupted you.",                                                   condition: (s) => s.reason === "bankrupt" && (s.stacks?.sale || 0) > 2 },
  { id: "killed_it",      label: "💀 Killed the Company",   explanation: "As CEO, the final decision that ended the company was yours.",                                  condition: (s) => ["bankrupt","morale"].includes(s.reason) && s.role === "CEO" },
  { id: "pr_disaster",    label: "📸 PR Disaster",          explanation: "Your fake viral attempts kept backfiring publicly.",                                             condition: (s) => (s.stacks?.viral || 0) >= 3 && s.reason !== "survived" },
  { id: "worst_cfo",      label: "💸 World's Worst CFO",    explanation: "As CFO you're supposed to protect the money — instead you watched it disappear.",               condition: (s) => s.role === "CFO" && s.money < 2000 },
  { id: "gambler",        label: "🎰 Gambling Addict",      explanation: "You chased high-risk plays constantly.",                                                         condition: (s) => (s.stacks?.viral || 0) + (s.stacks?.plantbug || 0) >= 5 },
  { id: "delusional",     label: "🔮 Delusional Visionary", explanation: "You pivoted so many times the company lost all identity.",                                       condition: (s) => (s.stacks?.pivot || 0) >= 3 },
  { id: "ghost",          label: "👻 Ghost Employee",       explanation: "You were barely present.",                                                                       condition: (s) => Object.values(s.stacks || {}).reduce((a,b) => a+b, 0) < 5 },
  { id: "yes_man",        label: "🫡 Yes Man",              explanation: "You always voted with the majority and never deviated.",                                          condition: (s) => s.reason === "survived" && (s.stacks?.pivot || 0) === 0 && Object.values(s.stacks || {}).reduce((a,b) => a+b, 0) < 15 },
  { id: "actual_ceo",     label: "👑 Actual CEO Material",  explanation: "You led well, made smart calls, and the company survived.",                                      condition: (s) => s.reason === "survived" && s.role === "CEO" && s.money > 20000 },
  { id: "unicorn",        label: "🦄 Unicorn Energy",       explanation: "You hit $100k. Only 0.006% of startups become unicorns.",                                       condition: (s) => s.money > 100000 },
  { id: "overachiever",   label: "🏅 Overachiever",         explanation: "You hit every win condition simultaneously.",                                                    condition: (s) => s.reason === "survived" && s.money > 50000 && s.users > 3000 && s.morale > 70 },
  { id: "hypergrowth",    label: "🚀 Hypergrowth Hero",     explanation: "You scaled your user base to over 5,000.",                                                       condition: (s) => s.users > 5000 },
  { id: "comeback",       label: "🌟 Comeback Kid",         explanation: "You were nearly dead and pulled through anyway.",                                                condition: (s) => s.reason === "survived" && s.morale > 70 && s.money > 10000 },
  { id: "chess",          label: "🧠 5D Chess Player",      explanation: "You built a stacking chain so deep it compounded into a massive advantage.",                    condition: (s) => Object.values(s.stacks || {}).some(v => v >= 8) },
  { id: "combo_master",   label: "🔗 Combo Master",         explanation: "You discovered and unlocked secret action combinations.",                                        condition: (s) => (s.combosUnlocked || []).length >= 2 },
  { id: "ice_closer",     label: "🧊 Ice Cold Closer",      explanation: "You closed deal after deal without flinching.",                                                  condition: (s) => (s.stacks?.call || 0) >= 8 },
  { id: "machine",        label: "⚙️ The Machine",          explanation: "You automated everything you could.",                                                            condition: (s) => (s.stacks?.automate || 0) >= 3 },
  { id: "diplomat",       label: "🤝 The Diplomat",         explanation: "You kept the team together through all-hands meetings and AMAs.",                                condition: (s) => (s.stacks?.allhands || 0) + (s.stacks?.ama || 0) >= 5 },
  { id: "mba_who",        label: "🧑‍🎓 MBA Who?",            explanation: "You aced every business question thrown at you.",                                              condition: (s) => (s.stacks?.quiz_correct || 0) >= 8 },
  { id: "mad_scientist",  label: "🧬 Mad Scientist",        explanation: "You ran A/B test after A/B test.",                                                               condition: (s) => (s.stacks?.ab || 0) >= 6 },
  { id: "innovative",     label: "💡 Actually Innovative",  explanation: "You shipped feature after feature.",                                                             condition: (s) => (s.stacks?.ship || 0) + (s.stacks?.update || 0) >= 8 },
  { id: "laser",          label: "🎯 Laser Focused",        explanation: "You picked a strategy and never deviated.",                                                      condition: (s) => s.reason === "survived" && (s.stacks?.call || 0) >= 5 },
  { id: "vibes",          label: "🌊 Vibes Only",           explanation: "Your team loved working together but the bank account told a different story.",                  condition: (s) => s.morale >= 85 && s.money < 8000 },
  { id: "penny",          label: "🧻 Penny Pincher",        explanation: "You held onto cash like your life depended on it.",                                              condition: (s) => s.money > 15000 && (s.stacks?.model || 0) >= 2 },
  { id: "bot_energy",     label: "🤖 Bot Energy",           explanation: "You took more actions than any human reasonably should.",                                        condition: (s) => Object.values(s.stacks || {}).reduce((a,b) => a+b, 0) > 35 },
  { id: "too_nice",       label: "😇 Too Nice to Win",      explanation: "Maximum morale, minimum money.",                                                                 condition: (s) => s.morale >= 95 && s.money < 5000 },
  { id: "market_reader",  label: "📊 Market Reader",        explanation: "You timed your actions around market conditions.",                                               condition: (s) => s.reason === "survived" && s.money > 30000 },
  { id: "reputation_king",label: "🌟 Reputation King",      explanation: "You built trust with investors, press, and customers simultaneously.",                           condition: (s) => s.reputation && Object.values(s.reputation).every(v => v >= 70) },
  { id: "chaos_agent",    label: "🎭 Chaos Agent",          explanation: "Your wildcard quirk triggered constantly and somehow you still survived.",                       condition: (s) => s.quirk === "wildcard" && s.reason === "survived" },
  { id: "acquired",       label: "🤝 Got Acquired!",        explanation: "You sold the company at the right moment.",                                                     condition: (s) => s.reason === "acquired" },
];

const DEATH_REASONS = {
  bankrupt: { title: "💸 You Went Bankrupt", msg: "The money ran out. Classic.", color: "#ff4444" },
  morale:   { title: "😵 Team Collapsed",    msg: "Everyone quit. A company is nothing without its people.", color: "#ff4444" },
  acquired: { title: "🤝 Acquired!",         msg: "You sold the company. Not bad for a first run.", color: "#4ade80" },
  survived: { title: "🏆 You Survived!",     msg: "Against all odds, you made it to the end.", color: "#facc15" },
  default:  { title: "💀 Game Over",         msg: "It happens.", color: "#888" },
};

const STRIPE = {
  leaderboard: "https://buy.stripe.com/aFafZg723g1k5EGetG8Zq04",
  debrief:     "https://buy.stripe.com/9B600i7235mGaZ02KY8Zq03",
  badge:       "https://buy.stripe.com/5kQ9AS3PRaH05EG5Xa8Zq02",
};

function goToStripe(key) {
  window.location.href = STRIPE[key];
}

function getTitle(stats) {
  for (const t of TITLES) {
    try { if (t.condition(stats)) return t; } catch {}
  }
  return { label: "💀 Barely Survived", explanation: "You made it through but just barely. Every startup is a survival story." };
}

function getScore(stats) {
  let score = 0;
  score += Math.floor(stats.money / 100);
  score += stats.users * 2;
  score += Math.round(stats.morale) * 10;
  if (stats.reason === "survived") score += 500;
  if (stats.reason === "acquired") score += 1000;
  if (stats.isSaboteur && stats.reason !== "survived") score += 300;
  if (stats.defected) score += 200;
  score += Object.values(stats.stacks || {}).reduce((a,b) => a+b, 0) * 5;
  score += (stats.combosUnlocked || []).length * 100;
  const diffBonus = { intern: 1.0, founder: 1.2, veteran: 1.5, shark: 2.0 };
  score = Math.round(score * (diffBonus[stats.difficulty] || 1.0));
  return Math.max(0, score);
}

const DIFF_LABELS  = { intern: "🎓 Intern", founder: "🚀 Founder", veteran: "⚡ Veteran", shark: "🦈 Shark" };
const QUIRK_EMOJIS = { overconfident:"😤", cautious:"🤔", charismatic:"😎", paranoid:"😰", lucky:"🍀", reckless:"🎲", methodical:"📋", wildcard:"🃏" };

export default function GameOver({ stats, playerData, gameConfig, onRestart }) {
  const isSolo   = !!gameConfig?.isSolo;
  const roomCode = gameConfig?.roomCode || "SOLO";

  // Build team names from gameConfig.players (object keyed by playerId)
  const teamNames = gameConfig?.players
    ? Object.values(gameConfig.players).map(p => p.name).filter(Boolean)
    : [playerData?.name || "Anonymous"];

  const [scoreId, setScoreId]             = useState(null);
  const [realRank, setRealRank]           = useState(null);
  const [publicLocked, setPublicLocked]   = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName]     = useState(playerData?.name || "");
  const [contactEmail, setContactEmail]   = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [showAIDebrief, setShowAIDebrief] = useState(false);
  const [debriefText, setDebriefText]     = useState("");
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const [topScores, setTopScores]         = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const outcome    = DEATH_REASONS[stats.reason] || DEATH_REASONS.default;
  const titleObj   = getTitle(stats);
  const title      = titleObj.label;
  const explanation = titleObj.explanation;
  const score      = getScore(stats);

  // ─── On mount: submit score + get rank ──────────────────────────
  useEffect(() => {
    if (["survived", "acquired"].includes(stats.reason)) sounds.win();
    else sounds.lose();

    async function init() {
      const id = await submitScore({
        playerName: playerData?.name || "Anonymous",
        score,
        title,
        role: playerData?.role || "",
        difficulty: stats.difficulty || "founder",
        scenario: stats.scenario || "",
        reason: stats.reason,
        money: stats.money,
        users: stats.users,
        morale: Math.round(stats.morale),
        isSolo,
        roomCode,
        teamNames,
      });
      setScoreId(id);

      const rank = await getRealRank(score);
      setRealRank(rank);
    }
    init();
  }, []);

  // ─── Handle return from Stripe ───────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paidFeature   = params.get("paid");
    const returnedScoreId = params.get("sid");
    if (!paidFeature) return;
    window.history.replaceState({}, "", window.location.pathname);

    if (paidFeature === "leaderboard") {
      setPublicLocked(true);
      setShowContactForm(true);
      if (returnedScoreId) setScoreId(returnedScoreId);
    }
    if (paidFeature === "debrief") {
      setShowAIDebrief(true);
      fetchAIDebrief();
    }
    if (paidFeature === "badge") setBadgeUnlocked(true);
  }, []);

  async function fetchAIDebrief() {
    setDebriefLoading(true);
    try {
      const res = await fetch("/.netlify/functions/claude-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "You are a brutally honest but educational startup coach reviewing a player's performance in a startup simulation game called Startup Survival. Analyze their decisions and give real business education. Be specific, occasionally funny, always useful. 4-6 sentences max.",
          messages: [{
            role: "user",
            content: `Player: ${playerData?.name}, Role: ${stats.role}, Scenario: ${stats.scenario}, Difficulty: ${stats.difficulty}, Quirk: ${stats.quirk}
Result: ${stats.reason} with $${stats.money?.toLocaleString()} cash, ${stats.users} users, ${Math.round(stats.morale)}% morale
Title earned: ${title}
Top stacks: ${Object.entries(stats.stacks || {}).sort((a,b) => b[1]-a[1]).slice(0,5).map(([k,v]) => `${k}×${v}`).join(", ")}
Combos unlocked: ${(stats.combosUnlocked || []).join(", ") || "none"}
Give a personalized debrief: what they did well, what killed them, and one specific real business lesson.`
          }],
        }),
      });
      const data = await res.json();
      setDebriefText(data.content?.[0]?.text || "Unable to generate debrief.");
    } catch {
      setDebriefText("Debrief unavailable. Check your connection and try again.");
    }
    setDebriefLoading(false);
  }

  async function handleContactSubmit() {
    if (!isValidEmail(contactEmail)) return;
    if (scoreId) await unlockScore(scoreId, { contactName, contactEmail });
    setContactSubmitted(true);
    setShowContactForm(false);
  }

  function handleGoToStripeLeaderboard() {
    // Pass scoreId in success URL so we can unlock the right entry on return
    const successUrl = `https://survival-startup.netlify.app/?paid=leaderboard${scoreId ? `&sid=${scoreId}` : ""}`;
    window.location.href = `${STRIPE.leaderboard}?success_url=${encodeURIComponent(successUrl)}`;
  }

  async function handleShowLeaderboard() {
    setShowLeaderboard(true);
    const scores = await getTopScores();
    setTopScores(scores);
  }

  const isValidEmail = (e) => e.trim() && e.includes("@") && e.includes(".") && e.indexOf("@") < e.lastIndexOf(".");

  // ─── Team display string ─────────────────────────────────────────
  // "Alex, Roshan, Priya & Sam" — used in the lock-in CTA
  function formatTeamNames(names) {
    if (!names || names.length === 0) return "your team";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.5rem", textAlign: "center" }}>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: outcome.color, marginBottom: 6 }}>{outcome.title}</h1>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 24 }}>{outcome.msg}</p>

      {/* Title card */}
      <div style={{ background: "#1a1a1a", border: `1px solid ${outcome.color}30`, borderRadius: 14, padding: "1.5rem", marginBottom: 14 }}>
        <p style={{ color: "#444", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Your founder title</p>
        <p style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{title}</p>
        <p style={{ fontSize: 12, color: "#777", lineHeight: 1.6, marginBottom: 10 }}>{explanation}</p>
        <p style={{ color: "#444", fontSize: 11 }}>{playerData?.name} · <span style={{ color: "#666" }}>{playerData?.role}</span></p>
        {playerData?.quirk && (
          <p style={{ color: "#555", fontSize: 10, marginTop: 4 }}>
            {QUIRK_EMOJIS[playerData.quirk]} {playerData.quirk}
          </p>
        )}
        {playerData?.isSaboteur && <p style={{ color: "#ff4444", fontSize: 11, marginTop: 4 }}>🐀 Secret Saboteur</p>}
        {stats.difficulty && stats.difficulty !== "founder" && (
          <p style={{ color: "#555", fontSize: 10, marginTop: 4 }}>{DIFF_LABELS[stats.difficulty]} difficulty bonus applied</p>
        )}
        {/* Show full team in multiplayer */}
        {!isSolo && teamNames.length > 1 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "0.5px solid #222" }}>
            <p style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Team</p>
            <p style={{ fontSize: 11, color: "#666" }}>{teamNames.join(" · ")}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[["💰","Cash",`$${stats.money?.toLocaleString()}`],["👥","Users",stats.users?.toLocaleString()],["😊","Morale",`${Math.round(stats.morale)}%`]].map(([icon,label,val]) => (
          <div key={label} style={{ background: "#111", borderRadius: 8, padding: "12px 8px" }}>
            <p style={{ fontSize: 18, margin: "0 0 4px" }}>{icon}</p>
            <p style={{ color: "#444", fontSize: 10, textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
            <p style={{ fontWeight: 700, fontSize: 15, fontFamily: "monospace" }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Combos */}
      {(stats.combosUnlocked || []).length > 0 && (
        <div style={{ background: "#0f0a1a", border: "0.5px solid #a78bfa30", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "left" }}>
          <p style={{ fontSize: 10, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Combos unlocked</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {stats.combosUnlocked.map(id => (
              <span key={id} style={{ fontSize: 10, background: "#a78bfa15", color: "#a78bfa", padding: "2px 8px", borderRadius: 4 }}>{id.replace(/_/g," ")}</span>
            ))}
          </div>
        </div>
      )}

      {/* Reputation */}
      {stats.reputation && (
        <div style={{ background: "#111", border: "0.5px solid #222", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "left" }}>
          <p style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Final reputation</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {Object.entries(stats.reputation).map(([key, val]) => (
              <div key={key} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 9, color: "#444", textTransform: "uppercase", marginBottom: 4 }}>{key}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: val >= 70 ? "#4ade80" : val >= 40 ? "#facc15" : "#ff4444" }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Score + leaderboard ─── */}
      <div style={{ background: "#111", border: "0.5px solid #222", borderRadius: 12, padding: "1.25rem", marginBottom: 14 }}>
        <p style={{ color: "#444", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          {isSolo ? "Your score" : "Team score"}
        </p>
        <p style={{ fontSize: 36, fontWeight: 700, fontFamily: "monospace", color: "#facc15", marginBottom: 6 }}>{score.toLocaleString()}</p>

        {/* Real private rank */}
        {realRank !== null ? (
          <p style={{ color: "#555", fontSize: 12, marginBottom: 10 }}>
            {isSolo ? "You ranked" : "Your team ranked"}{" "}
            <span style={{ color: "#facc15", fontWeight: 700 }}>#{realRank}</span> out of all players
          </p>
        ) : (
          <p style={{ color: "#333", fontSize: 11, marginBottom: 10 }}>Calculating your rank...</p>
        )}

        {!publicLocked ? (
          <div>
            <div style={{ background: "#1a1500", border: "0.5px solid #facc1530", borderRadius: 8, padding: "10px", marginBottom: 10 }}>
              <p style={{ color: "#facc15", fontSize: 12, fontWeight: 700, marginBottom: 3 }}>
                🏆 Make rank #{realRank ?? "?"} public
              </p>
              {!isSolo && teamNames.length > 1 ? (
                <p style={{ color: "#555", fontSize: 11 }}>
                  One payment puts <span style={{ color: "#aaa" }}>{formatTeamNames(teamNames)}</span> on the public leaderboard together — and makes your whole team eligible for prizes.
                </p>
              ) : (
                <p style={{ color: "#555", fontSize: 11 }}>Lock in your score to appear on the public leaderboard — and be eligible for prizes.</p>
              )}
            </div>
            <button onClick={handleGoToStripeLeaderboard}
              style={{ width: "100%", padding: "12px", background: "#facc15", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>
              🏆 {isSolo ? "Make Score Public" : "Make Team Score Public"} — $1.99
            </button>
            <button onClick={handleShowLeaderboard}
              style={{ width: "100%", padding: "9px", background: "#1a1a1a", color: "#555", border: "0.5px solid #333", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
              👀 View public leaderboard
            </button>
          </div>
        ) : (
          <div>
            <div style={{ background: "#0a1a0a", border: "0.5px solid #4ade8030", borderRadius: 8, padding: "10px", marginBottom: showContactForm && !contactSubmitted ? 10 : 0 }}>
              <p style={{ color: "#4ade80", fontSize: 13, fontWeight: 700 }}>
                ✓ {isSolo ? "Score" : "Team score"} is public! #{realRank} 🎉
              </p>
              {!isSolo && teamNames.length > 1 && (
                <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>{teamNames.join(" · ")}</p>
              )}
              {contactSubmitted && <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>We'll contact you if you win a prize.</p>}
            </div>

            {showContactForm && !contactSubmitted && (
              <div style={{ marginTop: 10, textAlign: "left" }}>
                <p style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Enter your details to be eligible for prizes:</p>
                <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Your name"
                  style={{ width: "100%", padding: "10px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="Your email" type="email"
                  style={{ width: "100%", padding: "10px", background: "#111", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                <p style={{ fontSize: 10, color: "#444", marginBottom: 10 }}>Only used to contact you about prizes. No spam.</p>
                <button onClick={handleContactSubmit} disabled={!isValidEmail(contactEmail)}
                  style={{ width: "100%", padding: "11px", background: isValidEmail(contactEmail) ? "#facc15" : "#222", color: isValidEmail(contactEmail) ? "#000" : "#555", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: isValidEmail(contactEmail) ? "pointer" : "default" }}>
                  Confirm Details →
                </button>
              </div>
            )}

            <button onClick={handleShowLeaderboard}
              style={{ width: "100%", padding: "9px", background: "#1a1a1a", color: "#555", border: "0.5px solid #333", borderRadius: 8, fontSize: 12, cursor: "pointer", marginTop: 10 }}>
              👀 View public leaderboard
            </button>
          </div>
        )}
      </div>

      {/* ─── Public leaderboard view ─── */}
      {showLeaderboard && (
        <div style={{ background: "#111", border: "0.5px solid #facc1530", borderRadius: 12, padding: "1.25rem", marginBottom: 14, textAlign: "left" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#facc15", marginBottom: 12 }}>🏆 Global Leaderboard</p>
          {topScores.length === 0 ? (
            <p style={{ color: "#444", fontSize: 12 }}>Loading scores...</p>
          ) : (
            topScores.map((entry, i) => {
              const names = entry.teamNames?.length > 0
                ? entry.teamNames.join(", ")
                : entry.playerName || "Anonymous";
              const isTeam = !entry.isSolo && entry.teamNames?.length > 1;
              return (
                <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: "0.5px solid #1a1a1a" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: i === 0 ? "#facc15" : i === 1 ? "#aaa" : i === 2 ? "#fb923c" : "#444", width: 26, textAlign: "center", flexShrink: 0 }}>
                    {i + 1}
                  </p>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: "#fff", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isTeam ? "👥 " : ""}{names}
                    </p>
                    <p style={{ fontSize: 10, color: "#555" }}>
                      {entry.title} · {DIFF_LABELS[entry.difficulty] || entry.difficulty}
                    </p>
                    <p style={{ fontSize: 10, color: "#444" }}>{entry.scenario}</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#facc15", fontFamily: "monospace", flexShrink: 0 }}>
                    {(entry.score || 0).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* AI Debrief */}
      <div style={{ background: "#111", border: "0.5px solid #a78bfa30", borderRadius: 10, padding: "12px", marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🧠 AI Business Debrief</p>
        <p style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>Personalized analysis of your decisions, what you did right, and what killed you.</p>
        {!showAIDebrief ? (
          <button onClick={() => goToStripe("debrief")}
            style={{ width: "100%", padding: "9px", background: "#a78bfa20", color: "#a78bfa", border: "0.5px solid #a78bfa40", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
            Get AI Debrief — $2.99
          </button>
        ) : debriefLoading ? (
          <p style={{ color: "#888", fontSize: 12, textAlign: "center" }}>Analyzing your performance...</p>
        ) : (
          <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6, textAlign: "left" }}>{debriefText}</p>
        )}
      </div>

      {/* Ranked badge */}
      <div style={{ background: "#111", border: "0.5px solid #60a5fa30", borderRadius: 10, padding: "12px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🎖️ Ranked Badge</p>
        <p style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>A shareable badge showing your rank, title, and difficulty level.</p>
        {!badgeUnlocked ? (
          <button onClick={() => goToStripe("badge")}
            style={{ width: "100%", padding: "9px", background: "#60a5fa20", color: "#60a5fa", border: "0.5px solid #60a5fa40", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            Get Ranked Badge — $2.99
          </button>
        ) : (
          <div style={{ background: "#0a0f1a", border: "0.5px solid #60a5fa40", borderRadius: 8, padding: "10px" }}>
            <p style={{ color: "#60a5fa", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>✓ Badge unlocked!</p>
            <p style={{ color: "#555", fontSize: 11 }}>Badge generation coming soon — we'll notify you when it's ready.</p>
          </div>
        )}
      </div>

      {/* Shareable result card */}
      <ResultCard stats={stats} playerData={playerData} title={title} score={score} gameConfig={gameConfig} />

      <button onClick={onRestart}
        style={{ width: "100%", padding: "14px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
        Play Again →
      </button>
      <p style={{ color: "#333", fontSize: 11 }}>Share your title and challenge someone to beat it.</p>
    </div>
  );
}