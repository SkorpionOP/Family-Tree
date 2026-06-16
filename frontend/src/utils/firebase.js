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
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

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

// Initialize App Check with reCAPTCHA Enterprise site key
if (typeof window !== "undefined") {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider('-Ae0iMNds0d9NlwYWI_H4bCBtE-yQcNAPKhEYCARoQu4TVQz-7oFt_7H6Ldoto5J_pIL-XBDjFGobcowchDDlu615sXPvgY2_bc5oHSNE8KyngRuX8G5kA0VZmkU5z8wstwcRofzdAmB8h455jCPsUIOl1A'),
    isTokenAutoRefreshEnabled: true
  });
}

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
