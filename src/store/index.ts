import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import paymentReducer from "./slices/paymentSlice";
import wealthGroupReducer from "./slices/wealthGroupSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    payment: paymentReducer,
    wealthGroup: wealthGroupReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
