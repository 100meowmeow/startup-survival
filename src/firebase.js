import { initializeApp } from "firebase/app";
import { getDatabase, ref, increment, update, get, onValue, push, serverTimestamp } from "firebase/database";

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

// ─── Player count (unchanged) ─────────────────────────────────────
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

/**
 * Host calls this once when the game starts to create the shared state.
 */
export async function initGameState(roomCode, startMoney) {
  try {
    await update(ref(db, `rooms/${roomCode}/gameState`), {
      money: startMoney,
      users: 0,
      morale: 100,
      lastUpdatedBy: null,
      lastAction: null,
    });
  } catch (e) {
    console.error("initGameState failed:", e);
  }
}

/**
 * Any player calls this to apply a stat delta to the shared game state.
 * Uses Firebase transactions via increment() so concurrent writes don't clobber each other.
 * moneyDelta, usersDelta, moraleDelta are numbers (positive or negative).
 */
export async function applyGameStateDelta(roomCode, { moneyDelta = 0, usersDelta = 0, moraleDelta = 0 }, playerName, actionKey) {
  try {
    const updates = {};
    if (moneyDelta !== 0) updates[`rooms/${roomCode}/gameState/money`] = increment(moneyDelta);
    if (usersDelta !== 0) updates[`rooms/${roomCode}/gameState/users`] = increment(usersDelta);
    if (moraleDelta !== 0) updates[`rooms/${roomCode}/gameState/morale`] = increment(moraleDelta);
    updates[`rooms/${roomCode}/gameState/lastUpdatedBy`] = playerName;
    updates[`rooms/${roomCode}/gameState/lastAction`] = actionKey || null;
    await update(ref(db), updates);
  } catch (e) {
    console.error("applyGameStateDelta failed:", e);
  }
}

/**
 * Subscribe to real-time game state changes.
 * callback receives { money, users, morale } whenever any player changes a stat.
 * Returns unsubscribe function — call it on component unmount.
 */
export function subscribeToGameState(roomCode, callback) {
  const r = ref(db, `rooms/${roomCode}/gameState`);
  const unsub = onValue(r, (snap) => {
    if (snap.exists()) callback(snap.val());
  });
  return unsub;
}

// ─── Activity feed ────────────────────────────────────────────────

/**
 * Write an activity to the shared feed.
 * e.g. "Roshan sent cold emails → +200 users"
 */
export async function addFeedItem(roomCode, playerName, role, actionKey, statSummary) {
  try {
    await push(ref(db, `rooms/${roomCode}/feed`), {
      playerName,
      role,
      actionKey,
      statSummary,   // e.g. "+200 users · +$500"
      ts: serverTimestamp(),
    });
  } catch (e) {
    console.error("addFeedItem failed:", e);
  }
}

/**
 * Subscribe to the activity feed.
 * callback receives an array of feed items sorted newest-first.
 * Returns unsubscribe function.
 */
export function subscribeToFeed(roomCode, callback) {
  const r = ref(db, `rooms/${roomCode}/feed`);
  const unsub = onValue(r, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const items = [];
    snap.forEach(child => items.push({ id: child.key, ...child.val() }));
    callback(items.reverse().slice(0, 20)); // newest first, cap at 20
  });
  return unsub;
}