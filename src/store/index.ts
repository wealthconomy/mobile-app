import { configureStore, Middleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api/baseApi";
import authReducer, { logout, setCredentials, loadAuthFromStorage } from "./slices/authSlice";
import paymentReducer from "./slices/paymentSlice";
import wealthGroupReducer from "./slices/wealthGroupSlice";
import portfolioPreferenceReducer from "./slices/portfolioPreferenceSlice";
import bookmarkReducer from "./slices/bookmarkSlice";
import appStatusReducer from "./slices/appStatusSlice";
import completedPortfolioReducer from "./slices/completedPortfolioSlice";

let lastStoredUserId: string | number | null = null;

export const authResetListenerMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  // 1. On logout, immediately purge all cached API data
  if (action?.type === logout.type) {
    lastStoredUserId = null;
    storeApi.dispatch(baseApi.util.resetApiState());
    return next(action);
  }

  // 2. On setCredentials, check if the login stores a different user id from the one previously stored
  if (action?.type === setCredentials.type) {
    const nextUser = action.payload?.user;
    const nextUserId = nextUser?.id ?? nextUser?._id ?? null;
    const currentState = storeApi.getState();
    const prevUserId = currentState?.auth?.user?.id ?? currentState?.auth?.user?._id ?? lastStoredUserId;

    if (prevUserId && nextUserId && String(prevUserId) !== String(nextUserId)) {
      storeApi.dispatch(baseApi.util.resetApiState());
    }

    if (nextUserId) {
      lastStoredUserId = nextUserId;
    }
  }

  // 3. Keep lastStoredUserId synced when session rehydrates from storage
  if (action?.type === loadAuthFromStorage.fulfilled.type) {
    const loadedUserId = action.payload?.user?.id ?? action.payload?.user?._id ?? null;
    if (loadedUserId) {
      lastStoredUserId = loadedUserId;
    }
  }

  return next(action);
};

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    payment: paymentReducer,
    wealthGroup: wealthGroupReducer,
    portfolioPreference: portfolioPreferenceReducer,
    bookmark: bookmarkReducer,
    appStatus: appStatusReducer,
    completedPortfolio: completedPortfolioReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    })
      .concat(authResetListenerMiddleware)
      .concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Convenience helper to ensure both API cache and auth state are reset.
 * Callers can use this or dispatch(logout()) directly (which authResetListenerMiddleware intercepts).
 */
export const logoutAndReset = () => (dispatch: AppDispatch) => {
  dispatch(baseApi.util.resetApiState());
  dispatch(logout());
};
