import { useState, useEffect, useRef } from "react";
import {
  submitScore, unlockScore, getTopScores, getRealRank,
  subscribeToPlayerSummaries,
} from "./firebase";

// ─── Constants ───────────────────────────────────────────────────
const ROLE_EMOJIS = {
  "CEO":"👑","CFO":"💰","CMO":"📣","CTO":"💻","COO":"⚙️",
  "Head of Sales":"🤝","Community Manager":"🫂",
};
const ROLE_COLORS = {
  "CEO":"#60a5fa","CFO":"#4ade80","CMO":"#facc15",
  "CTO":"#f472b6","COO":"#a78bfa",
  "Head of Sales":"#fb923c","Community Manager":"#2dd4bf",
};
const QUIRK_LABELS = {
  overconfident:"😤 Overconfident", cautious:"🤔 Cautious",
  charismatic:"😎 Charismatic",    paranoid:"😰 Paranoid",
  lucky:"🍀 Lucky",               reckless:"🎲 Reckless",
  methodical:"📋 Methodical",      wildcard:"🃏 Wildcard",
};
const DIFFICULTY_LABELS = {
  intern:"🎓 Intern", founder:"🚀 Founder",
  veteran:"⚡ Veteran", shark:"🦈 Shark",
};
const REASON_COPY = {
  bankrupt: { emoji:"💸", title:"You ran out of money.",     sub:"The lights are off. The team is gone. The dream is dead." },
  morale:   { emoji:"😞", title:"The team fell apart.",      sub:"Morale hit zero. Everyone quit. Turns out vibes matter." },
  survived: { emoji:"🏆", title:"You survived.",             sub:"Against all odds, the company made it to the end." },
  acquired: { emoji:"🤝", title:"You got acquired!",         sub:"Someone saw value in your chaos. Congratulations." },
};
const STRIPE = {
  leaderboard: "https://buy.stripe.com/aFafZg723g1k5EGetG8Zq04",
  aiDebrief:   "https://buy.stripe.com/9B600i7235mGaZ02KY8Zq03",
  badge:       "https://buy.stripe.com/5kQ9AS3PRaH05EG5Xa8Zq02",
};

function calcScore({ money, users, morale, reason, difficulty, stacks = {}, combosUnlocked = [], actionCount = 0 }) {
  const diffMult = { intern:0.7, founder:1.0, veteran:1.4, shark:2.0 }[difficulty] || 1.0;
  const reasonBonus = { survived:1.0, acquired:1.5, bankrupt:0.3, morale:0.4 }[reason] || 1.0;
  const stackBonus  = Object.values(stacks).reduce((a, b) => a + b, 0) * 10;
  const comboBonus  = combosUnlocked.length * 5000;
  const actionBonus = Math.min(actionCount * 50, 5000);
  const base = Math.floor((money * 0.4) + (users * 2) + (morale * 100));
  return Math.floor((base + stackBonus + comboBonus + actionBonus) * diffMult * reasonBonus);
}

function calcTitle(score, reason) {
  if (reason === "acquired") return "Acquired 🤝";
  if (score > 200000) return "Unicorn 🦄";
  if (score > 100000) return "Series B 🚀";
  if (score > 50000)  return "Series A ⚡";
  if (score > 20000)  return "Seed Stage 🌱";
  if (score > 5000)   return "Pre-seed 💡";
  return "Dead on Arrival 💀";
}

// ─── Badge canvas generator ───────────────────────────────────────
function generateBadge({ playerName, role, score, title, difficulty, rank, reason, quirk }) {
  const canvas  = document.createElement("canvas");
  canvas.width  = 600;
  canvas.height = 340;
  const ctx     = canvas.getContext("2d");

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, 600, 340);
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(0, 0, 600, 4);

  // Skull watermark — use text fallback if emoji renders as box
  ctx.font = "120px serif";
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("💀", 300, 220);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, 598, 338);

  // Role emoji
  ctx.font = "bold 42px serif";
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(ROLE_EMOJIS[role] || "★", 36, 80);

  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = ROLE_COLORS[role] || "#888";
  ctx.fillText(role.toUpperCase(), 96, 58);

  ctx.font = "14px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#555";
  ctx.fillText(playerName, 96, 80);

  ctx.font = "bold 32px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(title, 300, 140);

  ctx.font = "bold 56px monospace";
  ctx.fillStyle = "#ff4444";
  ctx.textAlign = "center";
  ctx.fillText(score.toLocaleString(), 300, 210);

  ctx.font = "12px system-ui";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.fillText("SCORE", 300, 228);

  ctx.font = "13px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#444";
  ctx.textAlign = "left";
  ctx.fillText(DIFFICULTY_LABELS[difficulty] || difficulty, 36, 278);

  if (rank) {
    ctx.textAlign = "center";
    ctx.fillText(`Rank #${rank}`, 300, 278);
  }

  if (quirk) {
    ctx.textAlign = "right";
    ctx.fillText(QUIRK_LABELS[quirk] || quirk, 564, 278);
  }

  const reasonData = REASON_COPY[reason] || {};
  ctx.font = "bold 13px system-ui";
  ctx.fillStyle = reason === "survived" || reason === "acquired" ? "#4ade80" : "#ff4444";
  ctx.textAlign = "right";
  ctx.fillText((reasonData.emoji || "") + " " + (reason === "survived" ? "SURVIVED" : reason === "acquired" ? "ACQUIRED" : "FAILED"), 564, 80);

  ctx.font = "11px monospace";
  ctx.fillStyle = "#222";
  ctx.textAlign = "center";
  ctx.fillText("survival-startup.netlify.app", 300, 322);

  return canvas.toDataURL("image/png");
}

// ─── Leaderboard row ─────────────────────────────────────────────
function LeaderboardRow({ entry, rank, isMe }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
      background: isMe ? "#1a0808" : "#0f0f0f",
      border: `0.5px solid ${isMe ? "#ff444430" : "#1a1a1a"}`,
      borderRadius:8, marginBottom:4,
    }}>
      <span style={{ fontSize:11, color: rank<=3?"#facc15":"#333", fontFamily:"monospace", minWidth:24, textAlign:"right" }}>
        {rank<=3 ? ["🥇","🥈","🥉"][rank-1] : `#${rank}`}
      </span>
      <span style={{ fontSize:11, flex:1, color: isMe?"#ff4444":"#aaa" }}>
        {entry.teamNames?.length > 1 ? entry.teamNames.join(", ") : entry.playerName}
      </span>
      <span style={{ fontSize:10, color:"#555" }}>{entry.difficulty || ""}</span>
      <span style={{ fontSize:12, fontWeight:700, color: isMe?"#ff4444":"#fff", fontFamily:"monospace" }}>
        {(entry.score||0).toLocaleString()}
      </span>
    </div>
  );
}

// ─── Main GameOver ────────────────────────────────────────────────
export default function GameOver({ stats, playerData, gameConfig, onRestart }) {
  const {
    money=0, users=0, morale=0, teamMoney=0,
    reason="survived", stacks={}, log=[],
    defected=false, rivalName="",
    role="CEO", isSaboteur=false,
    difficulty="founder", scenario="Unknown", scenarioId="",
    reputation={}, quirk="", combosUnlocked=[],
    actionCount=0, roomCode=null,
  } = stats || {};

  const isSolo  = !roomCode;
  const score   = calcScore({ money, users, morale, reason, difficulty, stacks, combosUnlocked, actionCount });
  const title   = calcTitle(score, reason);

  const rivalWon = defected && money > teamMoney;

  const reasonData = rivalWon
    ? { emoji:"⚔️", title:`${rivalName} wins.`,         sub:"You out-scored your old team. The betrayal paid off." }
    : defected
    ? { emoji:"💀", title:"Betrayal failed.",             sub:"The team outlasted you. Nobody likes a Judas." }
    : REASON_COPY[reason] || REASON_COPY.survived;

  // ─── State ───────────────────────────────────────────────────────
  const [scoreId, setScoreId]             = useState(null);
  const [rank, setRank]                   = useState(null);
  const [rankTotal, setRankTotal]         = useState(null);
  const [leaderboard, setLeaderboard]     = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [unlocking, setUnlocking]         = useState(false);
  const [unlocked, setUnlocked]           = useState(false);
  const [contactName, setContactName]     = useState("");
  const [contactEmail, setContactEmail]   = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [teamSummaries, setTeamSummaries] = useState({});
  const [badgeDataUrl, setBadgeDataUrl]   = useState(null);
  const [aiDebrief, setAiDebrief]         = useState(null);
  const [aiLoading, setAiLoading]         = useState(false);
  const [shareSuccess, setShareSuccess]   = useState(false);
  const [rankWarning, setRankWarning]     = useState(false);

  // FIX: guard against duplicate score submission on remount
  const submitRef = useRef(false);

  // ─── On mount: submit score, fetch rank ───────────────────────────
  useEffect(() => {
    async function init() {
      // FIX: only submit once even if component remounts
      if (submitRef.current) return;
      submitRef.current = true;

      const teamNames = gameConfig?.players
        ? Object.values(gameConfig.players).map(p => p.name)
        : [playerData?.name || "Unknown"];

      const id = await submitScore({
        playerName: playerData?.name || "Unknown",
        score, title, role, difficulty, scenario, reason,
        money, users, morale, isSolo,
        roomCode: isSolo ? null : roomCode,
        teamNames,
      });
      setScoreId(id);

      const { rank: r, total } = await getRealRank(score);
      setRank(r);
      setRankTotal(total);
      if (total > 500) setRankWarning(true);
    }
    init();
  }, []);

  // ─── Live team summaries subscription ────────────────────────────
  useEffect(() => {
    if (isSolo || !roomCode) return;
    return subscribeToPlayerSummaries(roomCode, summaries => {
      setTeamSummaries(summaries || {});
    });
  }, []);

  // ─── Load leaderboard when tab opens ─────────────────────────────
  useEffect(() => {
    if (!showLeaderboard) return;
    getTopScores().then(setLeaderboard);
  }, [showLeaderboard]);

  // ─── Generate badge once rank is ready ───────────────────────────
  useEffect(() => {
    if (!rank) return;
    const dataUrl = generateBadge({
      playerName: playerData?.name || "Player",
      role, score, title, difficulty, rank, reason, quirk,
    });
    setBadgeDataUrl(dataUrl);
  }, [rank]);

  async function handleUnlock() {
    if (!scoreId || unlocked) return;
    if (!contactName.trim() || !contactEmail.trim()) { setShowContactForm(true); return; }
    setUnlocking(true);
    await unlockScore(scoreId, { contactName, contactEmail });
    setUnlocked(true);
    setUnlocking(false);
    setShowContactForm(false);
  }

  function handleStripeLeaderboard() {
    const url = `https://survival-startup.netlify.app/?paid=leaderboard${scoreId?`&sid=${scoreId}`:""}${roomCode?`&room=${roomCode}`:""}`;
    window.location.href = `${STRIPE.leaderboard}?success_url=${encodeURIComponent(url)}`;
  }

  function handleAiDebrief() {
    const successUrl = `https://survival-startup.netlify.app/?paid=debrief${scoreId ? `&sid=${scoreId}` : ""}`;
    window.location.href = `${STRIPE.aiDebrief}?success_url=${encodeURIComponent(successUrl)}`;
  }

  async function fetchAiDebrief() {
    if (aiDebrief || aiLoading) return;
    setAiLoading(true);
    try {
      const comboList = combosUnlocked.join(", ") || "none";
      const topStacks = Object.entries(stacks).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}×${v}`).join(", ") || "none";
      const res = await fetch("/.netlify/functions/claude-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a brutally honest startup advisor giving a post-mortem debrief. Be specific, sharp, and occasionally funny. 5-7 sentences. Reference actual stats.`,
          messages: [{
            role: "user",
            content: `Debrief my game: Role: ${role}${isSaboteur?" (Saboteur)":""}. Quirk: ${quirk}. Scenario: ${scenario}. Difficulty: ${difficulty}. Final: $${money.toLocaleString()} cash, ${users} users, ${Math.round(morale)}% morale. Score: ${score.toLocaleString()} (${title}). Result: ${reason}${defected?`. I defected and founded ${rivalName} — ${rivalWon?"I won":"I lost"}`:""}. Actions taken: ${actionCount}. Top stacks: ${topStacks}. Combos: ${comboList}. Give specific praise and roasts based on these numbers. End with one tactical thing I should have done differently.`,
          }],
        }),
      });
      const data = await res.json();
      setAiDebrief(data.content?.[0]?.text || "The advisor had to take a call.");
    } catch {
      setAiDebrief("Network error — the advisor ghosted you. Fitting, really.");
    }
    setAiLoading(false);
  }

  async function handleShareBadge() {
    if (!badgeDataUrl) return;
    if (navigator.share && navigator.canShare) {
      try {
        const blob  = await (await fetch(badgeDataUrl)).blob();
        const file  = new File([blob], "startup-survival-badge.png", { type:"image/png" });
        if (navigator.canShare({ files:[file] })) {
          await navigator.share({ files:[file], title:"Startup Survival", text:`I scored ${score.toLocaleString()} as ${role} — ${title}` });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
          return;
        }
      } catch {}
    }
    // Fallback: download
    const a = document.createElement("a");
    a.href = badgeDataUrl;
    a.download = "startup-survival-badge.png";
    a.click();
  }

  // Stripe return handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid   = params.get("paid");
    const sid    = params.get("sid");
    if (!paid) return;
    window.history.replaceState({}, "", window.location.pathname);
    if (paid === "leaderboard" && sid) {
      unlockScore(sid, { contactName:"", contactEmail:"" }).then(() => {
        setUnlocked(true);
        setShowLeaderboard(true);
        getTopScores().then(setLeaderboard);
      });
    }
    if (paid === "debrief") { fetchAiDebrief(); }
  }, []);

  const roleColor  = ROLE_COLORS[role] || "#888";
  const isWin      = reason === "survived" || reason === "acquired" || rivalWon;

  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"2rem 1.25rem 6rem", fontFamily:"system-ui,-apple-system,sans-serif", minHeight:"100vh" }}>

      {/* Result header */}
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div style={{ fontSize:52, marginBottom:10 }}>{reasonData.emoji}</div>
        <h1 style={{ fontSize:22, fontWeight:700, color: isWin?"#4ade80":"#ff4444", marginBottom:6 }}>
          {reasonData.title}
        </h1>
        <p style={{ color:"#555", fontSize:13, lineHeight:1.6 }}>{reasonData.sub}</p>
      </div>

      {/* Score card */}
      <div style={{ background:"#111", border:`1px solid ${isWin?"#4ade8030":"#ff444430"}`, borderRadius:16, padding:"1.5rem", marginBottom:12, textAlign:"center" }}>
        <p style={{ color:"#444", fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Final score</p>
        <p style={{ fontSize:52, fontWeight:700, color:"#ff4444", fontFamily:"monospace", lineHeight:1 }}>
          {score.toLocaleString()}
        </p>
        <p style={{ color:"#888", fontSize:15, fontWeight:600, marginTop:6, marginBottom:12 }}>{title}</p>

        {rank ? (
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:12 }}>
            <div style={{ background:"#1a1a1a", borderRadius:8, padding:"6px 14px" }}>
              <p style={{ fontSize:9, color:"#555", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Rank</p>
              <p style={{ fontSize:15, fontWeight:700, color:"#facc15" }}>#{rank}</p>
            </div>
            {rankTotal && (
              <div style={{ background:"#1a1a1a", borderRadius:8, padding:"6px 14px" }}>
                <p style={{ fontSize:9, color:"#555", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Out of</p>
                <p style={{ fontSize:15, fontWeight:700, color:"#555" }}>{rankTotal.toLocaleString()}</p>
              </div>
            )}
            <div style={{ background:"#1a1a1a", borderRadius:8, padding:"6px 14px" }}>
              <p style={{ fontSize:9, color:"#555", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Actions</p>
              <p style={{ fontSize:15, fontWeight:700, color:"#aaa" }}>{actionCount}</p>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
            <div style={{ background:"#1a1a1a", borderRadius:8, padding:"6px 20px" }}>
              <p style={{ fontSize:11, color:"#333" }}>Calculating rank...</p>
            </div>
          </div>
        )}

        {rankWarning && (
          <p style={{ fontSize:10, color:"#333", marginBottom:8 }}>
            ⚠️ Large leaderboard — rank may take a moment to finalize.
          </p>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            ["💰","Cash",`$${money.toLocaleString()}`,"#4ade80"],
            ["👥","Users",users.toLocaleString(),"#60a5fa"],
            ["😊","Morale",`${Math.round(morale)}%`,"#facc15"],
          ].map(([icon,label,val,color]) => (
            <div key={label} style={{ background:"#1a1a1a", borderRadius:8, padding:"8px" }}>
              <p style={{ fontSize:9, color:"#444", textTransform:"uppercase", marginBottom:3 }}>{icon} {label}</p>
              <p style={{ fontSize:14, fontWeight:700, color, fontFamily:"monospace" }}>{val}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop:10, display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:10, color:"#555", background:"#1a1a1a", padding:"3px 10px", borderRadius:20 }}>
            {DIFFICULTY_LABELS[difficulty] || difficulty}
          </span>
          <span style={{ fontSize:10, color:roleColor, background:"#1a1a1a", padding:"3px 10px", borderRadius:20 }}>
            {ROLE_EMOJIS[role]} {role}
          </span>
          {quirk && (
            <span style={{ fontSize:10, color:"#555", background:"#1a1a1a", padding:"3px 10px", borderRadius:20 }}>
              {QUIRK_LABELS[quirk] || quirk}
            </span>
          )}
          {isSaboteur && (
            <span style={{ fontSize:10, color:"#ff4444", background:"#1a0808", padding:"3px 10px", borderRadius:20 }}>
              🐀 Saboteur
            </span>
          )}
        </div>
      </div>

      {/* Rival result banner */}
      {defected && (
        <div style={{ background: rivalWon?"#0a1a0a":"#1a0808", border:`1px solid ${rivalWon?"#4ade8030":"#ff444430"}`, borderRadius:12, padding:"1rem", marginBottom:12, textAlign:"center" }}>
          <p style={{ fontSize:14, fontWeight:700, color:rivalWon?"#4ade80":"#ff4444", marginBottom:4 }}>
            {rivalWon ? `⚔️ ${rivalName} beat the team!` : `💀 The team survived your betrayal.`}
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:16 }}>
            <div>
              <p style={{ fontSize:9, color:"#555", textTransform:"uppercase", letterSpacing:1 }}>{rivalName}</p>
              <p style={{ fontSize:13, fontWeight:700, color:rivalWon?"#4ade80":"#aaa", fontFamily:"monospace" }}>${money.toLocaleString()}</p>
            </div>
            <div style={{ color:"#333", fontSize:14, alignSelf:"center" }}>vs</div>
            <div>
              <p style={{ fontSize:9, color:"#555", textTransform:"uppercase", letterSpacing:1 }}>Team</p>
              <p style={{ fontSize:13, fontWeight:700, color:rivalWon?"#aaa":"#4ade80", fontFamily:"monospace" }}>${teamMoney.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Combos */}
      {combosUnlocked.length > 0 && (
        <div style={{ background:"#0f0a1a", border:"0.5px solid #a78bfa20", borderRadius:12, padding:"1rem", marginBottom:12 }}>
          <p style={{ fontSize:10, color:"#a78bfa", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>🔮 Combos unlocked</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {combosUnlocked.map(id => (
              <span key={id} style={{ fontSize:11, background:"#a78bfa15", color:"#a78bfa", padding:"3px 10px", borderRadius:20 }}>{id}</span>
            ))}
          </div>
        </div>
      )}

      {/* Team debrief */}
      {!isSolo && (
        <div style={{ background:"#0a0a0a", border:"0.5px solid #1a1a1a", borderRadius:12, padding:"1rem", marginBottom:12 }}>
          <p style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>👥 Team debrief</p>
          {Object.keys(teamSummaries).length === 0 && (
            <p style={{ color:"#333", fontSize:12 }}>Waiting for teammates to finish...</p>
          )}
          {Object.entries(teamSummaries).map(([pid, summary]) => {
            const isMe = pid === playerData?.id;
            return (
              <div key={pid} style={{ background:"#111", border:`0.5px solid ${isMe?"#ff444430":"#1a1a1a"}`, borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:14 }}>{ROLE_EMOJIS[summary.role]||"👤"}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:ROLE_COLORS[summary.role]||"#888" }}>{summary.role}</span>
                    <span style={{ fontSize:11, color:"#555" }}>{summary.name}{isMe?" (you)":""}</span>
                  </div>
                  <div style={{ display:"flex", gap:5 }}>
                    {summary.isSaboteur && (
                      <span style={{ fontSize:9, color:"#ff4444", background:"#1a0808", padding:"2px 7px", borderRadius:4 }}>🐀 Saboteur</span>
                    )}
                    {summary.defected && (
                      <span style={{ fontSize:9, color:"#fb923c", background:"#1a0a00", padding:"2px 7px", borderRadius:4 }}>⚔️ Defected</span>
                    )}
                  </div>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  <p style={{ fontSize:10, color:"#555" }}>{summary.actionCount || 0} actions</p>
                  {summary.quirk && <p style={{ fontSize:10, color:"#444" }}>{QUIRK_LABELS[summary.quirk]||summary.quirk}</p>}
                  {summary.defected && summary.rivalName && (
                    <p style={{ fontSize:10, color:"#fb923c" }}>Founded {summary.rivalName} · ${(summary.rivalMoney||0).toLocaleString()}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard */}
      <div style={{ background:"#111", border:"0.5px solid #1a1a1a", borderRadius:12, marginBottom:12 }}>
        <button
          onClick={() => setShowLeaderboard(p => !p)}
          style={{ width:"100%", padding:"14px 16px", background:"none", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", minHeight:52 }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>🏆 Leaderboard</span>
          <span style={{ fontSize:11, color:"#555" }}>{showLeaderboard?"▲":"▼"}</span>
        </button>

        {showLeaderboard && (
          <div style={{ padding:"0 12px 12px" }}>
            {leaderboard.length === 0 && (
              <p style={{ color:"#333", fontSize:12, padding:"8px 0" }}>Loading...</p>
            )}
            {leaderboard.map((entry, i) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={i+1} isMe={entry.id === scoreId} />
            ))}

            {!unlocked && scoreId && (
              <div style={{ marginTop:12, background:"#0a0a0a", border:"0.5px solid #333", borderRadius:10, padding:"12px" }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#fff", marginBottom:4 }}>Your score is unlisted</p>
                <p style={{ fontSize:11, color:"#555", marginBottom:10, lineHeight:1.6 }}>
                  Pay $1.99 to lock your score on the public leaderboard. One payment covers the whole team in multiplayer.
                </p>
                {showContactForm ? (
                  <div>
                    <input
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="Your name (for leaderboard display)"
                      style={{ width:"100%", padding:"10px", background:"#111", border:"0.5px solid #333", borderRadius:8, color:"#fff", fontSize:12, outline:"none", boxSizing:"border-box", marginBottom:8 }}
                    />
                    <input
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="Email (optional, for disputes)"
                      type="email"
                      style={{ width:"100%", padding:"10px", background:"#111", border:"0.5px solid #333", borderRadius:8, color:"#fff", fontSize:12, outline:"none", boxSizing:"border-box", marginBottom:8 }}
                    />
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={handleUnlock} disabled={unlocking || !contactName.trim()}
                        style={{ flex:1, padding:"11px", background:contactName.trim()?"#facc15":"#333", color:"#000", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:contactName.trim()?"pointer":"default", minHeight:48 }}>
                        {unlocking ? "Locking..." : "Lock My Score"}
                      </button>
                      <button onClick={handleStripeLeaderboard}
                        style={{ flex:1, padding:"11px", background:"#1a1a1a", color:"#facc15", border:"0.5px solid #facc1530", borderRadius:8, fontSize:12, cursor:"pointer", minHeight:48 }}>
                        💛 Pay $1.99
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowContactForm(true)}
                    style={{ width:"100%", padding:"11px", background:"#1a1a1a", color:"#facc15", border:"0.5px solid #facc1530", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", minHeight:48 }}>
                    💛 Lock Score on Leaderboard — $1.99
                  </button>
                )}
              </div>
            )}

            {unlocked && (
              <div style={{ marginTop:10, background:"#0a1a0a", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                <p style={{ fontSize:12, color:"#4ade80", fontWeight:700 }}>✓ Score locked on leaderboard</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ranked badge */}
      <div style={{ background:"#111", border:"0.5px solid #1a1a1a", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <p style={{ fontSize:13, fontWeight:700 }}>🎖️ Ranked Badge</p>
          {badgeDataUrl && <span style={{ fontSize:10, color:"#4ade80" }}>Ready</span>}
        </div>

        {badgeDataUrl ? (
          <div style={{ marginBottom:10, borderRadius:8, overflow:"hidden", border:"0.5px solid #1a1a1a" }}>
            <img src={badgeDataUrl} alt="Ranked badge preview" style={{ width:"100%", display:"block" }} />
          </div>
        ) : (
          <div style={{ background:"#0a0a0a", borderRadius:8, height:80, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
            <p style={{ color:"#333", fontSize:12 }}>Generating badge...</p>
          </div>
        )}

        <p style={{ fontSize:11, color:"#555", marginBottom:10, lineHeight:1.6 }}>
          Download or share your badge. Includes your score, rank, role, difficulty, and quirk.
        </p>
        <button onClick={handleShareBadge} disabled={!badgeDataUrl}
          style={{ width:"100%", padding:"11px", background:badgeDataUrl?"#ff4444":"#1a1a1a", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:badgeDataUrl?"pointer":"default", minHeight:48 }}>
          {shareSuccess ? "✓ Shared!" : navigator.share ? "📤 Share Badge" : "⬇️ Download Badge"}
        </button>
      </div>

      {/* AI Debrief */}
      <div style={{ background:"#111", border:"0.5px solid #1a1a1a", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <p style={{ fontSize:13, fontWeight:700 }}>🤖 AI Post-Mortem</p>
          <span style={{ fontSize:10, color:"#a78bfa" }}>$2.99</span>
        </div>
        <p style={{ fontSize:11, color:"#555", lineHeight:1.6, marginBottom:10 }}>
          Get a brutally honest debrief of your run — what you did right, what killed you, and what you should have done differently.
        </p>
        {aiDebrief ? (
          <div style={{ background:"#0a0a0a", border:"0.5px solid #a78bfa30", borderRadius:8, padding:"12px" }}>
            <p style={{ fontSize:12, color:"#ccc", lineHeight:1.7 }}>{aiDebrief}</p>
          </div>
        ) : aiLoading ? (
          <p style={{ color:"#555", fontSize:12, textAlign:"center", padding:"12px 0" }}>Consulting the advisor...</p>
        ) : (
          <button onClick={handleAiDebrief}
            style={{ width:"100%", padding:"11px", background:"#a78bfa20", color:"#a78bfa", border:"0.5px solid #a78bfa40", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", minHeight:48 }}>
            Get AI Debrief — $2.99
          </button>
        )}
      </div>

      {/* Decision log */}
      {log && log.length > 0 && (
        <div style={{ background:"#0a0a0a", border:"0.5px solid #1a1a1a", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
          <p style={{ fontSize:10, color:"#333", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>📋 Decision log</p>
          {log.slice(0, 8).map((entry, i) => (
            <p key={i} style={{ color:"#444", fontSize:11, marginBottom:5 }}>→ {entry}</p>
          ))}
        </div>
      )}

      {/* Play again */}
      <button onClick={onRestart}
        style={{ width:"100%", padding:"15px", background:"#ff4444", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:10, minHeight:52 }}>
        Play Again →
      </button>

      <p style={{ textAlign:"center", color:"#333", fontSize:11, lineHeight:1.7 }}>
        Share with a friend who thinks they can do better.{"\n"}
        <a href="https://survival-startup.netlify.app" style={{ color:"#444" }}>survival-startup.netlify.app</a>
      </p>
    </div>
  );
}