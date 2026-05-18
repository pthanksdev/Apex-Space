"use client";

import React, { useState } from 'react';
import { Task } from '@/store/taskSlice';
import TaskCard from './TaskCard';
import AddTaskForm from './AddTaskForm';

interface ColConfig {
  id: string;
  label: string;
  colorClass: string;
}

interface Props {
  column: ColConfig;
  tasks: Task[];
  activeTimers: Record<string, any>;
  taskTimes: Record<string, number>;
  onMove: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onToggleTimer: (id: string) => void;
  onAddTask: (columnId: string, title: string) => void;
  onClickTask: (task: Task) => void;
  currentUserId: string;
}

export default function KanbanColumn({
  column, tasks, activeTimers, taskTimes,
  onMove, onDelete, onToggleTimer, onAddTask, onClickTask, currentUserId
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div 
      className={`glass-panel border-t-2 rounded-[2rem] p-5 flex flex-col min-h-[450px] transition-all duration-300 ${column.colorClass} ${
        isDragOver ? 'ring-2 ring-indigo-500/30 scale-[1.01] bg-white/[0.04] shadow-xl shadow-indigo-500/5' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) {
          onMove(taskId, column.id);
        }
        setIsDragOver(false);
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <span className="font-extrabold text-sm text-neutral-200 uppercase tracking-widest">
          {column.label}
        </span>
        <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-xs font-bold text-neutral-400">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-4 flex-1">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isTimerActive={!!activeTimers[task.id]}
            elapsedSeconds={taskTimes[task.id] || 0}
            onMove={onMove}
            onDelete={onDelete}
            onToggleTimer={onToggleTimer}
            onClick={onClickTask}
            currentUserId={currentUserId}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-10 border border-dashed border-white/5 rounded-2xl text-neutral-600 text-xs font-semibold">
            Empty column
          </div>
        )}
      </div>

      {/* Add Task */}
      <div className="mt-4">
        <AddTaskForm columnId={column.id} onAdd={onAddTask} />
      </div>
    </div>
  );
}
