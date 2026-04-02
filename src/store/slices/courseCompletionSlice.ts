import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface CourseCompletionState {
  completions: any[];
  studentCompletions: any[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: CourseCompletionState = {
  completions: [],
  studentCompletions: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
};

export const fetchCourseCompletions = createAsyncThunk(
  "courseCompletions/fetchAll",
  async (params: { page?: number; studentId?: string; courseId?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page.toString());
      if (params.studentId) query.set("studentId", params.studentId);
      if (params.courseId) query.set("courseId", params.courseId);
      if (params.status) query.set("status", params.status);
      const { data } = await api.get(`/api/course-completions?${query}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch completions");
    }
  }
);

export const fetchStudentCompletions = createAsyncThunk(
  "courseCompletions/fetchByStudent",
  async (studentId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/course-completions/student/${studentId}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch student completions");
    }
  }
);

export const createCourseCompletion = createAsyncThunk(
  "courseCompletions/create",
  async (completionData: any, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/course-completions", completionData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create completion");
    }
  }
);

export const updateCourseCompletion = createAsyncThunk(
  "courseCompletions/update",
  async ({ id, data: completionData }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/course-completions/${id}`, completionData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update completion");
    }
  }
);

export const deleteCourseCompletion = createAsyncThunk(
  "courseCompletions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/course-completions/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete completion");
    }
  }
);

const courseCompletionSlice = createSlice({
  name: "courseCompletions",
  initialState,
  reducers: {
    clearCompletionError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseCompletions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCourseCompletions.fulfilled, (state, action) => {
        state.loading = false;
        state.completions = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCourseCompletions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchStudentCompletions.fulfilled, (state, action) => { state.studentCompletions = action.payload; })
      .addCase(createCourseCompletion.fulfilled, (state, action) => { state.completions.unshift(action.payload); state.total++; })
      .addCase(updateCourseCompletion.fulfilled, (state, action) => {
        const idx = state.completions.findIndex((c) => c._id === action.payload._id);
        if (idx >= 0) state.completions[idx] = action.payload;
      })
      .addCase(deleteCourseCompletion.fulfilled, (state, action) => {
        state.completions = state.completions.filter((c) => c._id !== action.payload);
        state.total--;
      });
  },
});

export const { clearCompletionError } = courseCompletionSlice.actions;
export default courseCompletionSlice.reducer;
