"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, Check } from 'lucide-react';

export default function CTASection() {
  const router = useRouter();

  return (
    <>
      <section className="relative z-10 py-32 px-6 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-panel p-12 rounded-[3rem] border border-indigo-500/10 shadow-2xl shadow-indigo-500/5"
        >
          <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-6">
            <Globe className="w-7 h-7" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-4">
            Ready to reach your Apex?
          </h2>
          <p className="text-neutral-400 font-medium mb-10">
            Get started for free. No credit card required. Your team will be synchronized in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-neutral-500 font-bold uppercase tracking-wider">
            {['Free Forever', 'No Setup Fee', 'Works Offline'].map((label) => (
              <div key={label} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="Apex" className="w-7 h-7 rounded-xl object-cover shadow-md shadow-indigo-500/20" />
          <span className="text-sm font-bold text-neutral-400">Apex Space</span>
        </div>
        <p className="text-xs text-neutral-600 font-semibold">© 2026 Apex. Built for teams at their peak.</p>
        <button onClick={() => router.push('/login')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">
          Launch App →
        </button>
      </footer>
    </>
  );
}
