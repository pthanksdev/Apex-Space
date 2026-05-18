import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/store/taskSlice';
import { X, CheckSquare, Plus, AlignLeft, Paperclip, Mic, MicOff, Volume2, VolumeX, Trash2, Loader2, Bell, AlertCircle, Calendar } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Tooltip } from '@mui/material';

interface Props {
  task: Task;
  onClose: () => void;
  onUpdateTaskLocally: (task: Task) => void;
}

export default function TaskDetailsModal({ task, onClose, onUpdateTaskLocally }: Props) {
  const [description, setDescription] = useState(task.description);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [attachments, setAttachments] = useState<any[]>(task.attachments || []);
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [reminderTime, setReminderTime] = useState(task.reminderTime || '');
  const { user } = useSelector((s: RootState) => s.user);

  // Cloudinary Settings
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const isCloudinaryConfigured = !!(cloudName && uploadPreset);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Speech Recognition States
  const [isListeningDesc, setIsListeningDesc] = useState(false);
  const [isListeningSub, setIsListeningSub] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Speech Synthesis States
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        recognitionRef.current = rec;
      }
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSave = async (
    updatedAttachments = attachments,
    newPriority = priority,
    newDueDate = dueDate,
    newReminder = reminderTime
  ) => {
    const updatedTask = {
      ...task,
      description,
      subtasks,
      attachments: updatedAttachments,
      priority: newPriority,
      dueDate: newDueDate || null,
      reminderTime: newReminder || null
    };
    onUpdateTaskLocally(updatedTask);
    
    // Sync to Firestore
    try {
      if (user) {
        await updateDoc(doc(db, 'tasks', task.id), {
          description,
          subtasks,
          attachments: updatedAttachments,
          priority: newPriority,
          dueDate: newDueDate || null,
          reminderTime: newReminder || null
        });
      }
    } catch (e) {
      console.warn("Failed to update task details in Firestore", e);
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), text: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  // --- Voice-to-Text (Speech Recognition) ---
  const startSpeechRecognition = (target: 'description' | 'subtask') => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    if (target === 'description') {
      setIsListeningDesc(true);
      setIsListeningSub(false);
    } else {
      setIsListeningSub(true);
      setIsListeningDesc(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (target === 'description') {
        setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
      } else {
        setNewSubtask(transcript);
      }
    };

    rec.onend = () => {
      setIsListeningDesc(false);
      setIsListeningSub(false);
    };

    rec.onerror = () => {
      setIsListeningDesc(false);
      setIsListeningSub(false);
    };

    try {
      rec.start();
    } catch {
      rec.stop();
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListeningDesc(false);
    setIsListeningSub(false);
  };

  // --- Text-to-Voice (Speech Synthesis) ---
  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `Task title: ${task.title}. Description: ${description || 'No description provided'}. Checklist status: ${subtasks.filter(st => st.completed).length} of ${subtasks.length} items completed.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // --- File Attachments & Cloudinary Direct Upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadError('');

    // --- Sandbox Mock Mode Fallback ---
    if (!isCloudinaryConfigured) {
      setTimeout(() => {
        const isImage = file.type.startsWith('image/');
        const newAttachment = {
          id: Date.now().toString(),
          name: file.name,
          url: isImage 
            ? URL.createObjectURL(file) 
            : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          type: isImage ? 'image' : 'document',
          uploadedAt: new Date().toISOString()
        };
        const updatedList = [...attachments, newAttachment];
        setAttachments(updatedList);
        handleSave(updatedList);
        setIsUploading(false);
      }, 1000);
      return;
    }

    // --- Real Cloudinary Upload ---
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset!);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Cloudinary upload failed.');

      const data = await response.json();
      
      const newAttachment = {
        id: data.asset_id || Date.now().toString(),
        name: file.name,
        url: data.secure_url,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        uploadedAt: new Date().toISOString()
      };

      const updatedList = [...attachments, newAttachment];
      setAttachments(updatedList);
      handleSave(updatedList);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setUploadError('Failed to upload file. Please check Cloudinary config.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    const updatedList = attachments.filter(att => att.id !== id);
    setAttachments(updatedList);
    handleSave(updatedList);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { handleSave(); onClose(); }}
          className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-wide">{task.title}</h2>
              <Tooltip title={isSpeaking ? "Stop Reading" : "Read Aloud"}>
                <button
                  onClick={handleReadAloud}
                  className={`p-2 rounded-xl border transition-all ${
                    isSpeaking 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' 
                      : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </Tooltip>
            </div>
            <button
              onClick={() => { handleSave(); onClose(); }}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-8">
            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[11px]">
                  <AlignLeft className="w-4 h-4" /> Description
                </div>
                <Tooltip title={isListeningDesc ? "Stop Listening" : "Dictate Text"}>
                  <button
                    onClick={() => isListeningDesc ? stopSpeechRecognition() : startSpeechRecognition('description')}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isListeningDesc 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' 
                        : 'bg-white/5 border-white/5 text-neutral-500 hover:text-white'
                    }`}
                  >
                    {isListeningDesc ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                </Tooltip>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isListeningDesc ? "Listening..." : "Add a more detailed description..."}
                className={`w-full bg-white/5 border rounded-2xl p-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 min-h-[120px] resize-y transition-colors ${
                  isListeningDesc ? 'border-red-500/30' : 'border-white/5'
                }`}
              />
            </div>

            {/* Metadata Selection Grid (Responsive, stacks on mobile, 3 columns on iPad/Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-6">
              {/* Priority */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-400" /> Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setPriority(val);
                    handleSave(attachments, val, dueDate, reminderTime);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-200 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="low" className="bg-neutral-900 text-neutral-200">Low</option>
                  <option value="medium" className="bg-neutral-900 text-neutral-200">Medium</option>
                  <option value="high" className="bg-neutral-900 text-neutral-200">High</option>
                  <option value="critical" className="bg-neutral-900 text-neutral-200">Critical</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDueDate(val);
                    handleSave(attachments, priority, val, reminderTime);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-200 focus:outline-none focus:border-indigo-500/50 min-h-[38px]"
                />
              </div>

              {/* Reminder Alarm */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">
                  <Bell className="w-3.5 h-3.5 text-indigo-400" /> Set Reminder
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={reminderTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReminderTime(val);
                      handleSave(attachments, priority, dueDate, val);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-xs font-semibold text-neutral-200 focus:outline-none focus:border-indigo-500/50 min-h-[38px]"
                  />
                  {reminderTime && (
                    <button
                      onClick={() => {
                        setReminderTime('');
                        handleSave(attachments, priority, dueDate, '');
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-red-400 text-[10px] font-extrabold uppercase hover:bg-white/5 px-1.5 py-0.5 rounded transition-all"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Subtasks (Checklist) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-[11px]">
                  <CheckSquare className="w-4 h-4" /> Checklist
                </div>
                <span className="text-xs font-bold text-neutral-500">
                  {subtasks.filter(st => st.completed).length} / {subtasks.length}
                </span>
              </div>

              {/* Progress bar */}
              {subtasks.length > 0 && (
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${subtasks.every(st => st.completed) ? 'bg-emerald-500' : 'bg-emerald-500/50'}`}
                    style={{ width: `${Math.round((subtasks.filter(st => st.completed).length / subtasks.length) * 100)}%` }}
                  />
                </div>
              )}

              <div className="space-y-2 mb-4">
                {subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                    <button 
                      onClick={() => toggleSubtask(st.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-neutral-600 hover:border-emerald-500'}`}
                    >
                      {st.completed && <CheckSquare className="w-3.5 h-3.5" />}
                    </button>
                    <span className={`flex-1 text-sm font-medium ${st.completed ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                      {st.text}
                    </span>
                    <button 
                      onClick={() => removeSubtask(st.id)}
                      className="p-1 text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                    placeholder={isListeningSub ? "Listening..." : "Add an item..."}
                    className={`w-full bg-white/5 border rounded-xl pl-4 pr-12 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors ${
                      isListeningSub ? 'border-red-500/30' : 'border-white/5'
                    }`}
                  />
                  <Tooltip title={isListeningSub ? "Stop Listening" : "Dictate checklist item"}>
                    <button
                      onClick={() => isListeningSub ? stopSpeechRecognition() : startSpeechRecognition('subtask')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg border transition-all ${
                        isListeningSub 
                          ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' 
                          : 'bg-white/5 border-white/5 text-neutral-500 hover:text-white'
                      }`}
                    >
                      {isListeningSub ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  </Tooltip>
                </div>
                <button
                  onClick={addSubtask}
                  className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* File Attachments (Cloudinary integration) */}
            <div className="space-y-4 border-t border-white/5 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-[11px]">
                  <Paperclip className="w-4 h-4" /> Attachments
                </div>
                {!isCloudinaryConfigured && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                    Sandbox Mode
                  </span>
                )}
              </div>

              {/* Upload Button wrapper */}
              <div className="flex flex-col gap-2">
                <label className={`relative flex items-center justify-center gap-2 w-full p-4 border border-dashed rounded-2xl cursor-pointer transition-all ${
                  isUploading 
                    ? 'bg-white/[0.01] border-white/5 text-neutral-500' 
                    : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.07] text-neutral-300'
                }`}>
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                    className="hidden" 
                  />
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span className="text-xs font-bold">Uploading file to {isCloudinaryConfigured ? 'Cloudinary' : 'Sandbox'}...</span>
                    </>
                  ) : (
                    <>
                      <Paperclip className="w-4 h-4 text-neutral-400" />
                      <span className="text-xs font-bold">Click to Upload Image or Document</span>
                    </>
                  )}
                </label>
                {uploadError && (
                  <p className="text-red-400 text-[10px] font-bold mt-1">{uploadError}</p>
                )}
                {!isCloudinaryConfigured && (
                  <p className="text-[10px] text-neutral-500 leading-snug">
                    ℹ Running in Sandbox Mode. Files are stored locally for testing. To connect real storage, configure <strong>Cloudinary Direct Upload</strong> in your <code>.env.local</code>.
                  </p>
                )}
              </div>

              {/* Attachments List */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {attachments.map(att => (
                  <div 
                    key={att.id} 
                    className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/5 transition-all"
                  >
                    {att.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={att.url} 
                        alt={att.name} 
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <a 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-white hover:text-indigo-400 transition-colors truncate block"
                      >
                        {att.name}
                      </a>
                      <span className="text-[9px] text-neutral-500 font-medium">
                        {new Date(att.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
