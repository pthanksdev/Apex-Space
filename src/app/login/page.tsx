"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/store/userSlice';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { RootState } from '@/store/store';
import { 
  FolderGit2, 
  Mail, 
  Lock, 
  Chrome, 
  Github, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Alert, Snackbar } from '@mui/material';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/board');
    }
  }, [isAuthenticated, router]);

  const handleFirebaseLogin = (userCreds: any) => {
    const serializedUser = {
      uid: userCreds.uid,
      email: userCreds.email,
      displayName: userCreds.displayName || 'Active Member',
      photoURL: userCreds.photoURL || null,
    };
    dispatch(setUser(serializedUser));
    router.push('/board');
  };

  const handleOAuth = async (provider: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, provider);
      handleFirebaseLogin(result.user);
    } catch (err: any) {
      console.error('OAuth error:', err);
      // Fallback sandbox mode for all configuration/provider issues
      const isConfigError = 
        err.code?.includes('api-key') || 
        err.code?.includes('operation-not-allowed') || 
        err.code?.includes('configuration-not-found') ||
        err.code?.includes('invalid-api-key') ||
        err.message?.includes('API key') ||
        err.message?.includes('configuration') ||
        err.message?.includes('operation-not-allowed') ||
        err.message?.includes('disabled') ||
        err.message?.includes('authDomain') ||
        err.message?.includes('appId');

      if (isConfigError) {
        // Trigger a premium fallback sandbox experience!
        const sandboxUser = {
          uid: 'sandbox-user-123',
          email: 'sandbox@apex.workspace',
          displayName: 'Paul Thanksgiving',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        };
        dispatch(setUser(sandboxUser));
        router.push('/board');
      } else {
        setErrorMsg(err.message || 'OAuth Connection Failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleFirebaseLogin(result.user);
    } catch (err: any) {
      console.error('Auth error:', err);
      // Fallback sandbox mode
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
        const sandboxUser = {
          uid: 'sandbox-user-123',
          email: email,
          displayName: email.split('@')[0],
          photoURL: null,
        };
        dispatch(setUser(sandboxUser));
        router.push('/board');
      } else {
        setErrorMsg(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      {/* Visual Accents */}
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-[2.5rem] shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/icon-192.png" alt="Apex" className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-indigo-500/20 mb-4" />
          <h2 className="text-3xl font-extrabold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Welcome to Apex
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-semibold uppercase tracking-wider">
            Workspace Access Portal
          </p>
        </div>

        {/* Sandbox Notice Banner */}
        <div className="mb-6 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <p className="text-[10px] text-indigo-300/80 font-bold leading-normal">
            Sandbox mode enabled! If Firebase is not configured, login falls back automatically to a demo environment.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="email" 
              placeholder="Workspace Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="password" 
              placeholder="Security Key (Password)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button 
            type="button"
            disabled={loading}
            onClick={() => {
              const sandboxUser = {
                uid: 'sandbox-user-123',
                email: 'guest@apex.workspace',
                displayName: 'Apex Guest Member',
                photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
              };
              dispatch(setUser(sandboxUser));
              router.push('/board');
            }}
            className="w-full py-3.5 bg-white/5 hover:bg-indigo-500/10 text-neutral-300 hover:text-indigo-400 font-extrabold rounded-2xl transition-all border border-white/5 hover:border-indigo-500/30 flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Sparkles className="w-4.5 h-4.5" />
            Enter Sandbox Workspace (Demo)
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-white/5" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase px-4">OR USE OAUTH</span>
          <div className="flex-1 h-[1px] bg-white/5" />
        </div>

        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleOAuth(googleProvider)}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-semibold text-neutral-200 transition-all duration-300 active:scale-95"
          >
            <Chrome className="w-4 h-4 text-red-400" />
            Google
          </button>
          
          <button 
            onClick={() => handleOAuth(githubProvider)}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-semibold text-neutral-200 transition-all duration-300 active:scale-95"
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
        </div>

        <p className="text-center text-xs text-neutral-500 font-semibold mt-5">
          Don&apos;t have an account?{' '}
          <button onClick={() => router.push('/signup')} className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">
            Sign up free
          </button>
        </p>
      </div>

      <Snackbar 
        open={!!errorMsg} 
        autoHideDuration={6000} 
        onClose={() => setErrorMsg(null)}
      >
        <Alert severity="error" className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl">
          {errorMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}
