import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface RollNumberState {
  config: { _id: string; prefix: string; currentValue: number } | null;
  loading: boolean;
  error: string | null;
}

const initialState: RollNumberState = {
  config: null,
  loading: false,
  error: null,
};

export const fetchRollNumberConfig = createAsyncThunk(
  "rollNumbers/fetchConfig",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/roll-numbers");
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch roll number config");
    }
  }
);

export const updateRollNumberConfig = createAsyncThunk(
  "rollNumbers/updateConfig",
  async (configData: { prefix?: string; currentValue?: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/api/roll-numbers", configData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update roll number config");
    }
  }
);

export const getNextRollNumber = createAsyncThunk(
  "rollNumbers/getNext",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/roll-numbers/next");
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to get next roll number");
    }
  }
);

const rollNumberSlice = createSlice({
  name: "rollNumbers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRollNumberConfig.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRollNumberConfig.fulfilled, (state, action) => { state.loading = false; state.config = action.payload; })
      .addCase(fetchRollNumberConfig.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateRollNumberConfig.fulfilled, (state, action) => { state.config = action.payload; });
  },
});

export default rollNumberSlice.reducer;
