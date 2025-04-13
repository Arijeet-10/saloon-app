'use client';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

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
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (e: any) {
    console.error("Firebase initialization error", e.message)
}
export const analytics = getAnalytics(app);

export { app };
