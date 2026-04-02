import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface FeesState {
  fees: any[];
  paymentOptions: any[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: FeesState = {
  fees: [],
  paymentOptions: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
};


export const fetchFees = createAsyncThunk("fees/fetchAll", async (params: { page?: number } = {}, { rejectWithValue }) => {
  try {
    const query = params.page ? `?page=${params.page}` : "";
    const { data } = await api.get(`/api/course-fees${query}`);
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

export const fetchStudentFees = createAsyncThunk("fees/fetchStudentFees", async (studentId: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/api/course-fees/student/${studentId}`);
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

export const createFeePayment = createAsyncThunk("fees/create", async (feeData: any, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/api/course-fees", feeData);
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

export const fetchPaymentOptions = createAsyncThunk("fees/fetchPaymentOptions", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/api/payment-options");
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

const feesSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    clearFeesError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFees.pending, (state) => { state.loading = true; })
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.loading = false;
        state.fees = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFees.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchStudentFees.fulfilled, (state, action) => { state.fees = action.payload; })
      .addCase(createFeePayment.fulfilled, (state, action) => { state.fees.unshift(action.payload); })
      .addCase(fetchPaymentOptions.fulfilled, (state, action) => { state.paymentOptions = action.payload; });
  },
});

export const { clearFeesError } = feesSlice.actions;
export default feesSlice.reducer;
