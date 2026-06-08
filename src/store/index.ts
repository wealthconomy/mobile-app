import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import paymentReducer from "./slices/paymentSlice";
import wealthGroupReducer from "./slices/wealthGroupSlice";
import portfolioPreferenceReducer from "./slices/portfolioPreferenceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    payment: paymentReducer,
    wealthGroup: wealthGroupReducer,
    portfolioPreference: portfolioPreferenceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
