// src/services/firebaseService.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, push, update, remove, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAjDnKIyoHIPIHN451s2_wepBZcIc2Bbww",
  authDomain: "calorie-tracker-react.firebaseapp.com",
  databaseURL: "https://calorie-tracker-react-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "calorie-tracker-react",
  storageBucket: "calorie-tracker-react.firebasestorage.app",
  messagingSenderId: "932892869998",
  appId: "1:932892869998:web:f9d2e6ec21bd7e39e92d7f",
  measurementId: "G-YRKV6YENZR"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, get, set, push, update, remove, onValue };
