import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface StudentState {
  students: any[];
  selectedStudent: any | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: StudentState = {
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
};


export const fetchStudents = createAsyncThunk(
  "students/fetchAll",
  async (params: { page?: number; search?: string; courseId?: string; dropOut?: string; feeStatus?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page.toString());
      if (params.search) query.set("search", params.search);
      if (params.courseId) query.set("courseId", params.courseId);
      if (params.dropOut) query.set("dropOut", params.dropOut);
      if (params.feeStatus) query.set("feeStatus", params.feeStatus);

      const { data } = await api.get(`/api/students?${query}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch students");
    }
  }
);

export const fetchStudent = createAsyncThunk(
  "students/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/students/${id}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch student");
    }
  }
);

export const createStudent = createAsyncThunk(
  "students/create",
  async (studentData: any, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/students", studentData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create student");
    }
  }
);

export const updateStudent = createAsyncThunk(
  "students/update",
  async ({ id, data: studentData }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/students/${id}`, studentData);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update student");
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/students/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete student");
    }
  }
);

const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    clearSelectedStudent(state) {
      state.selectedStudent = null;
    },
    clearStudentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchStudents.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchStudent.pending, (state) => { state.loading = true; })
      .addCase(fetchStudent.fulfilled, (state, action) => { state.loading = false; state.selectedStudent = action.payload; })
      .addCase(fetchStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createStudent.fulfilled, (state, action) => { state.students.unshift(action.payload); state.total++; })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const idx = state.students.findIndex((s) => s._id === action.payload._id);
        if (idx >= 0) state.students[idx] = action.payload;
        state.selectedStudent = action.payload;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter((s) => s._id !== action.payload);
        state.total--;
      });
  },
});

export const { clearSelectedStudent, clearStudentError } = studentSlice.actions;
export default studentSlice.reducer;
