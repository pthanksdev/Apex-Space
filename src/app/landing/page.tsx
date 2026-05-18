"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import LandingNav from './_components/LandingNav';
import HeroSection from './_components/HeroSection';
import FeaturesGrid from './_components/FeaturesGrid';
import Testimonials from './_components/Testimonials';
import CTASection from './_components/CTASection';

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ x: mousePos.x * 1.5, y: mousePos.y * 1.5 }}
          transition={{ type: "spring", stiffness: 40, damping: 25 }}
          className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-indigo-600/10 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ x: -mousePos.x * 2, y: -mousePos.y * 2 }}
          transition={{ type: "spring", stiffness: 30, damping: 30 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <LandingNav />
      <HeroSection />
      <FeaturesGrid />
      <Testimonials />
      <CTASection />
    </div>
  );
}
