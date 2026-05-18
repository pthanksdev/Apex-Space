import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForBuildProcessDoNotUseThis",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:dummy",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Initialize Analytics conditionally (only runs in browser and if measurementId exists)
export let analytics: any = null;
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// ─── User Profile Helpers ────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  workspaceMode: 'personal' | 'team';
  teamId: string | null;
  teamName: string | null;
  createdAt: any;
  lastSeen: any;
}

/** Write/merge user profile to /users/{uid} on every login */
export async function saveUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    ...data,
    lastSeen: serverTimestamp(),
  }, { merge: true });
}

/** Fetch a single user profile by UID */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Search users by email (for team invite) */
export async function searchUsersByEmail(email: string): Promise<UserProfile[]> {
  const q = query(
    collection(db, 'users'),
    where('email', '>=', email),
    where('email', '<=', email + '\uf8ff')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as UserProfile);
}

// ─── Presence Helpers ────────────────────────────────────────────────────────

/** Set a user's online presence */
export async function setPresenceOnline(uid: string, displayName: string | null, photoURL: string | null, teamId: string | null) {
  await setDoc(doc(db, 'presence', uid), {
    uid, displayName, photoURL, teamId,
    status: 'online',
    lastSeen: serverTimestamp(),
  }, { merge: true });
}

/** Set a user's presence to offline */
export async function setPresenceOffline(uid: string) {
  await setDoc(doc(db, 'presence', uid), {
    status: 'offline',
    lastSeen: serverTimestamp(),
  }, { merge: true });
}

// ─── Activity Log Helpers ─────────────────────────────────────────────────────

/** Log a team activity event */
export async function logActivity(user: string, action: string, ownerUid: string, teamId: string | null) {
  await addDoc(collection(db, 'activity'), {
    user,
    action,
    ownerUid,
    teamId,
    timestamp: serverTimestamp(),
  });
}

export default app;
