"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { searchUsersByEmail, db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, getDoc, getDocs, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Search, UserPlus, Users, Loader2, X, Crown, Mail } from 'lucide-react';
import { Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamMember {
  id?: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'member';
}

export default function TeamPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useSelector((s: RootState) => s.user);

  const [emailSearch, setEmailSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviting, setInviting] = useState<string | null>(null);
  const [firestoreOk, setFirestoreOk] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = onSnapshot(
      collection(db, 'team_members'),
      (snap) => {
        setFirestoreOk(true);
        const data: TeamMember[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
        setMembers(data);
      },
      () => { setFirestoreOk(false); setMembers([]); }
    );
    return () => unsub();
  }, [isAuthenticated]);

  const handleSearch = async () => {
    if (!emailSearch.trim()) return;
    setSearching(true);
    setSearchDone(false);
    try {
      const results = await searchUsersByEmail(emailSearch.trim().toLowerCase());
      setSearchResults(results.filter(r => r.uid !== user?.uid));
    } catch {
      setSearchResults([]);
    }
    setSearchDone(true);
    setSearching(false);
  };

  const handleInvite = async (invitee: any) => {
    setInviting(invitee.uid);
    try {
      await addDoc(collection(db, 'notifications'), {
        recipientUid: invitee.uid,
        senderUid: user?.uid,
        senderEmail: user?.email,
        type: 'team_invite',
        title: 'Team Invitation',
        message: `${user?.displayName || user?.email} has invited you to join their workspace team: ${teamName}`,
        teamId: user?.teamId || user?.uid, // if they don't have a team yet, their UID becomes the teamId
        teamName: teamName,
        status: 'unread',
        timestamp: serverTimestamp(),
      });
      setEmailSearch('');
      setSearchResults([]);
      setSearchDone(false);
      alert('Invitation sent!');
    } catch (e) { console.error(e); }
    setInviting(null);
  };

  const handleRemove = async (member: TeamMember) => {
    if (!member.id) return;
    try { await deleteDoc(doc(db, 'team_members', member.id)); }
    catch { /* offline */ }
  };

  const teamName = typeof window !== 'undefined' ? localStorage.getItem('apex_team_name') || 'My Team' : 'My Team';
  const alreadyMember = (uid: string) => members.some(m => m.uid === uid);

  if (loading || !isAuthenticated) return null;

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col min-w-0">
      <div className="max-w-2xl w-full">
        <header className="mb-10">
          <button onClick={() => router.push('/board')} className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3 hover:text-indigo-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Board
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-neutral-500 text-sm mt-2 font-semibold">{teamName}</p>
        </header>

        {!firestoreOk && (
          <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            ⚠ Firebase not configured — add your keys to .env.local to enable real team features.
          </div>
        )}

        {/* Invite by Gmail */}
        <section className="glass-panel p-6 rounded-[2.5rem] mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5 text-indigo-400" /> Invite by Gmail
          </p>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                value={emailSearch}
                onChange={e => { setEmailSearch(e.target.value); setSearchDone(false); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search teammate by Gmail..."
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-2xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 font-medium"
              />
            </div>
            <button onClick={handleSearch} disabled={searching} className="py-3 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shrink-0">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          <AnimatePresence>
            {searchDone && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-3">
                {searchResults.length === 0 ? (
                  <div className="text-xs text-neutral-500 font-semibold text-center py-6 border border-dashed border-white/5 rounded-2xl">
                    No user found. They need to sign up first for their profile to be searchable.
                  </div>
                ) : (
                  searchResults.map(result => (
                    <div key={result.uid} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                          {result.displayName?.[0] || result.email?.[0]}
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-white">{result.displayName || 'User'}</p>
                          <p className="text-xs text-neutral-500">{result.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInvite(result)}
                        disabled={inviting === result.uid || alreadyMember(result.uid)}
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        {inviting === result.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                        {alreadyMember(result.uid) ? 'Already in team' : 'Send Invite'}
                      </button>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Members List */}
        <section className="glass-panel p-6 rounded-[2.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-5 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> Members ({members.length + 1})
          </p>
          <div className="space-y-3">
            {/* Current user */}
            <div className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <div className="flex items-center gap-3">
                <Avatar src={user?.photoURL || undefined} sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                  {user?.displayName?.[0]}
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    {user?.displayName || 'You'}
                    <span className="text-[9px] font-extrabold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded uppercase">You</span>
                  </p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Crown className="w-3.5 h-3.5" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Admin</span>
              </div>
            </div>

            {members.map(m => (
              <div key={m.uid} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group">
                <div className="flex items-center gap-3">
                  <Avatar src={m.photoURL || undefined} sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                    {m.displayName?.[0] || m.email?.[0]}
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-white">{m.displayName || 'Member'}</p>
                    <p className="text-xs text-neutral-500">{m.email}</p>
                  </div>
                </div>
                <button onClick={() => handleRemove(m)} className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {members.length === 0 && (
              <p className="text-center text-xs text-neutral-600 font-semibold py-6 border border-dashed border-white/5 rounded-2xl">
                No teammates yet. Search by Gmail above to add someone.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
