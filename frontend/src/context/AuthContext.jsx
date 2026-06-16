import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from '../utils/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [fbUser, setFbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await api.auth.getMe();
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user profile from backend', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setFbUser(firebaseUser);
        if (firebaseUser.emailVerified) {
          try {
            const token = await firebaseUser.getIdToken();
            const data = await api.auth.firebaseLogin(token);
            localStorage.setItem('token', data.token);
            await fetchUser();
          } catch (err) {
            console.error('Error syncing with backend', err);
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
          }
        } else {
          // Logged in to Firebase but email not verified
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
        }
      } else {
        setFbUser(null);
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser.emailVerified) {
        // Send a verification mail if somehow not verified and no verification is pending
        setLoading(false);
        throw new Error('unverified');
      }
      
      const token = await firebaseUser.getIdToken();
      const data = await api.auth.firebaseLogin(token);
      localStorage.setItem('token', data.token);
      await fetchUser();
      return data;
    } catch (err) {
      try {
        console.log('Firebase login failed or user not in Firebase. Attempting local backend login...');
        const data = await api.auth.login(email, password);
        localStorage.setItem('token', data.token);
        await fetchUser();
        return data;
      } catch (localErr) {
        setLoading(false);
        throw new Error(localErr.message || err.message || 'Invalid credentials');
      }
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Send verification link
      await sendEmailVerification(firebaseUser);
      setLoading(false);
      return firebaseUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;
      
      const token = await firebaseUser.getIdToken();
      const data = await api.auth.firebaseLogin(token);
      localStorage.setItem('token', data.token);
      await fetchUser();
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        const firebaseUser = auth.currentUser;
        setFbUser(firebaseUser);
        
        if (firebaseUser.emailVerified) {
          const token = await firebaseUser.getIdToken();
          const data = await api.auth.firebaseLogin(token);
          localStorage.setItem('token', data.token);
          await fetchUser();
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Verification status check error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Resend verification error:', err);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      console.error('Password reset error:', err);
      throw err;
    }
  };

  const needVerification = fbUser && !fbUser.emailVerified;

  return (
    <AuthContext.Provider value={{ 
      user, 
      fbUser, 
      loading, 
      needVerification, 
      login, 
      loginWithGoogle, 
      register, 
      logout, 
      reloadUser: fetchUser,
      checkVerificationStatus,
      resendVerification,
      forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
