import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface RbacState {
  rolePermissions: any[];
  loading: boolean;
  error: string | null;
}

const initialState: RbacState = {
  rolePermissions: [],
  loading: false,
  error: null,
};

export const fetchRbacPermissions = createAsyncThunk(
  "rbac/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/rbac");
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch permissions");
    }
  }
);

export const createRbacPermission = createAsyncThunk(
  "rbac/create",
  async (rbacData: { role: string; permissions: Record<string, boolean> }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/rbac", rbacData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create role permissions");
    }
  }
);

export const updateRbacPermission = createAsyncThunk(
  "rbac/update",
  async ({ id, data: rbacData }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/rbac/${id}`, rbacData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update role permissions");
    }
  }
);

export const deleteRbacPermission = createAsyncThunk(
  "rbac/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/rbac/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete role permissions");
    }
  }
);

const rbacSlice = createSlice({
  name: "rbac",
  initialState,
  reducers: {
    clearRbacError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRbacPermissions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRbacPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.rolePermissions = action.payload;
      })
      .addCase(fetchRbacPermissions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createRbacPermission.fulfilled, (state, action) => { state.rolePermissions.push(action.payload); })
      .addCase(updateRbacPermission.fulfilled, (state, action) => {
        const idx = state.rolePermissions.findIndex((r) => r._id === action.payload._id);
        if (idx >= 0) state.rolePermissions[idx] = action.payload;
      })
      .addCase(deleteRbacPermission.fulfilled, (state, action) => {
        state.rolePermissions = state.rolePermissions.filter((r) => r._id !== action.payload);
      });
  },
});

export const { clearRbacError } = rbacSlice.actions;
export default rbacSlice.reducer;
