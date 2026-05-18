"use client";

import React from 'react';
import { Search } from 'lucide-react';

const PRIORITIES = ['all', 'critical', 'high', 'medium', 'low'];

interface Props {
  search: string;
  priority: string;
  onSearchChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
}

export default function BoardFilters({ search, priority, onSearchChange, onPriorityChange }: Props) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search tasks, categories..."
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 font-medium"
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
        {PRIORITIES.map(p => (
          <button
            key={p}
            onClick={() => onPriorityChange(p)}
            className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
              priority === p
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                : 'bg-white/5 text-neutral-400 border-transparent hover:bg-white/10'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
