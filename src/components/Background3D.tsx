"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// Public pages manage their own backgrounds
const PUBLIC_PATHS = ['/landing', '/login', '/signup', '/'];

export default function Background3D() {
  const pathname = usePathname();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Don't render on public pages — they handle their own backgrounds
  if (PUBLIC_PATHS.includes(pathname)) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#050505]">
      {/* Dynamic Purple Orb */}
      <motion.div
        animate={{ x: mousePosition.x * 1.5, y: mousePosition.y * 1.5 }}
        transition={{ type: "spring", stiffness: 45, damping: 25 }}
        className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/10 blur-[130px] rounded-full"
      />
      {/* Dynamic Blue Orb */}
      <motion.div
        animate={{ x: -mousePosition.x * 2, y: -mousePosition.y * 2 }}
        transition={{ type: "spring", stiffness: 35, damping: 30 }}
        className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-blue-600/10 blur-[130px] rounded-full"
      />
      {/* Floating 3D Shapes */}
      <motion.div
        animate={{ x: mousePosition.x * 4, y: mousePosition.y * 4, rotate: mousePosition.x * 0.5 }}
        className="absolute top-[15%] right-[10%] w-36 h-36 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5 backdrop-blur-2xl hidden md:block"
      />
      <motion.div
        animate={{ x: -mousePosition.x * 5, y: -mousePosition.y * 3, rotate: -mousePosition.x * 0.8 }}
        className="absolute bottom-[20%] left-[8%] w-44 h-44 rounded-full bg-gradient-to-tr from-blue-500/5 to-transparent border border-white/5 backdrop-blur-3xl hidden md:block"
      />
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );
}
