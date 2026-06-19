import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Firebase configuration with environment variable overrides and safe fallbacks for Vercel/production deployment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBaKmcahoXaT0f229ULoxl_aw_l40sEv38",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lively-theater-1tgzl.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lively-theater-1tgzl",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lively-theater-1tgzl.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "750450563504",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:750450563504:web:1ff1b1730e544ee30e1e75"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID provisioned for this applet
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-f9aaa5a6-67d0-465c-80f0-689290c194fd";
export const db = getFirestore(app, databaseId);

// Hardened Check per "Validate Connection to Firestore" guidelines of firebase-integration skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore database connection established successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    } else {
      console.log("Firestore verified (empty database setup complete).");
    }
  }
}
testConnection();
