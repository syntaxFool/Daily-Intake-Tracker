// src/services/firebaseLogsService.ts
import { db, ref, get, set, push, update, remove } from './firebaseService';

const LOGS_PATH = 'logs';

export async function getLogsByDate(date) {
  const snapshot = await get(ref(db, `${LOGS_PATH}/${date}`));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, log]) => ({ id, ...log }));
}

export async function addLog(date, log) {
  const newRef = push(ref(db, `${LOGS_PATH}/${date}`));
  await set(newRef, log);
  return { id: newRef.key, ...log };
}

export async function updateLog(date, id, log) {
  await update(ref(db, `${LOGS_PATH}/${date}/${id}`), log);
}

export async function deleteLog(date, id) {
  await remove(ref(db, `${LOGS_PATH}/${date}/${id}`));
}
