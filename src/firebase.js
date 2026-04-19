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
  try {
    await update(ref(db, "stats"), { totalPlayers: increment(1) });
  } catch {}
}

export async function getPlayerCount() {
  try {
    const snap = await get(ref(db, "stats/totalPlayers"));
    return snap.exists() ? snap.val() : 0;
  } catch { return 0; }
}

// ─── Multiplayer game state ───────────────────────────────────────
export async function initGameState(roomCode, startMoney) {
  try {
    await update(ref(db, `rooms/${roomCode}/gameState`), {
      money: startMoney, users: 0, morale: 100,
      lastUpdatedBy: null, lastAction: null,
    });
  } catch (e) { console.error("initGameState failed:", e); }
}

export async function applyGameStateDelta(roomCode, { moneyDelta = 0, usersDelta = 0, moraleDelta = 0 }, playerName, actionKey) {
  try {
    const updates = {};
    if (moneyDelta !== 0) updates[`rooms/${roomCode}/gameState/money`] = increment(moneyDelta);
    if (usersDelta !== 0) updates[`rooms/${roomCode}/gameState/users`] = increment(usersDelta);
    if (moraleDelta !== 0) updates[`rooms/${roomCode}/gameState/morale`] = increment(moraleDelta);
    updates[`rooms/${roomCode}/gameState/lastUpdatedBy`] = playerName;
    updates[`rooms/${roomCode}/gameState/lastAction`] = actionKey || null;
    await update(ref(db), updates);
  } catch (e) { console.error("applyGameStateDelta failed:", e); }
}

export function subscribeToGameState(roomCode, callback) {
  const r = ref(db, `rooms/${roomCode}/gameState`);
  return onValue(r, (snap) => { if (snap.exists()) callback(snap.val()); });
}

// ─── Activity feed ────────────────────────────────────────────────
export async function addFeedItem(roomCode, playerName, role, actionKey, statSummary) {
  try {
    await push(ref(db, `rooms/${roomCode}/feed`), {
      playerName, role, actionKey, statSummary, ts: serverTimestamp(),
    });
  } catch (e) { console.error("addFeedItem failed:", e); }
}

export function subscribeToFeed(roomCode, callback) {
  const r = ref(db, `rooms/${roomCode}/feed`);
  return onValue(r, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const items = [];
    snap.forEach(child => items.push({ id: child.key, ...child.val() }));
    callback(items.reverse().slice(0, 20));
  });
}

// ─── Leaderboard ─────────────────────────────────────────────────
//
// Data model:
//   leaderboard/{scoreId}
//     score         number
//     title         string
//     difficulty    string
//     scenario      string
//     reason        string
//     money         number
//     users         number
//     morale        number
//     unlisted      bool      — true until someone pays
//     roomCode      string    — "SOLO" for solo games
//     isSolo        bool
//     teamNames     string[]  — all player names in the room
//     playerName    string    — who submitted (for solo, same as teamNames[0])
//     contactName   string    — filled after payment
//     contactEmail  string    — filled after payment
//     ts            timestamp
//
// For multiplayer: one entry per room, keyed by roomCode.
// For solo: one entry per game, using a generated key.
// Any teammate can unlock the shared room entry.

/**
 * Submit a score entry.
 *
 * Solo: creates a new entry, returns its key.
 * Multiplayer: upserts under rooms/{roomCode}/leaderboardId so all
 *   teammates reference the same entry. Returns the leaderboard key.
 *
 * teamNames — array of all player names in the room (passed from gameConfig.players)
 */
export async function submitScore({
  playerName,
  score,
  title,
  role,
  difficulty,
  scenario,
  reason,
  money,
  users,
  morale,
  isSolo,
  roomCode,
  teamNames = [],
}) {
  try {
    const entry = {
      playerName,
      score,
      title,
      role,
      difficulty,
      scenario,
      reason,
      money,
      users,
      morale,
      unlisted: true,
      isSolo: !!isSolo,
      roomCode: roomCode || "SOLO",
      // For solo, teamNames is just [playerName]. For multiplayer, it's everyone.
      teamNames: isSolo ? [playerName] : (teamNames.length > 0 ? teamNames : [playerName]),
      contactName: null,
      contactEmail: null,
      ts: serverTimestamp(),
    };

    if (isSolo || !roomCode || roomCode === "SOLO") {
      // Solo: always create a fresh entry
      const newRef = await push(ref(db, "leaderboard"), entry);
      return newRef.key;
    } else {
      // Multiplayer: check if this room already has a leaderboard entry
      const existingSnap = await get(ref(db, `rooms/${roomCode}/leaderboardId`));
      if (existingSnap.exists()) {
        // Entry already created by a teammate — just return the existing key
        // Optionally update score if this player's submission is higher
        const existingId = existingSnap.val();
        const existingEntrySnap = await get(ref(db, `leaderboard/${existingId}`));
        if (existingEntrySnap.exists()) {
          const existingScore = existingEntrySnap.val().score || 0;
          if (score > existingScore) {
            // Update to the higher score
            await update(ref(db, `leaderboard/${existingId}`), { score, title, money, users, morale, reason });
          }
        }
        return existingId;
      } else {
        // First player to finish — create the entry and store its key on the room
        const newRef = await push(ref(db, "leaderboard"), entry);
        await update(ref(db, `rooms/${roomCode}`), { leaderboardId: newRef.key });
        return newRef.key;
      }
    }
  } catch (e) {
    console.error("submitScore failed:", e);
    return null;
  }
}

/**
 * Unlock a score entry — flip unlisted to false, save contact info.
 * Works for both solo and multiplayer (same scoreId either way).
 */
export async function unlockScore(scoreId, { contactName, contactEmail }) {
  try {
    await update(ref(db, `leaderboard/${scoreId}`), {
      unlisted: false,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
    });
  } catch (e) { console.error("unlockScore failed:", e); }
}

/**
 * Fetch top 20 public (unlisted: false) scores, sorted by score descending.
 */
export async function getTopScores() {
  try {
    const q = query(
      ref(db, "leaderboard"),
      orderByChild("score"),
      limitToLast(200)
    );
    const snap = await get(q);
    if (!snap.exists()) return [];
    const entries = [];
    snap.forEach(child => {
      const val = child.val();
      if (!val.unlisted) entries.push({ id: child.key, ...val });
    });
    return entries.sort((a, b) => b.score - a.score).slice(0, 20);
  } catch (e) {
    console.error("getTopScores failed:", e);
    return [];
  }
}

/**
 * Get a player's real rank by counting all scores (public + unlisted) above theirs.
 */
export async function getRealRank(score) {
  try {
    const snap = await get(ref(db, "leaderboard"));
    if (!snap.exists()) return 1;
    let rank = 1;
    snap.forEach(child => {
      if ((child.val().score || 0) > score) rank++;
    });
    return rank;
  } catch (e) {
    console.error("getRealRank failed:", e);
    return null;
  }
}