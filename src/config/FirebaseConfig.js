import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { ENV_VARS } from "./envVars";

const firebaseConfig = {
  apiKey: ENV_VARS.TMDB_API_KEY,
  authDomain: ENV_VARS.FIREBASE_AUTH_DOMAIN,
  projectId: ENV_VARS.FIREBASE_PROJECT_ID,
  storageBucket: ENV_VARS.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV_VARS.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV_VARS.FIREBASE_APP_ID,
  measurementId: ENV_VARS.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
export const analytics = getAnalytics(FirebaseApp);
