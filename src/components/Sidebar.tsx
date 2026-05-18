"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  Trello, 
  BarChart3, 
  Settings, 
  LogOut, 
  Users, 
  FolderGit2,
  Activity,
  User as UserIcon,
  Building2,
  Triangle
} from 'lucide-react';
import { Avatar, Tooltip } from '@mui/material';
import NotificationsDropdown from './NotificationsDropdown';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);

  const isPublicPage = pathname === '/landing' || pathname === '/login';
  if (!isAuthenticated || isPublicPage) return null;

  const menuItems = [
    { name: 'Board', icon: Trello, path: '/board' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Team', icon: Building2, path: '/team' },
    { name: 'Presence', icon: Users, path: '/presence' },
    { name: 'Activity', icon: Activity, path: '/activity' },
    { name: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col hidden md:flex shrink-0 z-20">
      {/* Title */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Triangle className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">Apex</span>
        </div>
        <NotificationsDropdown />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 relative group ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
              {item.name}
              
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar 
              src={user?.photoURL || undefined} 
              className="bg-indigo-600/30 text-indigo-400 border border-white/10"
            >
              {user?.displayName?.[0] || user?.email?.[0] || <UserIcon className="w-4 h-4" />}
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-200 truncate">
                {user?.displayName || 'Active Member'}
              </p>
              <p className="text-[10px] text-neutral-500 truncate font-semibold">
                {user?.email}
              </p>
            </div>
          </div>
          
          <Tooltip title="Log Out">
            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
