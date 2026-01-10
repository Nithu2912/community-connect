import { auth, db } from "../firebase";


import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoFAvsBgDh7ySllGKRCay51vEZrFKUccY",
  authDomain: "civichelp-700f6.firebaseapp.com",
  projectId: "civichelp-700f6",
  storageBucket: "civichelp-700f6.firebasestorage.app",
  messagingSenderId: "825371916616",
  appId: "1:825371916616:web:bda60099c416e63ea09b7d"
}

const app = initializeApp(firebaseConfig);

// 🔐 Authentication
export const auth = getAuth(app);

// 🗄️ Database
export const db = getFirestore(app);
