import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import type { AuthUser, Role } from '../../types';

interface AuthState {
  user: AuthUser | null;   // null = nobody logged in
  loading: boolean;        // true while a login/register request is in flight
  error: string | null;    // last error message to show the user
}

// When the app starts, try to restore the user we saved last time.
const savedUser = localStorage.getItem('user');
const initialState: AuthState = {
  user: savedUser ? (JSON.parse(savedUser) as AuthUser) : null,
  loading: false,
  error: null,
};

// A small helper to pull a readable message out of an axios error.
function getErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as { response?: { data?: { message?: string } } };
  return anyErr.response?.data?.message ?? fallback;
}

// --- LOGIN ---
// Calls POST /auth/login. On success the backend returns the token + user info.
export const login = createAsyncThunk(
  'auth/login',
  async (
    payload: { email: string; password: string; rememberMe: boolean },
    thunkApi
  ) => {
    try {
      const res = await api.post('/auth/login', payload);
      return res.data as AuthUser;
    } catch (err) {
      return thunkApi.rejectWithValue(getErrorMessage(err, 'Login failed'));
    }
  }
);

// --- REGISTER ---
// Calls POST /auth/register. Returns the success message on success.
export const register = createAsyncThunk(
  'auth/register',
  async (
    payload: {
      fullName: string;
      email: string;
      password: string;
      role: Role;
      department: string;
      designation: string;
    },
    thunkApi
  ) => {
    try {
      const res = await api.post('/auth/register', payload);
      return res.data as { message: string };
    } catch (err) {
      // Model-validation errors come back in a different shape; handle both.
      const anyErr = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const errors = anyErr.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0]?.[0] : undefined;
      return thunkApi.rejectWithValue(
        anyErr.response?.data?.message ?? firstError ?? 'Registration failed'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Log out: forget the user everywhere.
    logout(state) {
      state.user = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  // extraReducers react to the async thunks above (pending/fulfilled/rejected).
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // Persist so a refresh keeps us logged in.
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
