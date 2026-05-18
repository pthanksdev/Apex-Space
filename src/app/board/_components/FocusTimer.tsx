"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/store/taskSlice';
import { Play, Square, X, Flame } from 'lucide-react';

interface Props {
  activeTasks: { task: Task; seconds: number }[];
  onStopTimer: (taskId: string) => void;
  onClearTimer: (taskId: string) => void;
}

export default function FocusTimer({ activeTasks, onStopTimer, onClearTimer }: Props) {
  if (activeTasks.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {activeTasks.map(({ task, seconds }) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass-panel p-3 rounded-2xl flex items-center gap-4 shadow-2xl shadow-indigo-500/20 pointer-events-auto border-indigo-500/30"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
              <Flame className="w-5 h-5 text-indigo-400 relative z-10" />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Focusing on</p>
              <p className="text-sm font-bold text-white truncate max-w-[250px]">{task.title}</p>
            </div>

            <div className="text-2xl font-extrabold font-mono text-white tracking-widest w-24 text-center">
              {Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
            </div>

            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <button 
                onClick={() => onStopTimer(task.id)}
                className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
              <button 
                onClick={() => onClearTimer(task.id)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
