import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    workspaceMode?: 'personal' | 'team';
    teamId?: string | null;
  } | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState['user']>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    }
  }
});

export const { setUser, setLoading, clearUser } = userSlice.actions;
export default userSlice.reducer;
