"use client";

import React from 'react';
import { Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Task } from '@/store/taskSlice';

interface Props {
  tasks: Task[];
}

export default function BoardHeader({ tasks }: Props) {
  const done = tasks.filter(t => t.status === 'done').length;

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Collaborative Board
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
          Apex Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="glass-panel py-2 px-4 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Total</p>
            <p className="text-sm font-extrabold">{tasks.length}</p>
          </div>
        </div>
        <div className="glass-panel py-2 px-4 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Done</p>
            <p className="text-sm font-extrabold">{done}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
