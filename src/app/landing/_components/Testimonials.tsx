"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: "Sarah Connor", role: "AI Integration Lead", quote: "Apex is the first tool that actually keeps our distributed team in sync in real time. It feels like everyone's in the same room." },
  { name: "Paul Thanksgiving", role: "Lead Developer", quote: "The voice-to-task feature alone saved me hours of context-switching. I just talk and the board updates itself." },
  { name: "Tessy Adams", role: "UI Engineer", quote: "It looks stunning. Our clients actually ask what tool we're using when they see our Apex boards on screen." },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4">Loved by Teams</p>
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          What teams are saying.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-7 rounded-[2rem] flex flex-col justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-neutral-300 font-medium leading-relaxed italic">"{t.quote}"</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-white/10 flex items-center justify-center text-indigo-300 font-bold text-sm">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-[10px] text-neutral-500 font-semibold">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
