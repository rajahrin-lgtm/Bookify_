import * as firebaseApp from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// --------------------------------------------------------
// Firebase Configuration
// --------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyDlnLgcyWWQBGOCXefcpX_naBZMFaBkLJo",
  authDomain: "bookifyontrial.firebaseapp.com",
  projectId: "bookifyontrial",
  storageBucket: "bookifyontrial.firebasestorage.app",
  messagingSenderId: "689938925756",
  appId: "1:689938925756:web:1dae21ea492512ae2468b9",
  measurementId: "G-GV9SJVXV91"
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);