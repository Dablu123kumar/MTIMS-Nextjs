import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface BatchState {
  batches: any[];
  selectedBatch: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: BatchState = {
  batches: [],
  selectedBatch: null,
  loading: false,
  error: null,
};


export const fetchBatches = createAsyncThunk("batches/fetchAll", async (status?: string, { rejectWithValue }: any = {}) => {
  try {
    const query = status ? `?status=${status}` : "";
    const { data } = await api.get(`/api/batches${query}`);
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

export const fetchBatch = createAsyncThunk("batches/fetchOne", async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/api/batches/${id}`);
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

export const createBatch = createAsyncThunk("batches/create", async (batchData: any, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/api/batches", batchData);
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

const batchSlice = createSlice({
  name: "batches",
  initialState,
  reducers: {
    clearBatchError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatches.pending, (state) => { state.loading = true; })
      .addCase(fetchBatches.fulfilled, (state, action) => { state.loading = false; state.batches = action.payload; })
      .addCase(fetchBatches.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchBatch.fulfilled, (state, action) => { state.selectedBatch = action.payload; })
      .addCase(createBatch.fulfilled, (state, action) => { state.batches.unshift(action.payload); });
  },
});

export const { clearBatchError } = batchSlice.actions;
export default batchSlice.reducer;
