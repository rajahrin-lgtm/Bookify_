import * as firebaseApp from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// --------------------------------------------------------
// Firebase Configuration
// --------------------------------------------------------

// Helper to safely access environment variables
const getEnv = (key: string, fallback: string) => {
  try {
    // Check if import.meta.env exists before accessing it
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || fallback;
    }
  } catch (e) {
    console.warn("Error accessing environment variable:", key);
  }
  return fallback;
};

// Use environment variables if available, otherwise fall back to hardcoded (dev mode)
const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyDlnLgcyWWQBGOCXefcpX_naBZMFaBkLJo"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "bookifyontrial.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "bookifyontrial"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "bookifyontrial.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "689938925756"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:689938925756:web:1dae21ea492512ae2468b9"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-GV9SJVXV91")
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);