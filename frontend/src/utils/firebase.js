import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updatePhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  verifyBeforeUpdateEmail
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDauJyzMAm7F1meMAQPPoCwQ7nPO-JLwAU",
  authDomain: "family-tree-d32c9.firebaseapp.com",
  projectId: "family-tree-d32c9",
  storageBucket: "family-tree-d32c9.firebasestorage.app",
  messagingSenderId: "885735039258",
  appId: "1:885735039258:web:a7c559be7f9bcd4afacca3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updatePhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  verifyBeforeUpdateEmail
};
