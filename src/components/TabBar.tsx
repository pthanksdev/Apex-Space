"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  Trello, 
  BarChart3, 
  Users, 
  Activity,
  Building2,
  User as UserIcon
} from 'lucide-react';

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const isPublicPage = pathname === '/landing' || pathname === '/login';
  if (!isAuthenticated || isPublicPage) return null;

  const menuItems = [
    { name: 'Board', icon: Trello, path: '/board' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Team', icon: Building2, path: '/team' },
    { name: 'Activity', icon: Activity, path: '/activity' },
    { name: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 py-2 px-6 flex justify-around items-center md:hidden z-30 pb-safe shadow-2xl">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className="flex flex-col items-center gap-1.5 focus:outline-none py-1 relative group w-16"
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isActive 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-neutral-500 hover:text-white'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            
            <span className={`text-[9px] font-bold tracking-wide transition-colors ${
              isActive ? 'text-indigo-400' : 'text-neutral-500'
            }`}>
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
