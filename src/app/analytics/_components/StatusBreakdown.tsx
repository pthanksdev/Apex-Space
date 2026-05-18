"use client";

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface Props {
  todo: number;
  inProgress: number;
  inReview: number;
  completed: number;
  total: number;
}

export default function StatusBreakdown({ todo, inProgress, inReview, completed, total }: Props) {
  return (
    <div className="glass-panel p-6 rounded-[2rem]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-extrabold text-sm text-neutral-200 uppercase tracking-widest">
          Status Breakdown
        </h3>
        <BarChart3 className="w-4 h-4 text-indigo-400" />
      </div>

      <div className="space-y-4">
        {[
          { label: 'To Do', count: todo, color: 'bg-indigo-500' },
          { label: 'In Progress', count: inProgress, color: 'bg-blue-500' },
          { label: 'In Review', count: inReview, color: 'bg-amber-500' },
          { label: 'Completed', count: completed, color: 'bg-emerald-500' },
        ].map((col) => {
          const pct = total > 0 ? Math.round((col.count / total) * 100) : 0;
          return (
            <div key={col.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-neutral-400">{col.label}</span>
                <span className="text-white">{col.count} tasks ({pct}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className={`h-full ${col.color} rounded-full`} 
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
