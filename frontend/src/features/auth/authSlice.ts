import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import type { AuthUser, Role } from '../../types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const savedUser = localStorage.getItem('user');
const initialState: AuthState = {
  user: savedUser ? (JSON.parse(savedUser) as AuthUser) : null,
  loading: false,
  error: null,
};

function getErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as { response?: { data?: { message?: string } } };
  return anyErr.response?.data?.message ?? fallback;
}

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
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
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
