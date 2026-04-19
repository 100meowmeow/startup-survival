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

// ─── Leaderboard ──────────────────────────────────────────────────

/**
 * Write a score to Firebase immediately after game ends.
 * Starts as unlisted — only flips public after Stripe payment.
 * Returns the generated scoreId so GameOver can store it for later unlocking.
 */
export async function submitScore({ playerName, score, title, role, difficulty, scenario, reason, money, users, morale }) {
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
      unlisted: true,       // hidden from public board until paid
      ts: serverTimestamp(),
    };
    const newRef = await push(ref(db, "leaderboard"), entry);
    return newRef.key;      // return scoreId for later unlocking
  } catch (e) {
    console.error("submitScore failed:", e);
    return null;
  }
}

/**
 * Flip a score from unlisted to public, and attach contact info.
 * Called after Stripe payment redirect with ?paid=leaderboard.
 */
export async function unlockScore(scoreId, { contactName, contactEmail }) {
  try {
    await update(ref(db, `leaderboard/${scoreId}`), {
      unlisted: false,
      contactName,
      contactEmail,
    });
  } catch (e) { console.error("unlockScore failed:", e); }
}

/**
 * Fetch top 20 public scores (unlisted: false), ordered by score descending.
 * Firebase Realtime DB doesn't support filtering + ordering in one query,
 * so we fetch the top 200 by score and filter client-side.
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
    // Sort descending by score, return top 20
    return entries.sort((a, b) => b.score - a.score).slice(0, 20);
  } catch (e) {
    console.error("getTopScores failed:", e);
    return [];
  }
}

/**
 * Get the real rank of a score among ALL scores (including unlisted).
 * Used to show the player their private rank on the game over screen.
 */
export async function getRealRank(score) {
  try {
    const snap = await get(ref(db, "leaderboard"));
    if (!snap.exists()) return 1;
    let rank = 1;
    snap.forEach(child => {
      const val = child.val();
      if ((val.score || 0) > score) rank++;
    });
    return rank;
  } catch (e) {
    console.error("getRealRank failed:", e);
    return null;
  }
}