import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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
import { getDatabase, ref, increment, update, get } from "firebase/database";

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