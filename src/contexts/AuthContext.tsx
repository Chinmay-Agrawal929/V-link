import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAppStore, User as AppUser } from '../store';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, login, logout } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user document from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          // Set in Zustand store
          useAppStore.setState({ isAuthenticated: true, user: userData });
        } else {
          // Initialize and persist user document in Firestore
          const initialUserData: AppUser = {
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'VIT Student',
            email: firebaseUser.email || '',
            avatarUrl: firebaseUser.photoURL || null,
            bannerUrl: null,
            coverUrl: null,
            regNo: '',
            branch: 'Computer Science & Engineering',
            role: 'student',
            isProfileComplete: false,
            connections: 0,
            about: '',
            skills: ['React', 'Python', 'UI Design'],
            interests: ['Hackathons & DevJams', 'Open Source Contributing'],
            collaborationStatus: 'Open to Collab',
            certifications: [],
            dailyHabits: [],
            featuredProjects: [],
            githubConnected: false
          };
          await setDoc(userDocRef, initialUserData, { merge: true });
          useAppStore.setState({ isAuthenticated: true, user: initialUserData });
        }
      } else {
        useAppStore.setState({ isAuthenticated: false, user: null });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
