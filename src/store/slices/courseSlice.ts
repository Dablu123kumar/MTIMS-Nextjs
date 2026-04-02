import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

interface CourseState {
  courses: any[];
  categories: any[];
  courseTypes: any[];
  numberOfYears: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  categories: [],
  courseTypes: [],
  numberOfYears: [],
  loading: false,
  error: null,
};


export const fetchCourses = createAsyncThunk("courses/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/api/courses");
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

export const fetchCategories = createAsyncThunk("courses/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/api/categories");
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

export const fetchCourseTypes = createAsyncThunk("courses/fetchCourseTypes", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/api/course-types");
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

export const createCourse = createAsyncThunk("courses/create", async (courseData: any, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/api/courses", courseData);
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

export const deleteCourse = createAsyncThunk("courses/delete", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/api/courses/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed");
  }
});

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearCourseError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => { state.loading = true; })
      .addCase(fetchCourses.fulfilled, (state, action) => { state.loading = false; state.courses = action.payload; })
      .addCase(fetchCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; })
      .addCase(fetchCourseTypes.fulfilled, (state, action) => { state.courseTypes = action.payload; })
      .addCase(createCourse.fulfilled, (state, action) => { state.courses.unshift(action.payload); })
      .addCase(deleteCourse.fulfilled, (state, action) => { state.courses = state.courses.filter((c) => c._id !== action.payload); });
  },
});

export const { clearCourseError } = courseSlice.actions;
export default courseSlice.reducer;
