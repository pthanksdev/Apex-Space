"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { auth, saveUserProfile } from '@/lib/firebase';
import { updateProfile, signOut } from 'firebase/auth';
import { setUser, clearUser } from '@/store/userSlice';
import { ArrowLeft, Mail, LogOut, Edit3, Check, X, Building2, User, Smartphone } from 'lucide-react';
import { Avatar } from '@mui/material';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((s: RootState) => s.user);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const workspaceMode = typeof window !== 'undefined' ? localStorage.getItem('apex_workspace_mode') || 'personal' : 'personal';
  const teamName = typeof window !== 'undefined' ? localStorage.getItem('apex_team_name') : null;

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: newName });
      await saveUserProfile(user.uid, { displayName: newName });
      dispatch(setUser({ ...user, displayName: newName }));
    } catch { /* sandbox mode */ }
    setSaving(false);
    setEditingName(false);
  };

  const handleSignOut = async () => {
    try { await signOut(auth); } catch { /* sandbox */ }
    dispatch(clearUser());
    router.push('/landing');
  };

  const modeInfo = {
    personal: { label: 'Personal Workspace', icon: User, desc: 'Managing your own tasks and projects.' },
    team: { label: `Team: ${teamName || 'My Team'}`, icon: Building2, desc: 'You are working in your team workspace.' },
  }[user.workspaceMode || 'personal'] ?? { label: 'Personal Workspace', icon: User, desc: 'Managing your own tasks.' };

  const handleSwitchWorkspace = async () => {
    const newMode = user.workspaceMode === 'personal' ? 'team' : 'personal';
    
    // Check if they actually have a team before switching to team mode
    if (newMode === 'team' && !user.teamId) {
      alert("You don't belong to any team yet. Go to the Team page to create one or ask for an invite.");
      return;
    }

    localStorage.setItem('apex_workspace_mode', newMode);
    
    // Update Firestore
    try {
      await saveUserProfile(user.uid, { workspaceMode: newMode as 'personal' | 'team' });
    } catch { /* sandbox */ }

    // Update Redux
    dispatch(setUser({ ...user, workspaceMode: newMode as 'personal' | 'team' }));
    
    // Reload to refresh active data
    window.location.href = '/board';
  };

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col min-w-0">
      <div className="max-w-2xl w-full">
        <header className="mb-10">
          <button onClick={() => router.push('/board')} className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3 hover:text-indigo-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Board
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            My Profile
          </h1>
        </header>

        {/* Avatar + Name */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-7 rounded-[2.5rem] mb-5 flex items-center gap-6">
          <Avatar src={user.photoURL || undefined} sx={{ width: 72, height: 72, fontSize: 28, bgcolor: 'rgba(99,102,241,0.3)', color: '#a5b4fc', border: '2px solid rgba(255,255,255,0.1)' }}>
            {user.displayName?.[0] || user.email?.[0]}
          </Avatar>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }} className="flex-1 bg-black/30 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none" autoFocus />
                <button onClick={handleSaveName} disabled={saving} className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingName(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 transition-all"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-white truncate">{user.displayName || 'Active Member'}</h2>
                <button onClick={() => { setNewName(user.displayName || ''); setEditingName(true); }} className="p-1.5 rounded-lg text-neutral-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-neutral-500 font-semibold mt-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </p>
          </div>
        </motion.div>

        {/* Workspace */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-panel p-6 rounded-[2rem] mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">Workspace</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <modeInfo.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white truncate">{modeInfo.label}</p>
              <p className="text-xs text-neutral-500 font-medium truncate">{modeInfo.desc}</p>
            </div>
            {user.teamId && (
              <button 
                onClick={handleSwitchWorkspace}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold transition-all border border-white/5 whitespace-nowrap"
              >
                Switch to {user.workspaceMode === 'personal' ? 'Team' : 'Personal'}
              </button>
            )}
          </div>
          <button onClick={() => router.push('/team')} className="mt-5 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Manage Team & Invites →
          </button>
        </motion.div>

        {/* PWA Install */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="glass-panel p-5 rounded-[2rem] mb-5 flex items-center gap-4 border border-indigo-500/10">
          <Smartphone className="w-5 h-5 text-indigo-400 shrink-0" />
          <p className="text-xs text-neutral-400 font-medium">
            <span className="text-white font-bold">Install Apex on your device.</span> Open your browser menu and tap <em>"Add to Home Screen"</em> to use this as a native app.
          </p>
        </motion.div>

        {/* Sign Out */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-[2rem] border border-red-500/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">Session</p>
          <button onClick={handleSignOut} className="flex items-center gap-3 py-3 px-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all text-sm font-bold">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
