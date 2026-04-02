import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface StudentAlertState {
  alerts: any[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: StudentAlertState = {
  alerts: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
};

export const fetchStudentAlerts = createAsyncThunk(
  "studentAlerts/fetchAll",
  async (params: { page?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page.toString());
      if (params.status) query.set("status", params.status);
      const { data } = await api.get(`/api/student-alerts?${query}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch student alerts");
    }
  }
);

export const createStudentAlert = createAsyncThunk(
  "studentAlerts/create",
  async (alertData: any, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/student-alerts", alertData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create student alert");
    }
  }
);

export const updateStudentAlert = createAsyncThunk(
  "studentAlerts/update",
  async ({ id, data: alertData }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/student-alerts/${id}`, alertData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update student alert");
    }
  }
);

export const deleteStudentAlert = createAsyncThunk(
  "studentAlerts/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/student-alerts/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete student alert");
    }
  }
);

const studentAlertSlice = createSlice({
  name: "studentAlerts",
  initialState,
  reducers: {
    clearAlertError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentAlerts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStudentAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchStudentAlerts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createStudentAlert.fulfilled, (state, action) => { state.alerts.unshift(action.payload); state.total++; })
      .addCase(updateStudentAlert.fulfilled, (state, action) => {
        const idx = state.alerts.findIndex((a) => a._id === action.payload._id);
        if (idx >= 0) state.alerts[idx] = action.payload;
      })
      .addCase(deleteStudentAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter((a) => a._id !== action.payload);
        state.total--;
      });
  },
});

export const { clearAlertError } = studentAlertSlice.actions;
export default studentAlertSlice.reducer;
