"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { ArrowLeft } from 'lucide-react';
import StatsRow from './_components/StatsRow';
import StatusBreakdown from './_components/StatusBreakdown';
import PriorityBreakdown from './_components/PriorityBreakdown';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.user);
  const { tasks } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) return null;

  // Stats Calculations
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const inReview = tasks.filter(t => t.status === 'review').length;
  const todo = tasks.filter(t => t.status === 'todo').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalMinutes = tasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;

  const priorityBreakdown = {
    critical: tasks.filter(t => t.priority === 'critical').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col min-w-0">
      {/* Header */}
      <header className="mb-10 flex items-center justify-between">
        <div>
          <button 
            onClick={() => router.push('/board')}
            className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-2 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspace</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Workspace Insights
          </h1>
        </div>
      </header>

      <StatsRow 
        completionRate={completionRate} 
        totalHours={totalHours} 
        totalMinutes={totalMinutes} 
        criticalTasks={criticalTasks} 
      />

      {/* Breakdown Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusBreakdown 
          todo={todo} 
          inProgress={inProgress} 
          inReview={inReview} 
          completed={completed} 
          total={total} 
        />
        
        <PriorityBreakdown 
          critical={priorityBreakdown.critical} 
          high={priorityBreakdown.high} 
          medium={priorityBreakdown.medium} 
          low={priorityBreakdown.low} 
          total={total} 
        />
      </div>
    </div>
  );
}
