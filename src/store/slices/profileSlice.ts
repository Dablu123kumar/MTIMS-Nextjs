import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface ProfileState {
  profile: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/profile");
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch profile");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/update",
  async (profileData: any, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/api/profile", profileData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update profile");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.profile = action.payload; });
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
