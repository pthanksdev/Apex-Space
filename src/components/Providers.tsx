"use client";

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { onAuthStateChanged } from 'firebase/auth';
import CommandPalette from './CommandPalette';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { auth, getUserProfile, saveUserProfile, setPresenceOnline, setPresenceOffline } from '@/lib/firebase';
import { setUser, setLoading, clearUser } from '@/store/userSlice';

const theme = createTheme();

// Auth listener + user profile sync wrapped inside a child component
// so it has access to the Redux store via the Provider above it.
function AuthSync() {
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let workspaceMode = (localStorage.getItem('apex_workspace_mode') as any) || 'personal';
        let teamId = null;

        // Try to fetch full profile from Firestore first
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            workspaceMode = profile.workspaceMode === 'personal' ? 'personal' : 'team';
            teamId = profile.teamId || null;
          }
        } catch { /* ignore */ }

        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          workspaceMode,
          teamId
        };

        store.dispatch(setUser(userData));

        // Save/update profile in Firestore
        try {
          await saveUserProfile(firebaseUser.uid, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          await setPresenceOnline(firebaseUser.uid, firebaseUser.displayName, firebaseUser.photoURL, teamId);
        } catch { /* Firebase not configured — sandbox mode */ }

        // Set presence offline on tab close
        const handleUnload = () => {
          setPresenceOffline(firebaseUser.uid).catch(() => {});
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
      } else {
        store.dispatch(clearUser());
        store.dispatch(setLoading(false));
      }
    }, () => {
      store.dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, []);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AuthSync />
        <CommandPalette />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
