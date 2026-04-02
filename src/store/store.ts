import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import studentReducer from "./slices/studentSlice";
import courseReducer from "./slices/courseSlice";
import feesReducer from "./slices/feesSlice";
import batchReducer from "./slices/batchSlice";
import dashboardReducer from "./slices/dashboardSlice";
import uiReducer from "./slices/uiSlice";
import installmentReducer from "./slices/installmentSlice";
import rollNumberReducer from "./slices/rollNumberSlice";
import studentAlertReducer from "./slices/studentAlertSlice";
import courseCompletionReducer from "./slices/courseCompletionSlice";
import rbacReducer from "./slices/rbacSlice";
import batchCategoryReducer from "./slices/batchCategorySlice";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    courses: courseReducer,
    fees: feesReducer,
    batches: batchReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
    installments: installmentReducer,
    rollNumbers: rollNumberReducer,
    studentAlerts: studentAlertReducer,
    courseCompletions: courseCompletionReducer,
    rbac: rbacReducer,
    batchCategories: batchCategoryReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
