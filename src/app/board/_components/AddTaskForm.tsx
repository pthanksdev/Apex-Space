"use client";

import React, { useState } from 'react';
import { Plus, Mic, MicOff } from 'lucide-react';

let recognition: any = null;
if (typeof window !== 'undefined') {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (SR) {
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }
}

interface Props {
  columnId: string;
  onAdd: (columnId: string, title: string) => void;
}

export default function AddTaskForm({ columnId, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [listening, setListening] = useState(false);

  const startVoice = () => {
    if (!recognition) { alert('Voice input requires Chrome.'); return; }
    if (listening) { recognition.stop(); setListening(false); return; }
    setListening(true);
    recognition.start();
    recognition.onresult = (e: any) => { setTitle(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend   = () => setListening(false);
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(columnId, title);
    setTitle('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border border-dashed border-white/5 hover:border-indigo-500/20 hover:bg-indigo-500/5 text-neutral-500 hover:text-indigo-400 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Task
      </button>
    );
  }

  return (
    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-3">
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setOpen(false); }}
          placeholder="Say or type a task..."
          className="w-full pr-10 pl-3 py-2 bg-black/20 border border-white/5 rounded-xl text-xs placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 font-medium"
          autoFocus
        />
        <button
          onClick={startVoice}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
            listening ? 'text-red-400 animate-pulse' : 'text-neutral-500 hover:text-indigo-400'
          }`}
        >
          {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={handleAdd} className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all">
          Create
        </button>
        <button onClick={() => { setTitle(''); setOpen(false); }} className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-neutral-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}
