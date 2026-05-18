"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/store/userSlice';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { RootState } from '@/store/store';
import {
  FolderGit2, Mail, Lock, User, Chrome, Github,
  ArrowRight, ArrowLeft, ShieldCheck, Users, Sparkles, Building2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Snackbar } from '@mui/material';

type WorkspaceMode = 'personal' | 'create-team' | 'join-team' | null;
type Step = 'account' | 'workspace';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s: RootState) => s.user);

  const [step, setStep] = useState<Step>('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<WorkspaceMode>(null);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.push('/board');
  }, [isAuthenticated, router]);

  const completeSignup = (user: any, workspaceMode: WorkspaceMode) => {
    dispatch(setUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || name || user.email?.split('@')[0],
      photoURL: user.photoURL || null,
    }));
    // Store workspace preference in localStorage for now
    localStorage.setItem('apex_workspace_mode', workspaceMode || 'personal');
    if (workspaceMode === 'create-team') {
      localStorage.setItem('apex_team_name', teamName);
    }
    router.push('/board');
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      setPendingUser(result.user);
      setStep('workspace');
    } catch (err: any) {
      console.error('Email signup error:', err);
      // Fallback sandbox mode for all configuration/provider issues
      const isConfigError = 
        err.code?.includes('api-key') || 
        err.code?.includes('operation-not-allowed') || 
        err.code?.includes('configuration-not-found') ||
        err.code?.includes('invalid-api-key') ||
        err.message?.includes('API key') ||
        err.message?.includes('configuration') ||
        err.message?.includes('operation-not-allowed') ||
        err.message?.includes('disabled');

      if (isConfigError) {
        const sandboxUser = { uid: `sandbox-${Date.now()}`, email, displayName: name, photoURL: null };
        setPendingUser(sandboxUser);
        setStep('workspace');
      } else {
        setErrorMsg(err.message || 'Signup failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: any) => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      setPendingUser(result.user);
      setStep('workspace');
    } catch (err: any) {
      console.error('OAuth signup error:', err);
      // Sandbox fallback
      const isConfigError = 
        err.code?.includes('api-key') || 
        err.code?.includes('operation-not-allowed') || 
        err.code?.includes('configuration-not-found') ||
        err.code?.includes('invalid-api-key') ||
        err.message?.includes('API key') ||
        err.message?.includes('configuration') ||
        err.message?.includes('operation-not-allowed') ||
        err.message?.includes('disabled');

      if (isConfigError) {
        const sandboxUser = { uid: `sandbox-${Date.now()}`, email: 'sandbox@apex.workspace', displayName: 'New Member', photoURL: null };
        setPendingUser(sandboxUser);
        setStep('workspace');
      } else {
        setErrorMsg(err.message || 'OAuth failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceConfirm = () => {
    if (!mode) return;
    if (mode === 'create-team' && !teamName.trim()) { setErrorMsg('Enter a team name.'); return; }
    if (mode === 'join-team' && !inviteCode.trim()) { setErrorMsg('Enter an invite code.'); return; }
    completeSignup(pendingUser, mode);
  };

  const fadeSlide = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative bg-[#050505]">
      {/* Background Orbs */}
      <div className="absolute top-[15%] right-[15%] w-[35%] h-[35%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[15%] left-[15%] w-[35%] h-[35%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-[2.5rem] shadow-2xl relative z-10">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step === 'account' ? 'bg-indigo-500' : 'bg-indigo-500'}`} />
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step === 'workspace' ? 'bg-indigo-500' : 'bg-white/10'}`} />
        </div>

        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Account Creation ─── */}
          {step === 'account' && (
            <motion.div key="account" {...fadeSlide} transition={{ duration: 0.25 }}>
              <div className="flex flex-col items-center text-center mb-8">
                <img src="/icon-192.png" alt="Apex" className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-indigo-500/20 mb-4" />
                <h2 className="text-3xl font-extrabold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                  Create your account
                </h2>
                <p className="text-xs text-neutral-500 mt-1 font-semibold">
                  Step 1 of 2 · Account details
                </p>
              </div>

              {/* Sandbox notice */}
              <div className="mb-6 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <p className="text-[10px] text-indigo-300/80 font-bold">
                  Sandbox mode enabled — works instantly, even without Firebase keys.
                </p>
              </div>

              <form onSubmit={handleEmailSignup} className="space-y-4">
                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-all font-medium" required />
                </div>
                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-all font-medium" required />
                </div>
                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input type="password" placeholder="Create a password (8+ chars)" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-all font-medium" required minLength={8} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button type="button" disabled={loading}
                  onClick={() => {
                    const sandboxUser = { uid: `sandbox-${Date.now()}`, email: email || 'guest@apex.workspace', displayName: name || 'Apex Member', photoURL: null };
                    setPendingUser(sandboxUser);
                    setStep('workspace');
                  }}
                  className="w-full bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 text-neutral-300 font-extrabold py-3.5 rounded-2xl transition-all border border-white/5 hover:border-indigo-500/30 flex items-center justify-center gap-2 text-sm shadow-md">
                  <Sparkles className="w-4.5 h-4.5" /> Bypass with Sandbox Mode (Demo)
                </button>
              </form>

              <div className="flex items-center my-5">
                <div className="flex-1 h-[1px] bg-white/5" />
                <span className="text-[10px] font-bold text-neutral-500 uppercase px-3">OR</span>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleOAuth(googleProvider)} disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-semibold text-neutral-200 transition-all active:scale-95">
                  <Chrome className="w-4 h-4 text-red-400" /> Google
                </button>
                <button onClick={() => handleOAuth(githubProvider)} disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-semibold text-neutral-200 transition-all active:scale-95">
                  <Github className="w-4 h-4" /> GitHub
                </button>
              </div>

              <p className="text-center text-xs text-neutral-500 font-semibold mt-6">
                Already have an account?{' '}
                <button onClick={() => router.push('/login')} className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">
                  Sign in
                </button>
              </p>
            </motion.div>
          )}

          {/* ─── STEP 2: Workspace Setup ─── */}
          {step === 'workspace' && (
            <motion.div key="workspace" {...fadeSlide} transition={{ duration: 0.25 }}>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                  How will you use Apex?
                </h2>
                <p className="text-xs text-neutral-500 mt-1 font-semibold">
                  Step 2 of 2 · Workspace type
                </p>
              </div>

              {/* Mode Selection Cards */}
              <div className="space-y-3 mb-6">
                {/* Personal */}
                <button onClick={() => setMode('personal')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 ${mode === 'personal' ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${mode === 'personal' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-neutral-400'}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white">Personal workspace</p>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">Manage your own tasks and projects. No team required.</p>
                  </div>
                  {mode === 'personal' && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                </button>

                {/* Create Team */}
                <button onClick={() => setMode('create-team')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 ${mode === 'create-team' ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${mode === 'create-team' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-neutral-400'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white">Create a team workspace</p>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">Set up a shared space and invite collaborators.</p>
                  </div>
                  {mode === 'create-team' && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                </button>

                {/* Join Team */}
                <button onClick={() => setMode('join-team')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 ${mode === 'join-team' ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${mode === 'join-team' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-neutral-400'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white">Join an existing team</p>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">Enter an invite code to join your team's workspace.</p>
                  </div>
                  {mode === 'join-team' && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                </button>
              </div>

              {/* Conditional extra inputs */}
              <AnimatePresence>
                {mode === 'create-team' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input type="text" placeholder="Team name (e.g. Acme Design Co.)" value={teamName} onChange={e => setTeamName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-all font-medium" />
                    </div>
                  </motion.div>
                )}
                {mode === 'join-team' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input type="text" placeholder="Team invite code (e.g. APEX-1234)" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-all font-medium uppercase tracking-widest" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                <button onClick={() => setStep('account')}
                  className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={handleWorkspaceConfirm} disabled={!mode || loading}
                  className="flex-1 bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm">
                  Launch Workspace
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Snackbar open={!!errorMsg} autoHideDuration={5000} onClose={() => setErrorMsg(null)}>
        <Alert severity="error" className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl">
          {errorMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}
