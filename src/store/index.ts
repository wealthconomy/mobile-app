import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";
import paymentReducer from "./slices/paymentSlice";
import wealthGroupReducer from "./slices/wealthGroupSlice";
import portfolioPreferenceReducer from "./slices/portfolioPreferenceSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    payment: paymentReducer,
    wealthGroup: wealthGroupReducer,
    portfolioPreference: portfolioPreferenceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});

setupListeners(store.dispatch);


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
