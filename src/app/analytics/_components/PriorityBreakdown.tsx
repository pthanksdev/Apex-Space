"use client";

import React from 'react';
import { PieChart } from 'lucide-react';

interface Props {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export default function PriorityBreakdown({ critical, high, medium, low, total }: Props) {
  return (
    <div className="glass-panel p-6 rounded-[2rem]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-extrabold text-sm text-neutral-200 uppercase tracking-widest">
          Priority Breakdown
        </h3>
        <PieChart className="w-4 h-4 text-indigo-400" />
      </div>

      <div className="space-y-4">
        {[
          { label: 'Critical', count: critical, color: 'bg-red-500' },
          { label: 'High', count: high, color: 'bg-orange-500' },
          { label: 'Medium', count: medium, color: 'bg-amber-500' },
          { label: 'Low', count: low, color: 'bg-blue-500' },
        ].map((col) => {
          const pct = total > 0 ? Math.round((col.count / total) * 100) : 0;
          return (
            <div key={col.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-neutral-400">{col.label}</span>
                <span className="text-white">{col.count} ({pct}%)</span>
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
