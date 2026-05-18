"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query, limit, where } from 'firebase/firestore';
import { ArrowLeft, Activity, Clock } from 'lucide-react';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: any;
  teamId?: string | null;
  ownerUid?: string;
}

export default function ActivityPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useSelector((s: RootState) => s.user);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [firestoreOk, setFirestoreOk] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const activityRef = collection(db, 'activity');
    // Fetch recent activities directly ordered by timestamp. This avoids ANY composite index requirements!
    const q = query(activityRef, orderBy('timestamp', 'desc'), limit(100));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setFirestoreOk(true);
        const allLogs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog));
        // Filter in-memory securely
        const filtered = allLogs.filter(log => 
          user.workspaceMode === 'team' && user.teamId
            ? log.teamId === user.teamId
            : log.ownerUid === user.uid
        );
        setLogs(filtered);
      },
      (err) => {
        console.error("Firestore activity listen failed:", err);
        setFirestoreOk(false);
        setLogs([]);
      }
    );
    return () => unsub();
  }, [isAuthenticated, user]);

  const formatTime = (ts: any): string => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col min-w-0">
      <header className="mb-10">
        <button onClick={() => router.push('/board')} className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3 hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Board
        </button>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
          Activity Log
        </h1>
      </header>

      {!firestoreOk && (
        <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          ⚠ Firebase not configured — activity logging requires a real database connection.
        </div>
      )}

      <div className="max-w-2xl w-full glass-panel p-6 rounded-[2.5rem]">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="font-extrabold text-sm text-neutral-200 uppercase tracking-widest">Live Stream</h3>
        </div>

        {logs.length === 0 ? (
          <p className="text-center text-xs text-neutral-600 py-10 border border-dashed border-white/5 rounded-2xl font-semibold">
            {firestoreOk
              ? 'No activity yet. Create or move a task to see logs appear here in real time.'
              : 'Connect Firebase to see the live activity stream.'}
          </p>
        ) : (
          <div className="relative border-l border-white/5 pl-6 ml-3 space-y-6">
            {logs.map(log => (
              <div key={log.id} className="relative">
                <div className="absolute left-[-31px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[#050505] shadow-lg shadow-indigo-500/20" />
                <div>
                  <span className="text-xs text-neutral-400 font-bold">{log.user}</span>
                  <p className="text-sm font-semibold text-neutral-200 mt-0.5">{log.action}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-bold uppercase mt-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(log.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
