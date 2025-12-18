// src/services/firebaseGoalsService.ts
import { db, ref, get, set, update } from './firebaseService';

const GOALS_PATH = 'goals';

export async function getGoals() {
  const snapshot = await get(ref(db, GOALS_PATH));
  if (!snapshot.exists()) return null;
  return snapshot.val();
}

export async function setGoals(goals) {
  await set(ref(db, GOALS_PATH), goals);
}

export async function updateGoal(key, value) {
  await update(ref(db, GOALS_PATH), { [key]: value });
}
