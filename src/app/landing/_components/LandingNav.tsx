"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function LandingNav() {
  const router = useRouter();

  return (
    <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <img src="/icon-192.png" alt="Apex" className="w-9 h-9 rounded-xl object-cover shadow-md shadow-indigo-500/20" />
        <span className="text-lg font-extrabold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-wide">
          Apex Space
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-400">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/login')}
          className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors px-4 py-2"
        >
          Log In
        </button>
        <button
          onClick={() => router.push('/login')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          Get Started
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
}
