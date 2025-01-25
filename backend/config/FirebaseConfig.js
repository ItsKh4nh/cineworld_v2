import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

dotenv.config();

export const ENV_VARS = {
  API_KEY: process.env.FIREBASE_API_KEY,
  AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  APP_ID: process.env.FIREBASE_APP_ID,
  MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
};

const validateEnvVars = () => {
  const missingVars = Object.entries(ENV_VARS)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
};

const initializeFirebase = async () => {
  try {
    validateEnvVars();

    const firebaseApp = initializeApp(ENV_VARS);
    const firestore = getFirestore(firebaseApp);
    const analyticsInstance =
      typeof window !== "undefined" ? getAnalytics(firebaseApp) : null;

    console.log("Firebase initialized successfully!");

    return {
      app: firebaseApp,
      db: firestore,
      analytics: analyticsInstance,
    };
  } catch (error) {
    console.error("Firebase initialization failed!");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
};

export const startFirebase = async () => {
  return await initializeFirebase();
};
