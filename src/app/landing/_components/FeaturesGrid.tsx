"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, BarChart3, Mic, Download, Shield } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: "Real-Time Sync",
    description: "Every update your team makes appears instantly across all devices — no refresh required."
  },
  {
    icon: Users,
    title: "Live Team Presence",
    description: "See who's online, what they're working on, and their current availability at a glance."
  },
  {
    icon: BarChart3,
    title: "Workspace Analytics",
    description: "Visual dashboards tracking completion rates, time logged, and priority breakdowns."
  },
  {
    icon: Mic,
    title: "Voice-to-Task",
    description: "Dictate tasks instantly using your microphone. No typing needed — just speak and create."
  },
  {
    icon: Download,
    title: "Install on Any Device",
    description: "Apex is a Progressive Web App. Add it to your home screen and use it like a native app."
  },
  {
    icon: Shield,
    title: "Secure OAuth Login",
    description: "Sign in with Google or GitHub in one click. No passwords to remember."
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4">Built for Real Teams</p>
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Every feature you need.
          <br />Nothing you don't.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel glass-panel-hover p-7 rounded-[2rem] group"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-neutral-400 font-medium leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
