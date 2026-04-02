import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface BatchCategoryState {
  categories: any[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: BatchCategoryState = {
  categories: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
};

export const fetchBatchCategories = createAsyncThunk(
  "batchCategories/fetchAll",
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page.toString());
      const { data } = await api.get(`/api/batch-categories?${query}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch batch categories");
    }
  }
);

export const createBatchCategory = createAsyncThunk(
  "batchCategories/create",
  async (categoryData: { categoryName: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/batch-categories", categoryData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create batch category");
    }
  }
);

export const updateBatchCategory = createAsyncThunk(
  "batchCategories/update",
  async ({ id, data: categoryData }: { id: string; data: { categoryName: string } }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/batch-categories/${id}`, categoryData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update batch category");
    }
  }
);

export const deleteBatchCategory = createAsyncThunk(
  "batchCategories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/batch-categories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete batch category");
    }
  }
);

const batchCategorySlice = createSlice({
  name: "batchCategories",
  initialState,
  reducers: {
    clearBatchCategoryError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatchCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBatchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchBatchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createBatchCategory.fulfilled, (state, action) => { state.categories.unshift(action.payload); state.total++; })
      .addCase(updateBatchCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex((c) => c._id === action.payload._id);
        if (idx >= 0) state.categories[idx] = action.payload;
      })
      .addCase(deleteBatchCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c._id !== action.payload);
        state.total--;
      });
  },
});

export const { clearBatchCategoryError } = batchCategorySlice.actions;
export default batchCategorySlice.reducer;
