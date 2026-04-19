import { initializeApp } from "firebase/app";
import {
  getDatabase, ref, increment, update, get, onValue,
  push, serverTimestamp, query, orderByChild, limitToLast
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD2-bZtW3hb3PG2JyV37oft9kNdLGTAk9w",
  authDomain: "startup-survival-d49df.firebaseapp.com",
  databaseURL: "https://startup-survival-d49df-default-rtdb.firebaseio.com",
  projectId: "startup-survival-d49df",
  storageBucket: "startup-survival-d49df.firebasestorage.app",
  messagingSenderId: "151610066354",
  appId: "1:151610066354:web:280c76976f95abefc110ab"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// ─── Player count ─────────────────────────────────────────────────
export async function incrementPlayerCount() {
  try { await update(ref(db, "stats"), { totalPlayers: increment(1) }); } catch {}
}
export async function getPlayerCount() {
  try {
    const snap = await get(ref(db, "stats/totalPlayers"));
    return snap.exists() ? snap.val() : 0;
  } catch { return 0; }
}

// ─── Shared game state ────────────────────────────────────────────
export async function initGameState(roomCode, startMoney) {
  try {
    await update(ref(db, `rooms/${roomCode}/gameState`), {
      money: startMoney, users: 0, morale: 100,
      lastUpdatedBy: null, lastAction: null,
    });
  } catch (e) { console.error("initGameState:", e); }
}

export async function applyGameStateDelta(roomCode, { moneyDelta = 0, usersDelta = 0, moraleDelta = 0 }, playerName, actionKey) {
  try {
    const updates = {};
    if (moneyDelta  !== 0) updates[`rooms/${roomCode}/gameState/money`]  = increment(moneyDelta);
    if (usersDelta  !== 0) updates[`rooms/${roomCode}/gameState/users`]  = increment(usersDelta);
    if (moraleDelta !== 0) updates[`rooms/${roomCode}/gameState/morale`] = increment(moraleDelta);
    updates[`rooms/${roomCode}/gameState/lastUpdatedBy`] = playerName;
    updates[`rooms/${roomCode}/gameState/lastAction`]    = actionKey || null;
    await update(ref(db), updates);
  } catch (e) { console.error("applyGameStateDelta:", e); }
}

export function subscribeToGameState(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/gameState`), snap => {
    if (snap.exists()) callback(snap.val());
  });
}

// ─── Game over sync ───────────────────────────────────────────────
export async function broadcastGameOver(roomCode, reason) {
  try { await update(ref(db, `rooms/${roomCode}`), { gameOver: reason }); } catch {}
}
export function subscribeToGameOver(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/gameOver`), snap => {
    if (snap.exists() && snap.val()) callback(snap.val());
  });
}

// ─── Countdown sync ───────────────────────────────────────────────
export async function broadcastCountdown(roomCode, value) {
  try { await update(ref(db, `rooms/${roomCode}`), { countdown: value }); } catch {}
}
export function subscribeToCountdown(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/countdown`), snap => {
    callback(snap.exists() ? snap.val() : null);
  });
}

// ─── Market conditions ────────────────────────────────────────────
export async function broadcastMarketCondition(roomCode, condition) {
  try {
    await update(ref(db, `rooms/${roomCode}`), {
      marketCondition: condition
        ? { id: condition.id, label: condition.label, desc: condition.desc,
            color: condition.color, expiresAt: Date.now() + condition.duration * 1000 }
        : null,
    });
  } catch {}
}
export function subscribeToMarketCondition(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/marketCondition`), snap => {
    callback(snap.exists() ? snap.val() : null);
  });
}

// ─── Shared investor pitch ────────────────────────────────────────
export async function broadcastPitchStart(roomCode) {
  try { await update(ref(db, `rooms/${roomCode}`), { pitchStartedAt: Date.now() }); } catch {}
}
export function subscribeToPitchStart(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/pitchStartedAt`), snap => {
    if (snap.exists()) callback(snap.val());
  });
}
export async function clearPitchStart(roomCode) {
  try { await update(ref(db, `rooms/${roomCode}`), { pitchStartedAt: null }); } catch {}
}
export async function broadcastPitchResult(roomCode, result) {
  try { await update(ref(db, `rooms/${roomCode}`), { pitchResult: result }); } catch {}
}
export function subscribeToPitchResult(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/pitchResult`), snap => {
    if (snap.exists() && snap.val()) callback(snap.val());
  });
}
export async function clearPitchResult(roomCode) {
  try { await update(ref(db, `rooms/${roomCode}`), { pitchResult: null }); } catch {}
}

// ─── Pitch suggestions (teammates suggest lines to host) ──────────
export async function broadcastPitchSuggestion(roomCode, playerId, playerName, text) {
  try {
    await update(ref(db, `rooms/${roomCode}/pitchSuggestions`), {
      [playerId]: { playerName, text, ts: Date.now() }
    });
  } catch {}
}
export function subscribeToPitchSuggestions(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/pitchSuggestions`), snap => {
    if (!snap.exists()) { callback([]); return; }
    const items = [];
    snap.forEach(child => items.push({ id: child.key, ...child.val() }));
    callback(items);
  });
}
export async function clearPitchSuggestions(roomCode) {
  try { await update(ref(db, `rooms/${roomCode}`), { pitchSuggestions: null }); } catch {}
}

// ─── Player presence ─────────────────────────────────────────────
export async function setPlayerOnline(roomCode, playerId, online) {
  try { await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { online }); } catch {}
}
export function subscribeToPlayers(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/players`), snap => {
    if (snap.exists()) callback(snap.val());
  });
}

// ─── Player activity status ───────────────────────────────────────
export async function setPlayerStatus(roomCode, playerId, status) {
  try {
    await update(ref(db, `rooms/${roomCode}/playerStatus`), { [playerId]: status || null });
  } catch {}
}
export function subscribeToPlayerStatuses(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/playerStatus`), snap => {
    callback(snap.exists() ? snap.val() : {});
  });
}

// ─── Host transfer ────────────────────────────────────────────────
export async function broadcastHostTransfer(roomCode, newHostId) {
  try { await update(ref(db, `rooms/${roomCode}`), { hostId: newHostId, hostTransferVote: null }); } catch {}
}
export async function voteForNewHost(roomCode, voterId, candidateId) {
  try {
    await update(ref(db, `rooms/${roomCode}/hostTransferVote`), { [voterId]: candidateId });
  } catch {}
}
export function subscribeToHostTransfer(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/hostId`), snap => {
    if (snap.exists()) callback(snap.val());
  });
}
export function subscribeToHostVotes(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/hostTransferVote`), snap => {
    callback(snap.exists() ? snap.val() : {});
  });
}

// ─── Saboteur accusation ──────────────────────────────────────────
export async function broadcastAccusation(roomCode, accuserId, accuserName, suspectId, suspectName) {
  try {
    await push(ref(db, `rooms/${roomCode}/accusations`), {
      accuserId, accuserName, suspectId, suspectName, ts: Date.now()
    });
    await broadcastSystemMessage(roomCode,
      `🚨 ${accuserName} is reporting suspicious activity from ${suspectName}! Watch your backs.`,
      "saboteur"
    );
  } catch {}
}
export function subscribeToAccusations(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/accusations`), snap => {
    if (!snap.exists()) { callback([]); return; }
    const items = [];
    snap.forEach(child => items.push({ id: child.key, ...child.val() }));
    callback(items);
  });
}

// ─── System messages ─────────────────────────────────────────────
export async function broadcastSystemMessage(roomCode, message, type = "info") {
  try {
    await push(ref(db, `rooms/${roomCode}/systemMessages`), {
      message, type, ts: serverTimestamp(),
    });
  } catch {}
}
export function subscribeToSystemMessages(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/systemMessages`), snap => {
    if (!snap.exists()) { callback([]); return; }
    const items = [];
    snap.forEach(child => items.push({ id: child.key, ...child.val() }));
    callback(items.reverse().slice(0, 10));
  });
}

// ─── Defection + rival company ────────────────────────────────────
export async function broadcastDefection(roomCode, playerName, role, rivalName) {
  try {
    await update(ref(db, `rooms/${roomCode}`), {
      defectionAlert: { playerName, role, rivalName, ts: Date.now() },
    });
    await broadcastSystemMessage(roomCode,
      `😈 ${playerName} (${role}) just betrayed the company and founded ${rivalName}!`,
      "danger"
    );
  } catch {}
}
export function subscribeToDefection(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/defectionAlert`), snap => {
    if (snap.exists() && snap.val()) callback(snap.val());
  });
}

// Rival company stats stored separately so defector has own scoreboard
export async function broadcastRivalStats(roomCode, playerId, stats) {
  try {
    await update(ref(db, `rooms/${roomCode}/rivalStats`), { [playerId]: stats });
  } catch {}
}
export function subscribeToRivalStats(roomCode, playerId, callback) {
  return onValue(ref(db, `rooms/${roomCode}/rivalStats/${playerId}`), snap => {
    callback(snap.exists() ? snap.val() : null);
  });
}

// ─── Milestones ───────────────────────────────────────────────────
export async function broadcastMilestone(roomCode, message) {
  try {
    await update(ref(db, `rooms/${roomCode}`), { milestone: { message, ts: Date.now() } });
    await broadcastSystemMessage(roomCode, message, "success");
  } catch {}
}
export function subscribeToMilestone(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/milestone`), snap => {
    if (snap.exists() && snap.val()) callback(snap.val());
  });
}

// ─── Player summaries (end-of-game debrief) ───────────────────────
export async function submitPlayerSummary(roomCode, playerId, summary) {
  try {
    await update(ref(db, `rooms/${roomCode}/playerSummaries`), { [playerId]: summary });
  } catch {}
}
export function subscribeToPlayerSummaries(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/playerSummaries`), snap => {
    callback(snap.exists() ? snap.val() : {});
  });
}

// ─── Team stacks ──────────────────────────────────────────────────
export async function incrementTeamStack(roomCode, stackKey, amount = 1) {
  try {
    await update(ref(db, `rooms/${roomCode}/teamStacks`), { [stackKey]: increment(amount) });
  } catch {}
}
export function subscribeToTeamStacks(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/teamStacks`), snap => {
    callback(snap.exists() ? snap.val() : {});
  });
}

// ─── Activity feed ────────────────────────────────────────────────
export async function addFeedItem(roomCode, playerName, role, actionKey, statSummary) {
  try {
    await push(ref(db, `rooms/${roomCode}/feed`), {
      playerName, role, actionKey, statSummary, ts: serverTimestamp(),
    });
  } catch {}
}
export function subscribeToFeed(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/feed`), snap => {
    if (!snap.exists()) { callback([]); return; }
    const items = [];
    snap.forEach(child => items.push({ id: child.key, ...child.val() }));
    callback(items.reverse().slice(0, 20));
  });
}

// ─── Event voting ─────────────────────────────────────────────────
export async function broadcastEvent(roomCode, event) {
  try {
    const now = Date.now();
    await update(ref(db, `rooms/${roomCode}`), {
      currentEvent: {
        id: event.id, text: event.text, tier: event.tier || 1,
        options: event.options, triggeredAt: now,
        expiresAt: now + 20000, resolved: false,
      },
      eventVotes: null,
    });
  } catch {}
}
export async function submitEventVote(roomCode, playerId, optionIndex) {
  try { await update(ref(db, `rooms/${roomCode}/eventVotes`), { [playerId]: optionIndex }); } catch {}
}
export function subscribeToCurrentEvent(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/currentEvent`), snap => {
    callback(snap.exists() ? snap.val() : null);
  });
}
export function subscribeToEventVotes(roomCode, callback) {
  return onValue(ref(db, `rooms/${roomCode}/eventVotes`), snap => {
    callback(snap.exists() ? snap.val() : {});
  });
}
export async function clearCurrentEvent(roomCode) {
  try { await update(ref(db, `rooms/${roomCode}`), { currentEvent: null, eventVotes: null }); } catch {}
}

// ─── Leaderboard ──────────────────────────────────────────────────
export async function submitScore({
  playerName, score, title, role, difficulty, scenario,
  reason, money, users, morale, isSolo, roomCode, teamNames = []
}) {
  try {
    const entry = {
      playerName, score, title, role, difficulty, scenario, reason,
      money, users, morale, unlisted: true, isSolo: !!isSolo,
      roomCode: roomCode || "SOLO",
      teamNames: isSolo ? [playerName] : (teamNames.length > 0 ? teamNames : [playerName]),
      contactName: null, contactEmail: null, ts: serverTimestamp(),
    };
    if (isSolo || !roomCode || roomCode === "SOLO") {
      const newRef = await push(ref(db, "leaderboard"), entry);
      return newRef.key;
    } else {
      const existingSnap = await get(ref(db, `rooms/${roomCode}/leaderboardId`));
      if (existingSnap.exists()) {
        const existingId = existingSnap.val();
        const ex = await get(ref(db, `leaderboard/${existingId}`));
        if (ex.exists() && score > (ex.val().score || 0)) {
          await update(ref(db, `leaderboard/${existingId}`), { score, title, money, users, morale, reason });
        }
        return existingId;
      } else {
        const newRef = await push(ref(db, "leaderboard"), entry);
        await update(ref(db, `rooms/${roomCode}`), { leaderboardId: newRef.key });
        return newRef.key;
      }
    }
  } catch (e) { console.error("submitScore:", e); return null; }
}

export async function unlockScore(scoreId, { contactName, contactEmail }) {
  try {
    await update(ref(db, `leaderboard/${scoreId}`), {
      unlisted: false,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
    });
  } catch {}
}

export async function getTopScores() {
  try {
    const q = query(ref(db, "leaderboard"), orderByChild("score"), limitToLast(200));
    const snap = await get(q);
    if (!snap.exists()) return [];
    const entries = [];
    snap.forEach(child => {
      const val = child.val();
      if (!val.unlisted) entries.push({ id: child.key, ...val });
    });
    return entries.sort((a, b) => b.score - a.score).slice(0, 20);
  } catch { return []; }
}

export async function getRealRank(score) {
  try {
    const snap = await get(ref(db, "leaderboard"));
    if (!snap.exists()) return { rank: 1, total: 1 };
    let rank = 1;
    let total = 0;
    snap.forEach(child => {
      total++;
      if ((child.val().score || 0) > score) rank++;
    });
    return { rank, total };
  } catch { return { rank: null, total: null }; }
}