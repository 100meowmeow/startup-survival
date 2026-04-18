import { useState, useEffect, useRef } from "react";
import { db, getPlayerCount } from "./firebase";
import { ref, set, get, onValue } from "firebase/database";

const SCENARIOS = [
  { id: "ai_hiring", name: "AI Hiring Tool", emoji: "🤖", tag: "Realistic", description: "Replace HR with algorithms. Bias lawsuits incoming. Enterprise clients are circling." },
  { id: "telehealth", name: "Telehealth for Gen Z", emoji: "🏥", tag: "Realistic", description: "HIPAA costs a fortune. Insurance won't cover you. Gen Z doesn't trust doctors anyway." },
  { id: "b2b_saas", name: "B2B SaaS for Restaurants", emoji: "⚡", tag: "Realistic", description: "Restaurants are cheap and slow. But land 10 chains and you're printing money." },
  { id: "carbon", name: "Carbon Credit Marketplace", emoji: "🌍", tag: "Realistic", description: "ESG investors love you. Oil companies want to buy you out. The science is being questioned." },
  { id: "pet_brand", name: "D2C Pet Brand", emoji: "📦", tag: "Realistic", description: "People spend more on pets than themselves. Chewy already owns this market." },
  { id: "micro_cred", name: "Micro-Credential Platform", emoji: "🎓", tag: "Realistic", description: "Universities hate you. Employers love you. Google just launched a competitor for free." },
  { id: "stock_app", name: "Gamified Stock App", emoji: "🎰", tag: "Mid Chaos", description: "Technically legal. Morally grey. Robinhood is your enemy. Congress has your name." },
  { id: "psychedelic", name: "Psychedelic Wellness Clinic", emoji: "🍄", tag: "Mid Chaos", description: "Oregon legalized it. Your investors are nervous. Your waitlist is 4,000 deep." },
  { id: "influencer_ins", name: "Influencer Insurance", emoji: "🤳", tag: "Mid Chaos", description: "What if your whole income depends on one platform not banning you? You insure that." },
  { id: "pet_dna", name: "At-Home DNA Test for Pets", emoji: "🧬", tag: "Mid Chaos", description: "People will pay anything to know their dog is 12% wolf. The science is loosely accurate." },
  { id: "ai_interior", name: "AI Interior Design App", emoji: "🏠", tag: "Mid Chaos", description: "IKEA partnership fell through. A celebrity used it wrong. Pinterest is copying you." },
  { id: "ai_gf", name: "AI Companion Subscription", emoji: "🤖", tag: "Chaotic", description: "10k paying subscribers week one. Apple pulled the app. Android didn't. Legal grey zone." },
  { id: "luxury_tp", name: "Luxury Toilet Paper Brand", emoji: "🧻", tag: "Chaotic", description: "$40 per roll. Bamboo. Carbon neutral. First customer is a rapper. This might work." },
  { id: "wfh_brand", name: "WFH Lifestyle Brand", emoji: "🏖️", tag: "Chaotic", description: "It's not a vacation rental scam, it's a lifestyle. Airbnb AND the FTC are coming." },
  { id: "divorce_ai", name: "Divorce Prediction AI", emoji: "🧠", tag: "Chaotic", description: "94% accuracy. Marriage counselors furious. Divorce lawyers are your biggest investors." },
  { id: "nap_pods", name: "Nap Pod Startup", emoji: "💤", tag: "Chaotic", description: "Sleep deprivation is a crisis. Companies want these. Unions say it's exploitation. Both true." },
  { id: "rat_app", name: "An App That's Just Rats", emoji: "🐀", tag: "Pure Chaos", description: "Nobody knows what it does. 2M users. VCs offering term sheets. You don't know why either." },
  { id: "dog_ceo", name: "Dog CEO Agency", emoji: "🐶", tag: "Pure Chaos", description: "Dogs in suits rented to companies as Chief Morale Officers. Fortune 500 clients calling." },
  { id: "taco_dao", name: "Taco Truck DAO", emoji: "🌮", tag: "Pure Chaos", description: "Blockchain-governed taco truck. Every topping requires community vote. Somehow profitable." },
  { id: "mars_real", name: "Mars Real Estate Agency", emoji: "🪐", tag: "Pure Chaos", description: "Selling land on Mars. Not legal. Not real. 500 customers. Elon is threatening to sue." },
];

const ROLES = ["CEO", "CFO", "CMO", "CTO", "COO", "Head of Sales", "Community Manager"];

const PERSONALITY_QUIRKS = [
  { id: "overconfident", label: "😤 Overconfident", desc: "Morale never drops below 40% — but bad decisions cost double." },
  { id: "cautious", label: "🤔 Cautious", desc: "Actions always work — but at 60% effectiveness." },
  { id: "charismatic", label: "😎 Charismatic", desc: "Networking and AMA always succeed — but financial decisions are riskier." },
  { id: "paranoid", label: "😰 Paranoid", desc: "You see all saboteur actions — but 20% slower on activities." },
  { id: "lucky", label: "🍀 Lucky", desc: "Random events have a 30% chance to flip positive." },
  { id: "reckless", label: "🎲 Reckless", desc: "All outcomes doubled — double wins AND double losses." },
  { id: "methodical", label: "📋 Methodical", desc: "Stacks build 50% faster — but one action at a time." },
  { id: "wildcard", label: "🃏 Wildcard", desc: "Every action has a 20% chance of a completely random outcome." },
];

const TAG_COLORS = {
  "Realistic": "#60a5fa",
  "Mid Chaos": "#facc15",
  "Chaotic": "#fb923c",
  "Pure Chaos": "#ff4444",
};

const DIFFICULTY_INFO = {
  intern:  { label: "🎓 Intern",  desc: "Slower events, more cash, hints shown. Great for learning.", color: "#4ade80" },
  founder: { label: "🚀 Founder", desc: "Standard experience. No training wheels.", color: "#fff" },
  veteran: { label: "⚡ Veteran", desc: "Faster events, harsher consequences, worse luck.", color: "#fb923c" },
  shark:   { label: "🦈 Shark",   desc: "Brutal. Cursed luck. Beatable with skill.", color: "#ff4444" },
};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function assignRoles(players, numSaboteurs) {
  const shuffledRoles = [...ROLES].sort(() => Math.random() - 0.5);
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const assignments = {};
  shuffledPlayers.forEach((pid, i) => {
    assignments[pid] = {
      role: shuffledRoles[i % shuffledRoles.length],
      isSaboteur: i < numSaboteurs,
      quirk: PERSONALITY_QUIRKS[Math.floor(Math.random() * PERSONALITY_QUIRKS.length)].id,
    };
  });
  return assignments;
}

function assignQuirk() {
  return PERSONALITY_QUIRKS[Math.floor(Math.random() * PERSONALITY_QUIRKS.length)].id;
}

function randomScenario() {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}

export default function Lobby({ onGameStart }) {
  const [mode, setMode] = useState(null);
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [myId] = useState(() => Math.random().toString(36).substring(2, 10));
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const [scenario, setScenario] = useState(() => randomScenario());
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [gameLength, setGameLength] = useState(10);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [numSaboteurs, setNumSaboteurs] = useState(1);
  const [difficulty, setDifficulty] = useState("founder");
  const [ranked, setRanked] = useState(false);
  const [soloSaboteurMode, setSoloSaboteurMode] = useState("none");

  const roomCodeRef = useRef("");

  useEffect(() => {
    getPlayerCount().then(count => setGamesPlayed(count));
  }, []);

  function handleReroll() {
    if (rerollsUsed === 0) {
      setScenario(randomScenario());
      setRerollsUsed(1);
    }
  }

  function handleStartSolo() {
    if (!name.trim()) return;
    const soloRole = ROLES[Math.floor(Math.random() * ROLES.length)];
    const isSaboteur = soloSaboteurMode === "play_as_saboteur";
    const quirk = assignQuirk();
    onGameStart(
      { gameLength, maxPlayers: 1, numSaboteurs: soloSaboteurMode === "ai_saboteur" ? 1 : 0, scenario, roomCode: "SOLO", players: { [myId]: { name: name.trim() } }, roleAssignments: { [myId]: { role: soloRole, isSaboteur, quirk } }, isSolo: true, soloSaboteurMode, ranked, difficulty },
      { id: myId, name: name.trim(), role: soloRole, isSaboteur, quirk }
    );
  }

  async function handleHost() {
    if (!name.trim()) return;
    const code = generateRoomCode();
    roomCodeRef.current = code;
    const room = {
      code,
      hostId: myId,
      status: "waiting",
      settings: { gameLength, maxPlayers, numSaboteurs, scenario, ranked, difficulty },
      players: { [myId]: { name: name.trim(), ready: false } },
    };
    await set(ref(db, `rooms/${code}`), room);
    setRoomCode(code);
    setIsHost(true);
    listenToRoom(code);
  }

  async function handleJoin() {
    if (!name.trim() || !roomCode.trim()) return;
    setJoining(true);
    setError("");
    const snap = await get(ref(db, `rooms/${roomCode.toUpperCase()}`));
    if (!snap.exists()) { setError("Room not found."); setJoining(false); return; }
    const room = snap.val();
    if (room.status !== "waiting") { setError("This game already started."); setJoining(false); return; }
    const currentPlayers = Object.keys(room.players || {}).length;
    if (currentPlayers >= room.settings.maxPlayers) { setError("Room is full."); setJoining(false); return; }
    await set(ref(db, `rooms/${roomCode.toUpperCase()}/players/${myId}`), { name: name.trim(), ready: false });
    roomCodeRef.current = roomCode.toUpperCase();
    listenToRoom(roomCode.toUpperCase());
    setJoining(false);
  }

  function listenToRoom(code) {
    onValue(ref(db, `rooms/${code}`), (snap) => {
      if (snap.exists()) setRoomData(snap.val());
    });
  }

  async function handleStartGame() {
    if (!roomData) return;
    const players = Object.keys(roomData.players);
    const roleAssignments = assignRoles(players, numSaboteurs);
    await set(ref(db, `rooms/${roomCodeRef.current}/roleAssignments`), roleAssignments);
    await set(ref(db, `rooms/${roomCodeRef.current}/status`), "started");
    const myRole = roleAssignments[myId];
    onGameStart(
      { ...roomData.settings, roomCode: roomCodeRef.current, players: roomData.players, roleAssignments },
      { id: myId, name: name.trim(), ...myRole }
    );
  }

  if (roomData?.status === "started" && roomData?.roleAssignments?.[myId]) {
    const myRole = roomData.roleAssignments[myId];
    onGameStart(
      { ...roomData.settings, roomCode: roomData.code || roomCodeRef.current, players: roomData.players, roleAssignments: roomData.roleAssignments },
      { id: myId, name: name.trim(), ...myRole }
    );
  }

  const players = roomData?.players ? Object.values(roomData.players) : [];
  const numPlayers = players.length;
  const canStart = isHost && numPlayers >= 2;

  if (showTutorial) return <Tutorial onDone={() => setShowTutorial(false)} />;
  if (showScenarioPicker) return (
    <ScenarioPicker scenarios={SCENARIOS} onPick={(s) => { setScenario(s); setShowScenarioPicker(false); }} onClose={() => setShowScenarioPicker(false)} />
  );

  // Room waiting screen
  if (roomData && (isHost || !joining)) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32 }}>💀</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#ff4444" }}>STARTUP SURVIVAL</h1>
        </div>

        <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, padding: "1.25rem", marginBottom: 12 }}>
          <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Room code — share this</p>
          <p style={{ fontSize: 38, fontWeight: 700, letterSpacing: 8, color: "#ff4444", fontFamily: "monospace" }}>{roomCode || roomData.code}</p>
        </div>

        <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, padding: "1.25rem", marginBottom: 12 }}>
          <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Players ({numPlayers}/{roomData.settings?.maxPlayers})</p>
          {players.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: 13 }}>{p.name}</span>
              {i === 0 && <span style={{ fontSize: 9, color: "#555", background: "#222", padding: "1px 6px", borderRadius: 4 }}>host</span>}
            </div>
          ))}
          {numPlayers < 2 && <p style={{ color: "#444", fontSize: 11, marginTop: 6 }}>Waiting for at least 2 players...</p>}
        </div>

        {isHost && (
          <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, padding: "1.25rem", marginBottom: 12 }}>
            <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Settings</p>

            <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Game length</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
              {[5, 10].map(t => (
                <button key={t} onClick={() => setGameLength(t)}
                  style={{ padding: "6px 12px", background: gameLength === t ? "#ff4444" : "#111", color: gameLength === t ? "#fff" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {t} min
                </button>
              ))}
              {[15, 20].map(t => (
                <button key={t} onClick={() => setGameLength(t)}
                  style={{ padding: "6px 12px", background: gameLength === t ? "#facc15" : "#111", color: gameLength === t ? "#000" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {t} min 💛
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Difficulty</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
              {Object.entries(DIFFICULTY_INFO).map(([id, info]) => (
                <button key={id} onClick={() => setDifficulty(id)}
                  style={{ padding: "6px 12px", background: difficulty === id ? info.color : "#111", color: difficulty === id ? "#000" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {info.label}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Saboteurs</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
              {[0, 1, 2, 3].map(n => (
                <button key={n} onClick={() => setNumSaboteurs(n)}
                  style={{ padding: "6px 12px", background: numSaboteurs === n ? "#ff4444" : "#111", color: numSaboteurs === n ? "#fff" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {n}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Scenario</p>
            <div style={{ background: "#111", borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{scenario?.emoji}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>{scenario?.name}</p>
                  <p style={{ fontSize: 10, color: TAG_COLORS[scenario?.tag] }}>{scenario?.tag}</p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <button onClick={handleReroll} disabled={rerollsUsed >= 1}
                style={{ flex: 1, padding: "7px", background: rerollsUsed === 0 ? "#222" : "#111", color: rerollsUsed === 0 ? "#aaa" : "#444", border: "0.5px solid #333", borderRadius: 6, fontSize: 10, cursor: rerollsUsed === 0 ? "pointer" : "default" }}>
                {rerollsUsed === 0 ? "🎲 Re-roll (1 free)" : "🎲 Re-roll used"}
              </button>
              <button onClick={() => setShowScenarioPicker(true)}
                style={{ flex: 1, padding: "7px", background: "#111", color: "#facc15", border: "0.5px solid #facc1530", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>
                💛 Pick mine ($0.99)
              </button>
            </div>

            <button onClick={() => setRanked(!ranked)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <p style={{ fontSize: 11, color: ranked ? "#facc15" : "#555" }}>{ranked ? "🏆 Ranked mode ON" : "🏆 Enable ranked mode"}</p>
            </button>
          </div>
        )}

        {canStart && (
          <button onClick={handleStartGame}
            style={{ width: "100%", padding: "13px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
            Start Game →
          </button>
        )}
        {!canStart && isHost && <p style={{ textAlign: "center", color: "#444", fontSize: 11, marginBottom: 10 }}>Need at least 2 players to start</p>}
        {!isHost && (
          <div style={{ textAlign: "center", padding: "1rem", background: "#1a1a1a", borderRadius: 8 }}>
            <p style={{ color: "#666", fontSize: 13 }}>Waiting for host to start...</p>
          </div>
        )}
      </div>
    );
  }

  // Main menu
  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "2.5rem 1.5rem", textAlign: "center" }}>
      <div style={{ fontSize: 44, marginBottom: 8 }}>💀</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#ff4444", marginBottom: 4 }}>STARTUP SURVIVAL</h1>
      <p style={{ color: "#555", fontSize: 12, marginBottom: 8 }}>Most startups fail. Yours probably will too.</p>
      {gamesPlayed > 0 && (
        <p style={{ color: "#333", fontSize: 11, marginBottom: 24 }}>🎮 {gamesPlayed.toLocaleString()} games played</p>
      )}

      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
        style={{ width: "100%", padding: "12px 16px", background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

      {!mode && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <button onClick={() => name.trim() && setMode("solo")} disabled={!name.trim()}
            style={{ width: "100%", padding: "13px", background: name.trim() ? "#ff4444" : "#1a1a1a", color: name.trim() ? "#fff" : "#444", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: name.trim() ? "pointer" : "default" }}>
            🎮 Play Solo
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => name.trim() && setMode("host")} disabled={!name.trim()}
              style={{ flex: 1, padding: "12px", background: "#1a1a1a", color: name.trim() ? "#aaa" : "#444", border: "0.5px solid #333", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: name.trim() ? "pointer" : "default" }}>
              Host Game
            </button>
            <button onClick={() => name.trim() && setMode("join")} disabled={!name.trim()}
              style={{ flex: 1, padding: "12px", background: "#1a1a1a", color: name.trim() ? "#aaa" : "#444", border: "0.5px solid #333", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: name.trim() ? "pointer" : "default" }}>
              Join Game
            </button>
          </div>
        </div>
      )}

      {/* Solo mode */}
      {mode === "solo" && (
        <div style={{ textAlign: "left" }}>
          <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 12, padding: "1.25rem", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Startup scenario</p>
              <span style={{ fontSize: 9, color: TAG_COLORS[scenario.tag], background: "#111", padding: "2px 6px", borderRadius: 4 }}>{scenario.tag}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 26 }}>{scenario.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{scenario.name}</span>
            </div>
            <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 10 }}>{scenario.description}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleReroll} disabled={rerollsUsed >= 1}
                style={{ flex: 1, padding: "7px", background: rerollsUsed === 0 ? "#222" : "#111", color: rerollsUsed === 0 ? "#aaa" : "#444", border: "0.5px solid #333", borderRadius: 6, fontSize: 10, cursor: rerollsUsed === 0 ? "pointer" : "default" }}>
                {rerollsUsed === 0 ? "🎲 Re-roll (1 free)" : "🎲 Re-roll used"}
              </button>
              <button onClick={() => setShowScenarioPicker(true)}
                style={{ flex: 1, padding: "7px", background: "#111", color: "#facc15", border: "0.5px solid #facc1530", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>
                💛 Pick mine ($0.99)
              </button>
            </div>
          </div>

          <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 12, padding: "1.25rem", marginBottom: 10 }}>
            <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Difficulty</p>
            {Object.entries(DIFFICULTY_INFO).map(([id, info]) => (
              <button key={id} onClick={() => setDifficulty(id)}
                style={{ width: "100%", padding: "9px 12px", background: difficulty === id ? "#1a1a1a" : "#111", border: `0.5px solid ${difficulty === id ? info.color : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left", marginBottom: 6 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: difficulty === id ? info.color : "#666", marginBottom: 2 }}>{info.label}</p>
                <p style={{ fontSize: 10, color: "#444" }}>{info.desc}</p>
              </button>
            ))}
          </div>

          <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 12, padding: "1.25rem", marginBottom: 10 }}>
            <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Saboteur mode</p>
            {[
              { id: "none", label: "🧠 No saboteur", desc: "Pure strategy. Build the company alone." },
              { id: "ai_saboteur", label: "🐀 AI saboteur active", desc: "Random sabotage events happen automatically." },
              { id: "play_as_saboteur", label: "😈 I am the saboteur", desc: "You play as the rat. Destroy the AI company." },
            ].map(opt => (
              <button key={opt.id} onClick={() => setSoloSaboteurMode(opt.id)}
                style={{ width: "100%", padding: "9px 12px", background: soloSaboteurMode === opt.id ? "#222" : "#111", border: `0.5px solid ${soloSaboteurMode === opt.id ? "#444" : "#222"}`, borderRadius: 8, cursor: "pointer", textAlign: "left", marginBottom: 6 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: soloSaboteurMode === opt.id ? "#fff" : "#666", marginBottom: 2 }}>{opt.label}</p>
                <p style={{ fontSize: 10, color: "#444" }}>{opt.desc}</p>
              </button>
            ))}
          </div>

          <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 12, padding: "1.25rem", marginBottom: 10 }}>
            <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Game length</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[5, 10].map(t => (
                <button key={t} onClick={() => setGameLength(t)}
                  style={{ padding: "7px 14px", background: gameLength === t ? "#ff4444" : "#111", color: gameLength === t ? "#fff" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                  {t} min
                </button>
              ))}
              {[15, 20].map(t => (
                <button key={t} onClick={() => setGameLength(t)}
                  style={{ padding: "7px 14px", background: gameLength === t ? "#facc15" : "#111", color: gameLength === t ? "#000" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                  {t} min 💛
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 14 }}>
            <button onClick={() => setRanked(!ranked)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", width: "100%" }}>
              <p style={{ fontSize: 12, color: ranked ? "#facc15" : "#666", fontWeight: ranked ? 700 : 400 }}>{ranked ? "🏆 Ranked mode ON" : "🏆 Ranked mode OFF"}</p>
              <p style={{ fontSize: 10, color: "#444", marginTop: 2 }}>Ranked scores are eligible for the leaderboard. Locking costs $1.99 after the game.</p>
            </button>
          </div>

          <button onClick={handleStartSolo}
            style={{ width: "100%", padding: "13px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
            Start Solo Game →
          </button>
          <button onClick={() => setMode(null)}
            style={{ width: "100%", padding: "9px", background: "none", color: "#444", border: "none", cursor: "pointer", fontSize: 12 }}>
            Back
          </button>
        </div>
      )}

      {/* Host mode */}
      {mode === "host" && !roomData && (
        <div style={{ textAlign: "left" }}>
          <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 12, padding: "1.25rem", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Scenario</p>
              <span style={{ fontSize: 9, color: TAG_COLORS[scenario.tag], background: "#111", padding: "2px 6px", borderRadius: 4 }}>{scenario.tag}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 26 }}>{scenario.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{scenario.name}</span>
            </div>
            <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 10 }}>{scenario.description}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleReroll} disabled={rerollsUsed >= 1}
                style={{ flex: 1, padding: "7px", background: rerollsUsed === 0 ? "#222" : "#111", color: rerollsUsed === 0 ? "#aaa" : "#444", border: "0.5px solid #333", borderRadius: 6, fontSize: 10, cursor: rerollsUsed === 0 ? "pointer" : "default" }}>
                {rerollsUsed === 0 ? "🎲 Re-roll (1 free)" : "🎲 Re-roll used"}
              </button>
              <button onClick={() => setShowScenarioPicker(true)}
                style={{ flex: 1, padding: "7px", background: "#111", color: "#facc15", border: "0.5px solid #facc1530", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>
                💛 Pick mine ($0.99)
              </button>
            </div>
          </div>

          <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 12, padding: "1.25rem", marginBottom: 10 }}>
            <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Settings</p>

            <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Game length</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
              {[5, 10].map(t => (
                <button key={t} onClick={() => setGameLength(t)}
                  style={{ padding: "6px 12px", background: gameLength === t ? "#ff4444" : "#111", color: gameLength === t ? "#fff" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {t} min
                </button>
              ))}
              {[15, 20].map(t => (
                <button key={t} onClick={() => setGameLength(t)}
                  style={{ padding: "6px 12px", background: gameLength === t ? "#facc15" : "#111", color: gameLength === t ? "#000" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {t} min 💛
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Difficulty</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
              {Object.entries(DIFFICULTY_INFO).map(([id, info]) => (
                <button key={id} onClick={() => setDifficulty(id)}
                  style={{ padding: "6px 12px", background: difficulty === id ? info.color : "#111", color: difficulty === id ? "#000" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {info.label}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Max players</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
              {[2, 3, 4].map(n => (
                <button key={n} onClick={() => setMaxPlayers(n)}
                  style={{ padding: "6px 12px", background: maxPlayers === n ? "#ff4444" : "#111", color: maxPlayers === n ? "#fff" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {n}
                </button>
              ))}
              {[5, 6].map(n => (
                <button key={n} onClick={() => setMaxPlayers(n)}
                  style={{ padding: "6px 12px", background: maxPlayers === n ? "#facc15" : "#111", color: maxPlayers === n ? "#000" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {n} 💛
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Saboteurs</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
              {[0, 1, 2, 3].map(n => (
                <button key={n} onClick={() => setNumSaboteurs(n)}
                  style={{ padding: "6px 12px", background: numSaboteurs === n ? "#ff4444" : "#111", color: numSaboteurs === n ? "#fff" : "#666", border: "0.5px solid #333", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                  {n}
                </button>
              ))}
            </div>

            <button onClick={() => setRanked(!ranked)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <p style={{ fontSize: 11, color: ranked ? "#facc15" : "#555" }}>{ranked ? "🏆 Ranked mode ON" : "🏆 Enable ranked mode"}</p>
            </button>
          </div>

          <button onClick={handleHost}
            style={{ width: "100%", padding: "13px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
            Create Room →
          </button>
          <button onClick={() => setMode(null)}
            style={{ width: "100%", padding: "9px", background: "none", color: "#444", border: "none", cursor: "pointer", fontSize: 12 }}>
            Back
          </button>
        </div>
      )}

      {/* Join mode */}
      {mode === "join" && (
        <div>
          <input value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} placeholder="Room code" maxLength={4}
            style={{ width: "100%", padding: "12px", background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 8, color: "#fff", fontSize: 24, fontWeight: 700, letterSpacing: 8, outline: "none", boxSizing: "border-box", marginBottom: 10, textAlign: "center", fontFamily: "monospace" }} />
          {error && <p style={{ color: "#ff4444", fontSize: 12, marginBottom: 10 }}>{error}</p>}
          <button onClick={handleJoin} disabled={!roomCode.trim()}
            style={{ width: "100%", padding: "13px", background: roomCode.trim() ? "#ff4444" : "#1a1a1a", color: roomCode.trim() ? "#fff" : "#444", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: roomCode.trim() ? "pointer" : "default", marginBottom: 10 }}>
            Join Room →
          </button>
          <button onClick={() => setMode(null)}
            style={{ width: "100%", padding: "9px", background: "none", color: "#444", border: "none", cursor: "pointer", fontSize: 12 }}>
            Back
          </button>
        </div>
      )}

      <button onClick={() => setShowTutorial(true)}
        style={{ marginTop: 16, background: "none", border: "none", color: "#333", fontSize: 11, cursor: "pointer" }}>
        How to play?
      </button>
    </div>
  );
}

function ScenarioPicker({ scenarios, onPick, onClose }) {
  const TAG_ORDER = ["Realistic", "Mid Chaos", "Chaotic", "Pure Chaos"];
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Pick your scenario</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 14, cursor: "pointer" }}>✕</button>
      </div>
      <p style={{ color: "#555", fontSize: 11, marginBottom: 14 }}>💛 $0.99 — charged at checkout after selection</p>
      {TAG_ORDER.map(tag => (
        <div key={tag} style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: TAG_COLORS[tag], textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{tag}</p>
          {scenarios.filter(s => s.tag === tag).map(s => (
            <button key={s.id} onClick={() => onPick(s)}
              style={{ width: "100%", background: "#1a1a1a", border: "0.5px solid #333", borderRadius: 10, padding: "11px", marginBottom: 5, textAlign: "left", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{s.name}</p>
                  <p style={{ fontSize: 10, color: "#555" }}>{s.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Tutorial({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Welcome to Startup Survival", body: "Build a startup under pressure. Events hit constantly. Every decision has consequences. Most companies die. That's fine.", emoji: "💀" },
    { title: "Your role and quirk matter", body: "Each player gets a secret role and a personality quirk. CEO + Reckless is very different from CEO + Cautious. Quirks affect every outcome.", emoji: "🎭" },
    { title: "Never stop moving", body: "There's no downtime. Use your role actions, answer business quizzes, spam customers, run A/B tests. Stack advantages and watch them compound.", emoji: "⚡" },
    { title: "Discover secret combos", body: "Some action combinations unlock powerful bonuses nobody told you about. Blog posts + networking + pitch practice = a media moment. Find the combos.", emoji: "🔮" },
    { title: "Watch for the rat", body: "Someone might be the Saboteur. Money going missing? Morale dropping for no reason? Start asking questions in chat.", emoji: "🐀" },
    { title: "Market conditions shift", body: "The market changes mid-game. Recession hits. AI hype peaks. Regulatory crackdowns. Time your actions around market conditions.", emoji: "📈" },
    { title: "You're ready", body: "Survive the timer or get acquired to win. Good luck. You'll probably need it.", emoji: "🏆" },
  ];
  const s = steps[step];
  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>{s.emoji}</div>
      <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10 }}>{s.title}</h2>
      <p style={{ color: "#777", fontSize: 13, lineHeight: 1.7, marginBottom: 28 }}>{s.body}</p>
      <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 22 }}>
        {steps.map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i === step ? "#ff4444" : "#222" }} />)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {step > 0 && <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: "11px", background: "#1a1a1a", color: "#777", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Back</button>}
        {step < steps.length - 1
          ? <button onClick={() => setStep(step + 1)} style={{ flex: 1, padding: "11px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Next →</button>
          : <button onClick={onDone} style={{ flex: 1, padding: "11px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Let's Go →</button>
        }
      </div>
      <button onClick={onDone} style={{ marginTop: 12, background: "none", border: "none", color: "#333", fontSize: 11, cursor: "pointer" }}>Skip tutorial</button>
    </div>
  );
}