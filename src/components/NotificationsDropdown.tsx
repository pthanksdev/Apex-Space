"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Users, ArrowRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { db, saveUserProfile } from '@/lib/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { setUser } from '@/store/userSlice';
import { useRouter } from 'next/navigation';

export interface Notification {
  id: string;
  recipientUid: string;
  senderUid: string;
  senderEmail: string;
  type: 'team_invite' | 'task_assign';
  title: string;
  message: string;
  teamId?: string;
  teamName?: string;
  status: 'unread' | 'read';
  timestamp: any;
}

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('recipientUid', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(data.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0)));
    });
    return () => unsub();
  }, [user]);

  const handleAcceptInvite = async (notif: Notification) => {
    if (!user) return;
    
    // Update user profile to join the team
    const updatedUser = {
      ...user,
      workspaceMode: 'team' as const,
      teamId: notif.teamId || null,
    };
    
    // Save to Firestore
    await saveUserProfile(user.uid, {
      workspaceMode: 'team',
      teamId: notif.teamId || null,
      teamName: notif.teamName || null,
    });
    
    // Also add to team_members
    if (notif.teamId) {
      await addDoc(collection(db, 'team_members'), {
        teamId: notif.teamId,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'member',
        joinedAt: serverTimestamp()
      });
    }

    // Update Redux
    dispatch(setUser(updatedUser));
    
    // Delete the notification
    await deleteDoc(doc(db, 'notifications', notif.id));
    
    router.push('/board');
    setIsOpen(false);
  };

  const handleDecline = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  const handleMarkRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { status: 'read' });
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse border-2 border-[#0a0a0a]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 z-50 glass-panel border border-white/10 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col max-h-[400px]"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                  {unreadCount} New
                </span>
              </div>

              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-neutral-500 py-8">You're all caught up!</p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-xl transition-colors ${notif.status === 'unread' ? 'bg-indigo-500/5 border border-indigo-500/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notif.type === 'team_invite' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {notif.type === 'team_invite' ? <Users className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white mb-0.5">{notif.title}</p>
                          <p className="text-[11px] text-neutral-400 leading-snug mb-2">{notif.message}</p>
                          
                          {notif.type === 'team_invite' && (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleAcceptInvite(notif)}
                                className="flex-1 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-bold transition-colors"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleDecline(notif.id)}
                                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-[10px] font-bold transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {notif.type !== 'team_invite' && notif.status === 'unread' && (
                            <button 
                              onClick={() => handleMarkRead(notif.id)}
                              className="text-[10px] text-indigo-400 font-bold hover:text-indigo-300"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
