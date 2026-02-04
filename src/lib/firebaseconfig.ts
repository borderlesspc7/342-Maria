import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBMb7teTg5n_L7ERpWx1LalYqSf3t0BDws",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "maria-44e49.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "maria-44e49",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "maria-44e49.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "744713430025",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:744713430025:web:ece2323d005b100aa004d8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
export default firebaseConfig;
