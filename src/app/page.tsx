"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser, setLoading } from '@/store/userSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RootRedirect() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((s: RootState) => s.user);

  useEffect(() => {
    let resolved = false;

    // Timeout fallback — if Firebase doesn't respond in 3s, go to landing
    const timeout = setTimeout(() => {
      if (!resolved) {
        dispatch(setLoading(false));
        router.push('/landing');
      }
    }, 3000);

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          resolved = true;
          clearTimeout(timeout);
          if (user) {
            dispatch(setUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            }));
            router.push('/board');
          } else {
            dispatch(setLoading(false));
            router.push('/landing');
          }
        },
        () => {
          // Firebase error (e.g. invalid API key) — go to landing
          resolved = true;
          clearTimeout(timeout);
          dispatch(setLoading(false));
          router.push('/landing');
        }
      );
      return () => { clearTimeout(timeout); unsubscribe(); };
    } catch {
      clearTimeout(timeout);
      dispatch(setLoading(false));
      router.push('/landing');
    }
  }, [dispatch, router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-neutral-400 tracking-wide">Loading Apex...</p>
      </div>
    </div>
  );
}
