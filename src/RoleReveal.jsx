import { useState } from "react";

const ROLES = ["CEO", "CFO", "CMO", "CTO", "COO", "Head of Sales", "Community Manager"];

const QUIRKS = ["overconfident", "cautious", "charismatic", "paranoid", "lucky", "reckless", "methodical", "wildcard"];

const ROLE_INFO = {
  "CEO": {
    emoji: "👑", color: "#60a5fa",
    description: "You control company direction. Tiebreaker votes are yours. If the company dies, you take extra blame on the leaderboard.",
    power: "Pivot the startup once. Fire a teammate. Call All-Hands to boost morale.",
    weakness: "All losses land harder on you. The team will blame you first.",
    tip: "Watch your team carefully. Someone might be working against you.",
  },
  "CFO": {
    emoji: "💰", color: "#4ade80",
    description: "You see financial info others can't. You approve big purchases. You can secretly build an emergency reserve — or secretly drain the company.",
    power: "Run financial models to preview events. Lock away emergency funds. Audit who spent what.",
    weakness: "If embezzlement is discovered, you lose half your leaderboard score permanently.",
    tip: "The Audit Trail activity is your best weapon against a Saboteur draining funds.",
  },
  "CMO": {
    emoji: "📣", color: "#facc15",
    description: "You grow the user base faster than anyone. Marketing is your weapon. Spam too much and it backfires spectacularly.",
    power: "Campaign Blasts, Brand Refreshes, and manufacturing viral moments.",
    weakness: "Overspamming triggers a reputation collapse — users churn 3x faster for 2 minutes.",
    tip: "Stack your marketing channels. Each 500 users unlocks better conversion rates.",
  },
  "CTO": {
    emoji: "💻", color: "#f472b6",
    description: "You build the product. Ship fast and break things, or build slow and stable. Tech debt is invisible until it isn't.",
    power: "Ship features, fix debt, and secretly plant bugs in competitor apps.",
    weakness: "Skipped bug fixes stack hidden debt. Too much and random crashes start happening.",
    tip: "Ship 3 features in a row to build a Tech Moat — competitor attacks bounce off for 3 minutes.",
  },
  "COO": {
    emoji: "⚙️", color: "#a78bfa",
    description: "You make everything run smoother over time. Hiring and automation compound into a massive late-game advantage.",
    power: "Automate actions to run passively. Hire NPCs. Use your one-time Saboteur audit.",
    weakness: "Hire too fast and culture collapses — instant -20 morale.",
    tip: "Your Systems Audit is the most powerful tool in the game. Save it for when you're sure.",
  },
  "Head of Sales": {
    emoji: "🤝", color: "#fb923c",
    description: "You are the only role that directly generates revenue. Without you the company is just vibes and users.",
    power: "Cold calls, enterprise pitches, and flash sales that spike revenue instantly.",
    weakness: "Overpromising triggers refund waves that can wipe a full round of revenue.",
    tip: "Make 10 cold calls and your success rate jumps from 30% to 60% permanently.",
  },
  "Community Manager": {
    emoji: "🫂", color: "#2dd4bf",
    description: "Everyone likes you. High morale under your watch triggers organic growth that costs nothing.",
    power: "Host AMAs, force a Town Hall that overrules the CEO, send personalized outreach.",
    weakness: "You cannot generate revenue alone. You need a team that builds something worth loving.",
    tip: "Keep morale above 80% and watch users grow on their own. Stack this with the CMO's channels.",
  },
};

const QUIRK_INFO = {
  overconfident: { label: "😤 Overconfident", desc: "Your morale never drops below 40% — but bad decisions cost double.", color: "#fb923c" },
  cautious:      { label: "🤔 Cautious",       desc: "Your actions always work — but at 60% effectiveness.", color: "#60a5fa" },
  charismatic:   { label: "😎 Charismatic",    desc: "Networking and AMA always succeed — but financial decisions are riskier.", color: "#facc15" },
  paranoid:      { label: "😰 Paranoid",       desc: "You see all saboteur actions — but you're 20% slower on activities.", color: "#a78bfa" },
  lucky:         { label: "🍀 Lucky",          desc: "Random events have a 30% chance to flip positive.", color: "#4ade80" },
  reckless:      { label: "🎲 Reckless",       desc: "All outcomes doubled — double wins AND double losses.", color: "#ff4444" },
  methodical:    { label: "📋 Methodical",     desc: "Stacks build 50% faster — but one action at a time.", color: "#2dd4bf" },
  wildcard:      { label: "🃏 Wildcard",       desc: "Every action has a 20% chance of a completely random outcome.", color: "#f472b6" },
};

const SABOTEUR_TIPS = [
  "Stay quiet early. Let the company build something worth destroying.",
  "Use Morale Drain sparingly — too many anonymous events raises suspicion.",
  "The CFO Audit Trail can expose you. Be careful around the CFO.",
  "If you defect and go solo, you lose your saboteur bonus. Stay hidden.",
  "Your biggest win is getting the blame placed on the wrong person.",
  "The COO has a one-time audit that can reveal you. Watch for it.",
];

const STRIPE_REROLL = "https://buy.stripe.com/6oUfZg5XZeXgebc3P28Zq07";

function randomRoleExcluding(currentRole) {
  const pool = ROLES.filter(r => r !== currentRole);
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomQuirkExcluding(currentQuirk) {
  const pool = QUIRKS.filter(q => q !== currentQuirk);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function RoleReveal({ playerData, onReady }) {
  const [revealed, setRevealed] = useState(false);
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const [countdown, setCountdown] = useState(null);

  // Local state for the displayed role/quirk — starts from playerData
  const [currentRole, setCurrentRole] = useState(playerData.role);
  const [currentQuirk, setCurrentQuirk] = useState(playerData.quirk);

  const info = ROLE_INFO[currentRole] || {
    emoji: "❓", color: "#888",
    description: "Unknown role.", power: "Unknown", weakness: "Unknown", tip: "Figure it out.",
  };
  const quirkInfo = QUIRK_INFO[currentQuirk];

  function handleReveal() {
    setRevealed(true);
    let c = 8;
    setCountdown(c);
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) clearInterval(t);
    }, 1000);
  }

  function handleFreeReroll() {
    // Pick a genuinely different role and quirk
    const newRole = randomRoleExcluding(currentRole);
    const newQuirk = randomQuirkExcluding(currentQuirk);
    setCurrentRole(newRole);
    setCurrentQuirk(newQuirk);
    setRerollsUsed(1);
  }

  function handlePaidReroll() {
    window.location.href = STRIPE_REROLL;
  }

  // Called when returning from Stripe with ?paid=reroll
  // (App.jsx or Lobby should handle this, but as a safety net we also check here)

  function handleReady() {
    // Pass updated role/quirk back up so the game uses the rerolled values
    onReady({ ...playerData, role: currentRole, quirk: currentQuirk });
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "2rem 1.5rem", textAlign: "center" }}>
      <p style={{ color: "#444", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>
        Your secret role — don't show anyone
      </p>

      {!revealed ? (
        <div>
          <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 16, padding: "3rem 2rem", marginBottom: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 14 }}>🎴</div>
            <p style={{ color: "#666", fontSize: 13 }}>Tap to reveal your role</p>
            <p style={{ color: "#444", fontSize: 11, marginTop: 6 }}>Make sure nobody is looking at your screen</p>
          </div>
          <button onClick={handleReveal}
            style={{ width: "100%", padding: "14px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Reveal My Role
          </button>
        </div>
      ) : (
        <div>
          {/* Saboteur banner */}
          {playerData.isSaboteur && (
            <div style={{ background: "#1a0808", border: "1px solid #ff444440", borderRadius: 12, padding: "1rem", marginBottom: 14 }}>
              <p style={{ color: "#ff4444", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🐀 You are also a Saboteur</p>
              <p style={{ color: "#777", fontSize: 12 }}>{SABOTEUR_TIPS[Math.floor(Math.random() * SABOTEUR_TIPS.length)]}</p>
            </div>
          )}

          {/* Role card */}
          <div style={{ background: "#1a1a1a", border: `1px solid ${info.color}40`, borderRadius: 16, padding: "1.5rem", marginBottom: 12, textAlign: "left" }}>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 46, marginBottom: 6 }}>{info.emoji}</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: info.color }}>{currentRole}</h2>
            </div>

            <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6, marginBottom: 14 }}>{info.description}</p>

            <div style={{ background: "#111", borderRadius: 8, padding: "11px", marginBottom: 8 }}>
              <p style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Your powers</p>
              <p style={{ fontSize: 11, color: "#888" }}>{info.power}</p>
            </div>

            <div style={{ background: "#111", borderRadius: 8, padding: "11px", marginBottom: 8 }}>
              <p style={{ fontSize: 9, color: "#ff444460", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Your weakness</p>
              <p style={{ fontSize: 11, color: "#888" }}>{info.weakness}</p>
            </div>

            <div style={{ background: "#111", borderRadius: 8, padding: "11px" }}>
              <p style={{ fontSize: 9, color: "#4ade8060", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Pro tip</p>
              <p style={{ fontSize: 11, color: "#888" }}>{info.tip}</p>
            </div>
          </div>

          {/* Quirk card */}
          {quirkInfo && (
            <div style={{ background: "#1a1a1a", border: `1px solid ${quirkInfo.color}30`, borderRadius: 12, padding: "1rem", marginBottom: 12, textAlign: "left" }}>
              <p style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Your personality quirk</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: quirkInfo.color, marginBottom: 4 }}>{quirkInfo.label}</p>
              <p style={{ fontSize: 11, color: "#777" }}>{quirkInfo.desc}</p>
            </div>
          )}

          {/* Reroll buttons — always shown, change based on rerollsUsed */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {rerollsUsed === 0 ? (
              <>
                <button onClick={handleFreeReroll}
                  style={{ flex: 1, padding: "9px", background: "#1a1a1a", color: "#aaa", border: "0.5px solid #333", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>
                  🎲 Re-roll role (1 free)
                </button>
                <button onClick={handlePaidReroll}
                  style={{ flex: 1, padding: "9px", background: "#1a1a1a", color: "#facc15", border: "0.5px solid #facc1530", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>
                  💛 2nd re-roll ($0.99)
                </button>
              </>
            ) : (
              <button onClick={handlePaidReroll}
                style={{ width: "100%", padding: "9px", background: "#1a1a1a", color: "#facc15", border: "0.5px solid #facc1530", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>
                💛 Re-roll again ($0.99)
              </button>
            )}
          </div>

          <button onClick={handleReady}
            style={{ width: "100%", padding: "13px", background: info.color, color: "#000", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            I'm Ready → {countdown !== null && countdown > 0 ? `(${countdown})` : ""}
          </button>

          <p style={{ color: "#333", fontSize: 10, marginTop: 10 }}>
            Your role shown to teammates: <strong style={{ color: "#444" }}>{currentRole}</strong>
            {playerData.isSaboteur && <span style={{ color: "#ff4444" }}> (they don't know you're also a Saboteur)</span>}
          </p>
        </div>
      )}
    </div>
  );
}