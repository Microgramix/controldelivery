// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDj3MmLYd9XRpnbHELyKypNgo51b8tOUuY",
  authDomain: "fastrack-1f1f7.firebaseapp.com",
  projectId: "fastrack-1f1f7",
  storageBucket: "fastrack-1f1f7.firebasestorage.app",
  messagingSenderId: "602869780932",
  appId: "1:602869780932:web:db1b5c0184af7d46125491",
  measurementId: "G-F1G9VLG011"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
