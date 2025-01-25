import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { ENV_VARS } from "./envVars";

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
    console.error(`Error connecting to Firebase: ${error.message}`);
    process.exit(1); // 1 means exit with failure, 0 means exit with success
  }
};

export const startFirebase = async () => {
  return await initializeFirebase();
};
