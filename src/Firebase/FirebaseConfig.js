import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA13y7TIyNNgNMMRoq-WGib_9-P0II63cI",
  authDomain: "test-8fd1f.firebaseapp.com",
  projectId: "test-8fd1f",
  storageBucket: "test-8fd1f.firebasestorage.app",
  messagingSenderId: "325067824895",
  appId: "1:325067824895:web:1ac91fcf32ed391da8b6ca",
  measurementId: "G-BYTENJK3QT",
};

// Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
const analytics = getAnalytics(FirebaseApp);
