import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import type { IUser } from "@/types";

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  otpEmail: string | null;
  initialized: boolean;
}

function loadPersistedAuth(): { token: string | null; user: IUser | null } {
  if (typeof window === "undefined") return { token: null, user: null };
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  let user: IUser | null = null;
  try {
    const saved = localStorage.getItem("user");
    if (saved) user = JSON.parse(saved);
  } catch {}
  return { token, user };
}

const persisted = loadPersistedAuth();

const initialState: AuthState = {
  user: persisted.user,
  token: persisted.token,
  // If we have both token and user from storage, consider authenticated immediately
  isAuthenticated: !!(persisted.token && persisted.user),
  loading: false,
  error: null,
  otpSent: false,
  otpEmail: null,
  initialized: !!(persisted.token && persisted.user),
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/login", credentials);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/verify-otp", payload);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "OTP verification failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/register", payload);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Registration failed");
    }
  }
);

function persistAuth(token: string, user: any, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  document.cookie = `accessToken=${token}; path=/; max-age=${15 * 60}`;
  document.cookie = `token=${token}; path=/; max-age=${15 * 60}`;
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
}

function clearPersistedAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.cookie = "accessToken=; path=/; max-age=0";
  document.cookie = "token=; path=/; max-age=0";
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.initialized = true;
      state.otpSent = false;
      state.otpEmail = null;
      clearPersistedAuth();
    },
    setCredentials(state, action: PayloadAction<{ user: IUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.initialized = true;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.skipOtp) {
          const token = action.payload.accessToken || action.payload.token;
          const user = {
            _id: action.payload.user._id,
            fName: action.payload.user.fName,
            lName: action.payload.user.lName,
            email: action.payload.user.email,
            phone: action.payload.user.phone,
            role: action.payload.user.role,
            tenantId: action.payload.user.tenantId,
            isActive: true,
            createdAt: "",
            updatedAt: "",
          };
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
          state.initialized = true;
          state.otpSent = false;
          state.otpEmail = null;
          persistAuth(token, user, action.payload.refreshToken);
        } else {
          state.otpSent = true;
          state.otpEmail = action.payload.email;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        const token = action.payload.accessToken || action.payload.token;
        const user = action.payload.user;
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        state.initialized = true;
        state.otpSent = false;
        state.otpEmail = null;
        persistAuth(token, user, action.payload.refreshToken);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
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

export const { logout, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
