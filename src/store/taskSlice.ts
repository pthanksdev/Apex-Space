import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  dueDate: string | null;
  assignedTo: string[]; // List of user display names or emails
  subtasks?: { id: string; text: string; completed: boolean }[];
  timeSpent: number; // in minutes
  ownerUid: string;
  teamId: string | null;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }[];
  createdAt: any;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface Presence {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  status: 'online' | 'offline';
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  presence: Presence[];
  activities: Activity[];
}

const initialState: TaskState = {
  tasks: [],
  loading: true,
  presence: [],
  activities: [],
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPresence: (state, action: PayloadAction<Presence[]>) => {
      state.presence = action.payload;
    },
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload;
    },
    addLocalActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload);
      if (state.activities.length > 50) {
        state.activities.pop();
      }
    }
  }
});

export const { setTasks, setLoading, setPresence, setActivities, addLocalActivity } = taskSlice.actions;
export default taskSlice.reducer;
