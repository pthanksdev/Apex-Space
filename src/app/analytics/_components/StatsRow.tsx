"use client";

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { LinearProgress } from '@mui/material';

interface Props {
  completionRate: number;
  totalHours: number;
  totalMinutes: number;
  criticalTasks: number;
}

export default function StatsRow({ completionRate, totalHours, totalMinutes, criticalTasks }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Completion Progress */}
      <div className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between min-h-[180px]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Completion rate</p>
          <CheckCircle2 className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-5xl font-extrabold tracking-tight text-white mb-3">
            {completionRate}%
          </h2>
          <div className="w-full">
            <LinearProgress 
              variant="determinate" 
              value={completionRate} 
              className="h-1.5 rounded-full bg-white/5"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#6366f1',
                  borderRadius: 999
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Total Time Spent */}
      <div className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between min-h-[180px]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total logged work</p>
          <Clock className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-5xl font-extrabold tracking-tight text-white mb-1">
            {totalHours} <span className="text-xl text-neutral-500 font-bold">hrs</span>
          </h2>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
            From {totalMinutes} cumulative tracked minutes
          </p>
        </div>
      </div>

      {/* Critical Blocks */}
      <div className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between min-h-[180px]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Active Critical Tasks</p>
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-5xl font-extrabold tracking-tight text-red-400 mb-1">
            {criticalTasks}
          </h2>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
            Urgent cards needing fast resolution
          </p>
        </div>
      </div>
    </div>
  );
}
