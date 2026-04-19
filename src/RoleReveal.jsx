import { useState } from "react";

const ROLE_INFO = {
  "CEO": {
    emoji: "👑", color: "#60a5fa",
    desc: "You set direction, break ties, and take the fall when it all goes wrong.",
    power: "Pivot the company when everyone else is stuck.",
    weakness: "Every bad outcome lands on you.",
  },
  "CFO": {
    emoji: "💰", color: "#4ade80",
    desc: "You control the money. Without you, nobody knows how long the runway is.",
    power: "Detect financial sabotage before it kills the company.",
    weakness: "If cash runs out, it's your fault.",
  },
  "CMO": {
    emoji: "📣", color: "#facc15",
    desc: "You make noise. Growth, press, brand — it's all you.",
    power: "Viral moments that nobody else can pull off.",
    weakness: "High-risk plays can backfire spectacularly.",
  },
  "CTO": {
    emoji: "💻", color: "#f472b6",
    desc: "You build the product. Without you, there's nothing to sell.",
    power: "Ship features fast and sabotage competitors.",
    weakness: "Tech debt is always one crisis away.",
  },
  "COO": {
    emoji: "⚙️", color: "#a78bfa",
    desc: "You keep everything running. The unglamorous backbone of the company.",
    power: "Automate processes that generate passive revenue.",
    weakness: "Expensive to operate. High upfront costs.",
  },
  "Head of Sales": {
    emoji: "🤝", color: "#fb923c",
    desc: "You close deals. Revenue is your oxygen.",
    power: "Direct cash injection with every cold call.",
    weakness: "Flash sales can tank your user base.",
  },
  "Community Manager": {
    emoji: "🫂", color: "#2dd4bf",
    desc: "You keep the team and customers happy. Morale is your metric.",
    power: "Town Hall can override any CEO decision.",
    weakness: "High morale means nothing if the money's gone.",
  },
};

const QUIRK_INFO = {
  overconfident: { emoji: "😤", label: "Overconfident", desc: "Morale floor at 40% — but bad decisions cost double the normal consequence." },
  cautious:      { emoji: "🤔", label: "Cautious",      desc: "All actions succeed — but effects are 40% weaker. Safer but slower." },
  charismatic:   { emoji: "😎", label: "Charismatic",   desc: "Networking and community actions always work. Financial decisions are riskier." },
  paranoid:      { emoji: "😰", label: "Paranoid",       desc: "You can sense suspicious activity. Useful for catching the saboteur." },
  lucky:         { emoji: "🍀", label: "Lucky",          desc: "Negative events have a 30% chance of flipping positive. Unpredictable." },
  reckless:      { emoji: "🎲", label: "Reckless",       desc: "All outcomes doubled. Wins are bigger. Losses are catastrophic." },
  methodical:    { emoji: "📋", label: "Methodical",     desc: "Action stacks build 50% faster. Combos unlock sooner." },
  wildcard:      { emoji: "🃏", label: "Wildcard",       desc: "20% chance any action reverses its effect. You can't trust yourself." },
};

export default function RoleReveal({ playerData, gameConfig, onReady }) {
  const [rerolled, setRerolled]     = useState(false);
  const [currentRole, setCurrentRole]   = useState(playerData?.role || "CEO");
  const [currentQuirk, setCurrentQuirk] = useState(playerData?.quirk || "overconfident");
  const [revealed, setRevealed]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isSaboteur = playerData?.isSaboteur || false;
  const role       = ROLE_INFO[currentRole] || ROLE_INFO["CEO"];
  const quirk      = QUIRK_INFO[currentQuirk] || QUIRK_INFO["overconfident"];

  const ROLES  = Object.keys(ROLE_INFO);
  const QUIRKS = Object.keys(QUIRK_INFO);

  function handleReroll() {
    if (rerolled) return;
    // Pick different role and quirk
    const newRole  = ROLES.filter(r => r !== currentRole)[Math.floor(Math.random() * (ROLES.length - 1))];
    const newQuirk = QUIRKS.filter(q => q !== currentQuirk)[Math.floor(Math.random() * (QUIRKS.length - 1))];
    setCurrentRole(newRole);
    setCurrentQuirk(newQuirk);
    setRerolled(true);
  }

  function handleReady() {
    // FIX: pass updated playerData back to App so rerolls take effect in Game
    const updatedPlayer = {
      ...playerData,
      role: currentRole,
      quirk: currentQuirk,
    };
    onReady(updatedPlayer);
  }

  const isSolo = gameConfig?.isSolo;
  const teamSize = gameConfig?.players ? Object.keys(gameConfig.players).length : 1;

  return (
    <div style={{
      maxWidth: 440,
      margin: "0 auto",
      padding: "2rem 1.5rem",
      textAlign: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#444", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          {playerData?.name} — your role
        </p>
        {!isSolo && (
          <p style={{ color: "#333", fontSize: 11 }}>
            🔒 Keep this secret from your team. {teamSize - 1} other player{teamSize > 2 ? "s" : ""} got their own.
          </p>
        )}
      </div>

      {/* Role card */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          style={{
            width: "100%",
            background: "#1a1a1a",
            border: `1px solid ${role.color}30`,
            borderRadius: 16,
            padding: "3rem 1.5rem",
            cursor: "pointer",
            marginBottom: 20,
            minHeight: 180,
          }}
        >
          <p style={{ color: "#444", fontSize: 12, marginBottom: 12 }}>Tap to reveal your role</p>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❓</div>
          <p style={{ color: "#333", fontSize: 11 }}>Don't show anyone else's screen</p>
        </button>
      ) : (
        <div style={{
          background: "#1a1a1a",
          border: `1px solid ${role.color}40`,
          borderRadius: 16,
          padding: "1.75rem 1.5rem",
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{role.emoji}</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: role.color, marginBottom: 6 }}>{currentRole}</h1>
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 16 }}>{role.desc}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div style={{ background: "#0a1a0a", border: "0.5px solid #4ade8020", borderRadius: 8, padding: "10px" }}>
              <p style={{ fontSize: 9, color: "#4ade80", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Power</p>
              <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>{role.power}</p>
            </div>
            <div style={{ background: "#1a0a0a", border: "0.5px solid #ff444420", borderRadius: 8, padding: "10px" }}>
              <p style={{ fontSize: 9, color: "#ff4444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Weakness</p>
              <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>{role.weakness}</p>
            </div>
          </div>

          {/* Quirk */}
          <div style={{ background: "#111", border: "0.5px solid #333", borderRadius: 10, padding: "12px", marginBottom: 16 }}>
            <p style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Your personality quirk</p>
            <p style={{ fontSize: 18, marginBottom: 4 }}>{quirk.emoji}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{quirk.label}</p>
            <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>{quirk.desc}</p>
          </div>

          {/* Saboteur reveal */}
          {isSaboteur && (
            <div style={{
              background: "#1a0808",
              border: "1px solid #ff444440",
              borderRadius: 10,
              padding: "12px",
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 12, color: "#ff4444", fontWeight: 700, marginBottom: 4 }}>🐀 You are the Saboteur</p>
              <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>
                Drain money, tank morale, and don't get caught. Use the Defect action to go rogue. The team wins if they survive — you win if they don't.
              </p>
            </div>
          )}

          {/* Reroll */}
          {!rerolled && (
            <button
              onClick={handleReroll}
              style={{
                width: "100%",
                padding: "11px",
                background: "#222",
                color: "#888",
                border: "0.5px solid #333",
                borderRadius: 8,
                fontSize: 12,
                cursor: "pointer",
                marginBottom: 0,
                minHeight: 44,
              }}
            >
              🎲 Reroll role & quirk (1 free)
            </button>
          )}
          {rerolled && (
            <p style={{ fontSize: 10, color: "#333", marginTop: 4 }}>Role rerolled — only one free reroll per game.</p>
          )}
        </div>
      )}

      {revealed && (
        <button
          onClick={handleReady}
          style={{
            width: "100%",
            padding: "15px",
            background: "#ff4444",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            minHeight: 52,
          }}
        >
          {isSolo ? "Start Game →" : "I'm Ready →"}
        </button>
      )}

      {!isSolo && revealed && (
        <p style={{ color: "#333", fontSize: 11, marginTop: 10 }}>
          Game starts once all players tap Ready.
        </p>
      )}
    </div>
  );
}