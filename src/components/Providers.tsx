"use client";

import React, { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from '@/store/store';
import { RootState } from '@/store/store';
import { onAuthStateChanged } from 'firebase/auth';
import CommandPalette from './CommandPalette';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { auth, getUserProfile, saveUserProfile, setPresenceOnline, setPresenceOffline, db } from '@/lib/firebase';
import { setUser, setLoading, clearUser } from '@/store/userSlice';
import { doc, updateDoc } from 'firebase/firestore';
import { Bell, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/store/taskSlice';

const theme = createTheme();

// Auth listener + user profile sync wrapped inside a child component
// so it has access to the Redux store via the Provider above it.
function AuthSync() {
  useEffect(() => {
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

// ─── Global Reminder Engine Component ──────────────────────────────────────────
function ReminderEngine() {
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [triggered, setTriggered] = useState<Record<string, boolean>>({});
  const [activeAlarm, setActiveAlarm] = useState<Task | null>(null);

  // Play custom dual-tone alarm chime synthetically
  const playAlarmChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // First tone (D5, crisp bell)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 1.2);

      // Second tone (A5, sparkling harmonic) delayed by 150ms
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 1.35);
    } catch (e) {
      console.warn("AudioContext failed to play chime:", e);
    }
  };

  // Poll for alarms every 10 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      // Format current local time as YYYY-MM-DDTHH:MM (matching datetime-local format)
      const nowString = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + 'T' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');

      tasks.forEach(task => {
        if (task.reminderTime && task.reminderTime <= nowString) {
          const key = `${task.id}-${task.reminderTime}`;
          if (!triggered[key] && task.status !== 'done') {
            // Trigger alarm!
            setTriggered(p => ({ ...p, [key]: true }));
            setActiveAlarm(task);
            playAlarmChime();
          }
        }
      });
    };

    const timer = setInterval(checkReminders, 10000);
    return () => clearInterval(timer);
  }, [tasks, triggered]);

  const handleDismiss = async () => {
    if (activeAlarm) {
      try {
        await updateDoc(doc(db, 'tasks', activeAlarm.id), { reminderTime: null });
      } catch { /* ignore locally */ }
      setActiveAlarm(null);
    }
  };

  const handleSnooze = async () => {
    if (activeAlarm) {
      const now = new Date();
      const snoozeTime = new Date(now.getTime() + 5 * 60 * 1000);
      const snoozeStr = snoozeTime.getFullYear() + '-' +
        String(snoozeTime.getMonth() + 1).padStart(2, '0') + '-' +
        String(snoozeTime.getDate()).padStart(2, '0') + 'T' +
        String(snoozeTime.getHours()).padStart(2, '0') + ':' +
        String(snoozeTime.getMinutes()).padStart(2, '0');
      
      try {
        await updateDoc(doc(db, 'tasks', activeAlarm.id), { reminderTime: snoozeStr });
      } catch { /* ignore locally */ }
      setActiveAlarm(null);
    }
  };

  return (
    <AnimatePresence>
      {activeAlarm && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-6 right-6 z-[9999] w-full max-w-sm glass-panel border border-indigo-500/30 p-5 rounded-3xl shadow-[0_20px_50px_rgba(99,102,241,0.15)] flex flex-col gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 animate-bounce">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block mb-0.5">Task Alarm</span>
              <h4 className="text-sm font-extrabold text-neutral-100 leading-snug truncate">{activeAlarm.title}</h4>
              <p className="text-xs text-neutral-400 font-medium truncate mt-1">{activeAlarm.description || "No description provided."}</p>
            </div>
            <button 
              onClick={handleDismiss}
              className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={handleSnooze}
              className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-white/5"
            >
              <Clock className="w-3.5 h-3.5" /> Snooze 5m
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-extrabold text-xs transition-all flex items-center justify-center shadow-lg shadow-indigo-500/10"
            >
              Complete/Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AuthSync />
        <ReminderEngine />
        <CommandPalette />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
