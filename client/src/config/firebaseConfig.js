
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBT66PyD4IH4AEho6xXbtmThlhdEsd4W04",
  authDomain: "mypol-5e3a6.firebaseapp.com",
  projectId: "mypol-5e3a6",
  storageBucket: "mypol-5e3a6.appspot.com",
  messagingSenderId: "386795975524",
  appId: "1:386795975524:web:9d0ed79b0abf1c81310071",
  measurementId: "G-R5FNDRPE0E"
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
