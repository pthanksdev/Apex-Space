"use client";

import React from 'react';
import Link from 'next/link';
import { Compass, MoveLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Premium cosmic background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glassmorphic 404 Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg glass-panel border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center relative z-10 shadow-[0_20px_50px_rgba(99,102,241,0.05)]"
      >
        {/* Glowing Radar Compass Icon */}
        <div className="relative w-20 h-20 mx-auto mb-8 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="absolute inset-0 border border-dashed border-indigo-500/30 rounded-3xl pointer-events-none scale-110"
          />
          <Compass className="w-10 h-10" />
        </div>

        {/* 404 Headline */}
        <h1 className="text-8xl font-black bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent tracking-tighter leading-none mb-4">
          404
        </h1>
        <h2 className="text-xl font-extrabold text-neutral-100 tracking-wide mb-3">
          Page Lost in Orbit
        </h2>
        <p className="text-sm text-neutral-400 font-medium leading-relaxed max-w-sm mx-auto mb-10">
          The page you are looking for has floated out into the void of the collaborative grid, or never existed in this workspace.
        </p>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/board" className="w-full sm:w-auto">
            <button className="w-full py-3.5 px-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 active:scale-95">
              <MoveLeft className="w-4 h-4" /> Return to Board
            </button>
          </Link>
          <Link href="/presence" className="w-full sm:w-auto">
            <button className="w-full py-3.5 px-6 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/5 active:scale-95">
              <HelpCircle className="w-4 h-4" /> Check Presence
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Floating coordinates details */}
      <div className="absolute bottom-6 text-[10px] text-neutral-600 font-bold uppercase tracking-widest pointer-events-none">
        System Status: Grid Stabilized · 404 ERROR
      </div>
    </div>
  );
}
