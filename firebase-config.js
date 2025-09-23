// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHuzCU4KK6dQp8lIVfZqLNXb_FGWFxn1E",
  authDomain: "mihuella-ac72f.firebaseapp.com",
  projectId: "mihuella-ac72f",
  storageBucket: "mihuella-ac72f.firebasestorage.app",
  messagingSenderId: "125885697785",
  appId: "1:125885697785:web:9237960e7f7e4759b11c28"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);