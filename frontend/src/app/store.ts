import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

// The Redux store = the single source of shared state for the app.
// Right now it only holds "auth" (the logged-in user). We could add
// more slices here later (e.g. tasks) if we wanted.
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// These two types describe the store so TypeScript can help us.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
