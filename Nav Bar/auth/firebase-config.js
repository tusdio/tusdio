import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNwoaMS6w2US-1f41xRQO3sSLRFTpHRhw",
  authDomain: "tusdio-18735.firebaseapp.com",
  projectId: "tusdio-18735",
  storageBucket: "tusdio-18735.firebasestorage.app",
  messagingSenderId: "963407940803",
  appId: "1:963407940803:web:4fa505db9d766592eb6676"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };