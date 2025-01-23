import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0ZJyNT-OgT2F4M3au3VcaneqUjJ8t9JQ",
  authDomain: "cineworld-06166.firebaseapp.com",
  projectId: "cineworld-06166",
  storageBucket: "cineworld-06166.firebasestorage.app",
  messagingSenderId: "735024717951",
  appId: "1:735024717951:web:c4250e008c525c03ee9f4a",
  measurementId: "G-4ECR63D18T",
};

//Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
export const analytics = getAnalytics(FirebaseApp);
