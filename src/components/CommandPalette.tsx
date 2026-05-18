"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, BarChart3, Users, User, LogOut, Plus, Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { clearUser } from '@/store/userSlice';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s: RootState) => s.user);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const handleAction = async (action: () => void) => {
    setIsOpen(false);
    setQuery('');
    action();
  };

  const commands = [
    { name: 'Go to Board', icon: LayoutDashboard, action: () => router.push('/board'), authRequired: true },
    { name: 'Go to Analytics', icon: BarChart3, action: () => router.push('/analytics'), authRequired: true },
    { name: 'Go to Team Presence', icon: Users, action: () => router.push('/presence'), authRequired: true },
    { name: 'Go to Profile', icon: User, action: () => router.push('/profile'), authRequired: true },
    { name: 'Add New Task', icon: Plus, action: () => router.push('/board?action=add-task'), authRequired: true },
    { name: 'Log Out', icon: LogOut, action: async () => { await signOut(auth); dispatch(clearUser()); router.push('/login'); }, authRequired: true },
  ];

  const filteredCommands = commands.filter(
    (cmd) => cmd.name.toLowerCase().includes(query.toLowerCase()) && (!cmd.authRequired || isAuthenticated)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl mx-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-white/5">
              <Search className="w-5 h-5 text-neutral-500 mr-3" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-500 text-sm"
              />
              <div className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-neutral-400 uppercase tracking-widest border border-white/5">
                ESC
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <p className="text-center text-sm text-neutral-500 py-6">No commands found.</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-3 py-2">
                    Suggestions
                  </p>
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.name}
                      onClick={() => handleAction(cmd.action)}
                      className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 text-neutral-300 transition-colors group"
                    >
                      <cmd.icon className="w-4 h-4 mr-3 text-neutral-500 group-hover:text-indigo-400 transition-colors" />
                      <span className="text-sm font-medium">{cmd.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
