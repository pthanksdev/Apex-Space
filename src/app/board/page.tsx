"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setTasks, Task } from '@/store/taskSlice';
import { db, logActivity } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';

import BoardHeader from './_components/BoardHeader';
import BoardFilters from './_components/BoardFilters';
import KanbanColumn from './_components/KanbanColumn';
import TaskDetailsModal from './_components/TaskDetailsModal';
import FocusTimer from './_components/FocusTimer';

const COLUMNS = [
  { id: 'todo',       label: 'To Do',      colorClass: 'border-t-indigo-500 bg-indigo-500/5' },
  { id: 'inprogress', label: 'In Progress', colorClass: 'border-t-blue-500 bg-blue-500/5' },
  { id: 'review',     label: 'In Review',   colorClass: 'border-t-amber-500 bg-amber-500/5' },
  { id: 'done',       label: 'Completed',   colorClass: 'border-t-emerald-500 bg-emerald-500/5' },
];

function BoardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading: authLoading } = useSelector((s: RootState) => s.user);
  const { tasks } = useSelector((s: RootState) => s.tasks);

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [taskTimes, setTaskTimes] = useState<Record<string, number>>({});
  const [activeTimers, setActiveTimers] = useState<Record<string, any>>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [firestoreError, setFirestoreError] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  // Real Firestore listener — no mock fallback
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    // Data Isolation Query
    const tasksRef = collection(db, 'tasks');
    const q = user.workspaceMode === 'team' && user.teamId
      ? query(tasksRef, where('teamId', '==', user.teamId))
      : query(tasksRef, where('ownerUid', '==', user.uid));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setFirestoreError(false);
        const data: Task[] = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() } as Task));
        dispatch(setTasks(data));
      },
      () => {
        setFirestoreError(true);
        dispatch(setTasks([])); // Show empty board — no mock data
      }
    );
    return () => unsub();
  }, [isAuthenticated, dispatch]);

  // Handle incoming Share Target or Command Palette actions
  useEffect(() => {
    if (!isAuthenticated || activeTask) return;
    
    const sharedTitle = searchParams.get('title');
    const sharedText = searchParams.get('text');
    const sharedUrl = searchParams.get('url');
    const action = searchParams.get('action');

    if (action === 'add-task' || sharedTitle || sharedUrl) {
      const draftTask: Task = {
        id: `draft-${Date.now()}`,
        title: sharedTitle || 'New Shared Task',
        description: [sharedText, sharedUrl].filter(Boolean).join('\n\n'),
        status: 'todo',
        priority: 'medium',
        category: 'Inbox',
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: [user?.displayName || 'You'],
        subtasks: [],
        timeSpent: 0,
        ownerUid: user?.uid || 'guest',
        teamId: user?.workspaceMode === 'team' ? (user.teamId || null) : null,
        createdAt: serverTimestamp(),
      };
      
      // Auto-open modal for the new task
      setActiveTask(draftTask as any);
      
      // Clean up the URL so it doesn't trigger again on refresh
      router.replace('/board');
    }
  }, [searchParams, isAuthenticated, router, user]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const addTask = async (colId: string, title: string) => {
    const payload = {
      title,
      description: '',
      status: colId,
      priority: 'medium',
      category: 'General',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      assignedTo: [user?.displayName || 'You'],
      timeSpent: 0,
      ownerUid: user?.uid || 'guest',
      teamId: user?.workspaceMode === 'team' ? user.teamId : null,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'tasks'), payload);
      await logActivity(
        user?.displayName || 'Someone', 
        `created task "${title}"`, 
        user?.uid || 'guest', 
        user?.workspaceMode === 'team' ? (user.teamId || null) : null
      );
    } catch {
      // Offline — add locally
      dispatch(setTasks([...tasks, { id: `local-${Date.now()}`, ...payload, createdAt: new Date().toISOString() } as Task]));
    }
  };

  const moveTask = async (id: string, status: string) => {
    const task = tasks.find(t => t.id === id);
    try {
      await updateDoc(doc(db, 'tasks', id), { status });
      await logActivity(
        user?.displayName || 'Someone', 
        `moved "${task?.title}" to ${status}`,
        user?.uid || 'guest', 
        user?.workspaceMode === 'team' ? (user.teamId || null) : null
      );
    } catch {
      dispatch(setTasks(tasks.map(t => t.id === id ? { ...t, status: status as Task['status'] } : t)));
    }
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    try {
      await deleteDoc(doc(db, 'tasks', id));
      await logActivity(
        user?.displayName || 'Someone', 
        `deleted task "${task?.title}"`,
        user?.uid || 'guest', 
        user?.workspaceMode === 'team' ? (user.teamId || null) : null
      );
    } catch {
      dispatch(setTasks(tasks.filter(t => t.id !== id)));
    }
  };

  const toggleTimer = (id: string) => {
    if (activeTimers[id]) {
      // Clear it without saving to Firestore (pause)
      clearInterval(activeTimers[id]);
      const { [id]: _, ...rest } = activeTimers;
      setActiveTimers(rest);
    } else {
      const interval = setInterval(() => {
        setTaskTimes(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
      }, 1000);
      setActiveTimers(p => ({ ...p, [id]: interval }));
    }
  };

  const stopTimerAndSave = async (id: string) => {
    const elapsedMinutes = Math.floor((taskTimes[id] || 0) / 60);
    const task = tasks.find(t => t.id === id);
    
    // Stop local timer
    if (activeTimers[id]) clearInterval(activeTimers[id]);
    const { [id]: _, ...rest } = activeTimers;
    setActiveTimers(rest);
    
    const newTimes = { ...taskTimes };
    delete newTimes[id];
    setTaskTimes(newTimes);

    if (task && elapsedMinutes > 0) {
      try {
        await updateDoc(doc(db, 'tasks', id), {
          timeSpent: (task.timeSpent || 0) + elapsedMinutes
        });
      } catch (e) {
        // local update
        dispatch(setTasks(tasks.map(t => t.id === id ? { ...t, timeSpent: (t.timeSpent || 0) + elapsedMinutes } : t)));
      }
    }
  };

  const clearTimerLocal = (id: string) => {
    if (activeTimers[id]) clearInterval(activeTimers[id]);
    const { [id]: _, ...rest } = activeTimers;
    setActiveTimers(rest);
    const newTimes = { ...taskTimes };
    delete newTimes[id];
    setTaskTimes(newTimes);
  };

  const filtered = tasks.filter(t =>
    (t.title.toLowerCase().includes(search.toLowerCase()) ||
     t.category.toLowerCase().includes(search.toLowerCase())) &&
    (priority === 'all' || t.priority === priority)
  );

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col min-w-0">
      {firestoreError && (
        <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          ⚠ Firebase not configured. Add your keys to .env.local to enable real-time data sync.
        </div>
      )}

      <BoardHeader tasks={tasks} />
      <BoardFilters
        search={search}
        priority={priority}
        onSearchChange={setSearch}
        onPriorityChange={setPriority}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={filtered.filter(t => t.status === col.id)}
            activeTimers={activeTimers}
            taskTimes={taskTimes}
            onMove={moveTask}
            onDelete={deleteTask}
            onToggleTimer={toggleTimer}
            onAddTask={addTask}
            onClickTask={setActiveTask}
            currentUserId={user?.uid || ''}
          />
        ))}
      </div>

      {activeTask && (
        <TaskDetailsModal 
          task={activeTask} 
          onClose={() => setActiveTask(null)}
          onUpdateTaskLocally={(updatedTask) => {
            // Check if it's a new draft task being saved
            if (updatedTask.id.startsWith('draft-')) {
              const newTask = { ...updatedTask, id: Date.now().toString() };
              dispatch(setTasks([...tasks, newTask]));
              // Normally we would also save to firestore here for a brand new task
              addDoc(collection(db, 'tasks'), newTask).catch(() => {});
            } else {
              dispatch(setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t)));
            }
            setActiveTask(null);
          }}
        />
      )}

      <FocusTimer 
        activeTasks={Object.keys(activeTimers).map(id => ({ 
          task: tasks.find(t => t.id === id) as Task, 
          seconds: taskTimes[id] || 0 
        })).filter(t => t.task)} 
        onStopTimer={stopTimerAndSave}
        onClearTimer={clearTimerLocal}
      />
    </div>
  );
}

export default function BoardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BoardPageContent />
    </Suspense>
  );
}
