// src/services/firebaseFoodsService.ts
import { db, ref, get, set, push, update, remove } from './firebaseService';

const FOODS_PATH = 'foods';

export async function getFoods() {
  const snapshot = await get(ref(db, FOODS_PATH));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, food]) => ({ id, ...food }));
}

export async function addFood(food) {
  const newRef = push(ref(db, FOODS_PATH));
  await set(newRef, food);
  return { id: newRef.key, ...food };
}

export async function updateFood(id, food) {
  await update(ref(db, `${FOODS_PATH}/${id}`), food);
}

export async function deleteFood(id) {
  await remove(ref(db, `${FOODS_PATH}/${id}`));
}
