import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCN0qnRcLxenT6y8eKAydf-eihl7lfpzUU",
  authDomain: "saloon-booking-app-27eff.firebaseapp.com",
  databaseURL: "https://saloon-booking-app-27eff-default-rtdb.firebaseio.com",
  projectId: "saloon-booking-app-27eff",
  storageBucket: "saloon-booking-app-27eff.firebasestorage.app",
  messagingSenderId: "711821315438",
  appId: "1:711821315438:web:040b87560da1b42c4f457f",
  measurementId: "G-YBF06WJ1Z9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
