// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "quick-bite-2bc6b.firebaseapp.com",
  projectId: "quick-bite-2bc6b",
  storageBucket: "quick-bite-2bc6b.firebasestorage.app",
  messagingSenderId: "67968074456",
  appId: "1:67968074456:web:a1507811e8e855495e0dad",
  measurementId: "G-70J1QQY1RG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
