"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative z-10 flex flex-col items-center text-center pt-20 pb-32 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-8"
      >
        <Zap className="w-3 h-3 fill-current" />
        <span>Now with Voice-to-Task & PWA Support</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
      >
        <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
          Your team's
        </span>
        <br />
        <span className="text-indigo-400">peak performance</span>
        <br />
        <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
          starts here.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-neutral-400 text-xl max-w-2xl mb-12 font-medium leading-relaxed"
      >
        Apex is a real-time collaborative workspace with live Kanban boards, 
        presence tracking, analytics dashboards, and voice-to-task creation.
        Built to run everywhere — including your home screen.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <button
          onClick={() => router.push('/login')}
          className="bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
          Launch Free Workspace
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push('/login')}
          className="border border-white/10 hover:border-indigo-500/40 text-neutral-300 hover:text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all bg-white/5 hover:bg-white/10"
        >
          Watch Demo
        </button>
      </motion.div>

      {/* Hero mockup preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-20 w-full max-w-4xl"
      >
        <div className="glass-panel rounded-[2.5rem] p-1 shadow-2xl shadow-indigo-500/10">
          <div className="rounded-[2rem] bg-black/40 p-6 border border-white/5">
            {/* Mock Board Preview */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 h-5 rounded-full bg-white/5 border border-white/5 text-[10px] text-neutral-500 flex items-center px-3 font-mono">
                apex.workspace / board
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { col: 'To Do', color: 'border-t-indigo-500', tasks: ['Auth Integration', 'CI/CD Pipeline'] },
                { col: 'In Progress', color: 'border-t-blue-500', tasks: ['Kanban UI', '3D Background'] },
                { col: 'In Review', color: 'border-t-amber-500', tasks: ['Service Worker'] },
                { col: 'Done', color: 'border-t-emerald-500', tasks: ['Voice-to-Task', 'Redux Store', 'PWA Manifest'] },
              ].map((col) => (
                <div key={col.col} className={`bg-white/[0.02] border-t-2 ${col.color} border border-white/5 rounded-2xl p-3 space-y-2.5`}>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 mb-3">{col.col}</p>
                  {col.tasks.map(t => (
                    <div key={t} className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                      <p className="text-[9px] font-semibold text-neutral-300">{t}</p>
                      <div className="mt-1.5 flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-indigo-600/40 border border-white/10" />
                        <div className="flex-1 h-1 rounded-full bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
