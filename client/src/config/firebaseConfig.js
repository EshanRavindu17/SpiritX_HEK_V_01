
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhV10bMi2UWVVP7xNXCbUJgyJ1JEvLaDo",
  authDomain: "spiritx-67078.firebaseapp.com",
  projectId: "spiritx-67078",
  storageBucket: "spiritx-67078.firebasestorage.app",
  messagingSenderId: "752724932127",
  appId: "1:752724932127:web:880d20897e3b6dbe31872a",
  measurementId: "G-1TSTGLY92V"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Auth
const firebaseAuth = getAuth(app);

// Initialize Firestore
const firestoreDB = getFirestore(app);
const firebaseStorage = getStorage(app);

export { app, firebaseAuth, firestoreDB, firebaseStorage,firebaseConfig,signInWithEmailAndPassword };
