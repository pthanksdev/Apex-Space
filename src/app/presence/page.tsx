"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { db, setPresenceOnline } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowLeft, Globe } from 'lucide-react';
import { Avatar, Badge } from '@mui/material';

interface PresenceUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  status: 'online' | 'offline';
  lastSeen?: any;
}

export default function PresencePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useSelector((s: RootState) => s.user);
  const [presenceList, setPresenceList] = useState<PresenceUser[]>([]);
  const [firestoreOk, setFirestoreOk] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  // Mark self as online
  useEffect(() => {
    if (!user) return;
    setPresenceOnline(user.uid, user.displayName, user.photoURL, user.workspaceMode === 'team' ? (user.teamId || null) : null).catch(() => {});
  }, [user]);

  // Real-time presence listener
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    // In personal mode, only show yourself. In team mode, show team.
    const presenceRef = collection(db, 'presence');
    const q = user.workspaceMode === 'team' && user.teamId
      ? query(presenceRef, where('teamId', '==', user.teamId))
      : query(presenceRef, where('uid', '==', user.uid));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setFirestoreOk(true);
        const data: PresenceUser[] = snap.docs.map(d => d.data() as PresenceUser);
        setPresenceList(data);
      },
      () => { setFirestoreOk(false); setPresenceList([]); }
    );
    return () => unsub();
  }, [isAuthenticated, user]);

  if (loading || !isAuthenticated) return null;

  const online = presenceList.filter(p => p.status === 'online');
  const offline = presenceList.filter(p => p.status === 'offline');

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col min-w-0">
      <header className="mb-10">
        <button onClick={() => router.push('/board')} className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3 hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Board
        </button>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
          Workspace Presence
        </h1>
      </header>

      {!firestoreOk && (
        <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          ⚠ Firebase not configured — presence requires real-time database connection.
        </div>
      )}

      <div className="max-w-2xl w-full glass-panel p-6 rounded-[2.5rem] space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-sm text-neutral-200 uppercase tracking-widest">
              Active Now ({online.length})
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
            Live
          </span>
        </div>

        <div className="space-y-3">
          {[...online, ...offline].map(p => (
            <div key={p.uid} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{ '& .MuiBadge-badge': { backgroundColor: p.status === 'online' ? '#10b981' : '#6b7280', boxShadow: '0 0 0 2px #050505', width: 10, height: 10, borderRadius: '50%' } }}
                >
                  <Avatar src={p.photoURL || undefined} sx={{ width: 44, height: 44, bgcolor: 'rgba(99,102,241,0.3)', color: '#a5b4fc', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {p.displayName?.[0]}
                  </Avatar>
                </Badge>
                <div>
                  <p className="font-bold text-sm text-white flex items-center gap-2">
                    {p.displayName || 'Member'}
                    {p.uid === user?.uid && <span className="text-[9px] font-extrabold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase">You</span>}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-xl border ${p.status === 'online' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-neutral-500/5 border-white/5 text-neutral-500'}`}>
                {p.status}
              </span>
            </div>
          ))}

          {presenceList.length === 0 && (
            <p className="text-center text-xs text-neutral-600 py-8 border border-dashed border-white/5 rounded-2xl font-semibold">
              {firestoreOk ? 'No other members online right now.' : 'Connect Firebase to see live presence.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
