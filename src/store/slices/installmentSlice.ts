import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface InstallmentState {
  installments: any[];
  overdueInstallments: any[];
  studentInstallments: any[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: InstallmentState = {
  installments: [],
  overdueInstallments: [],
  studentInstallments: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
};

export const fetchInstallments = createAsyncThunk(
  "installments/fetchAll",
  async (params: { page?: number; studentId?: string; courseId?: string; isPaid?: string; isOverdue?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page.toString());
      if (params.studentId) query.set("studentId", params.studentId);
      if (params.courseId) query.set("courseId", params.courseId);
      if (params.isPaid) query.set("isPaid", params.isPaid);
      if (params.isOverdue) query.set("isOverdue", params.isOverdue);
      const { data } = await api.get(`/api/installments?${query}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch installments");
    }
  }
);

export const fetchOverdueInstallments = createAsyncThunk(
  "installments/fetchOverdue",
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page.toString());
      const { data } = await api.get(`/api/installments/overdue?${query}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch overdue installments");
    }
  }
);

export const fetchStudentInstallments = createAsyncThunk(
  "installments/fetchByStudent",
  async (studentId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/installments/student/${studentId}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch student installments");
    }
  }
);

export const createInstallment = createAsyncThunk(
  "installments/create",
  async (installmentData: any, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/installments", installmentData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create installment");
    }
  }
);

export const markInstallmentPaid = createAsyncThunk(
  "installments/markPaid",
  async ({ id, paidDate }: { id: string; paidDate?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/installments/${id}/mark-paid`, { paidDate });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to mark installment as paid");
    }
  }
);

export const calculateLateFees = createAsyncThunk(
  "installments/calculateLateFees",
  async (params: { lateFeePerDay: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/installments/calculate-late-fees", params);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to calculate late fees");
    }
  }
);

export const deleteInstallment = createAsyncThunk(
  "installments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/installments/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete installment");
    }
  }
);

const installmentSlice = createSlice({
  name: "installments",
  initialState,
  reducers: {
    clearInstallmentError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstallments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInstallments.fulfilled, (state, action) => {
        state.loading = false;
        state.installments = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchInstallments.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchOverdueInstallments.pending, (state) => { state.loading = true; })
      .addCase(fetchOverdueInstallments.fulfilled, (state, action) => {
        state.loading = false;
        state.overdueInstallments = action.payload.data;
      })
      .addCase(fetchOverdueInstallments.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchStudentInstallments.fulfilled, (state, action) => { state.studentInstallments = action.payload; })
      .addCase(createInstallment.fulfilled, (state, action) => { state.installments.unshift(action.payload); state.total++; })
      .addCase(markInstallmentPaid.fulfilled, (state, action) => {
        const idx = state.installments.findIndex((i) => i._id === action.payload._id);
        if (idx >= 0) state.installments[idx] = action.payload;
      })
      .addCase(deleteInstallment.fulfilled, (state, action) => {
        state.installments = state.installments.filter((i) => i._id !== action.payload);
        state.total--;
      });
  },
});

export const { clearInstallmentError } = installmentSlice.actions;
export default installmentSlice.reducer;
