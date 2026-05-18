"use client";

import React from 'react';
import { Task } from '@/store/taskSlice';
import { Clock, Calendar } from 'lucide-react';
import { Avatar, AvatarGroup, Tooltip } from '@mui/material';

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/10 border-red-500/20 text-red-400',
  high:     'bg-orange-500/10 border-orange-500/20 text-orange-400',
  medium:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
  low:      'bg-blue-500/10 border-blue-500/20 text-blue-400',
};

interface Props {
  task: Task;
  isTimerActive: boolean;
  elapsedSeconds: number;
  onMove: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onToggleTimer: (id: string) => void;
  onClick: (task: Task) => void;
  currentUserId: string;
}

export default function TaskCard({ task, isTimerActive, elapsedSeconds, onMove, onDelete, onToggleTimer, onClick, currentUserId }: Props) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div 
      className="glass-panel glass-panel-hover p-5 rounded-2xl group relative cursor-pointer active:scale-95 transition-transform"
      onClick={() => onClick(task)}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        // Make the card slightly transparent while dragging
        e.currentTarget.style.opacity = '0.5';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {/* Priority + Controls */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-1.5">
          <Tooltip title={isTimerActive ? 'Stop tracking' : 'Track time'}>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleTimer(task.id); }}
              className={`p-1.5 rounded-lg border transition-all text-xs ${
                isTimerActive
                  ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse'
                  : 'bg-white/5 border-white/5 text-neutral-500 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip title="Move to...">
            <select
              value={task.status}
              onClick={(e) => e.stopPropagation()}
              onChange={e => onMove(task.id, e.target.value)}
              className="bg-neutral-900 border border-white/5 text-[9px] rounded p-0.5 text-neutral-400 focus:outline-none focus:border-indigo-500"
            >
              <option value="todo">To Do</option>
              <option value="inprogress">Active</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </Tooltip>
          {task.ownerUid === currentUserId && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="p-1 text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none"
            >×</button>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="font-bold text-sm text-neutral-100 mb-1 leading-snug group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h3>
      <p className="text-xs text-neutral-500 truncate font-medium">{task.description}</p>

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-[10px] font-bold text-neutral-400 mb-1.5">
            <span>Checklist</span>
            <span>{completedSubtasks}/{totalSubtasks} ({progressPct}%)</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
        <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isOverdue ? 'text-red-400' : 'text-neutral-500'}`}>
          <Calendar className="w-3 h-3" />
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : 'No date'}
          {isOverdue && <span className="ml-1">· Overdue</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500 font-bold">
            {task.timeSpent + Math.floor(elapsedSeconds / 60)}m
          </span>
          <AvatarGroup max={2}>
            {task.assignedTo.map((name, i) => (
              <Tooltip key={i} title={name}>
                <Avatar sx={{ width: 20, height: 20, fontSize: 9, bgcolor: 'rgba(99,102,241,0.3)', color: '#a5b4fc', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {name[0]}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </div>
      </div>
    </div>
  );
}
