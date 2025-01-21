import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {};

//Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
export const analytics = getAnalytics(FirebaseApp);
