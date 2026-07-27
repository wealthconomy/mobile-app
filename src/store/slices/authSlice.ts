import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "@wealth_auth";

interface AuthState {
  user: any | null;
  token: string | null; // accessToken
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // Start true so startup rehydration completes before layout redirects
  hasCompletedOnboarding: false,
};

const saveAuthToStorage = async (state: AuthState) => {
  try {
    const dataToSave = {
      user: state.user,
      token: state.token,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
      hasCompletedOnboarding: state.hasCompletedOnboarding,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error("Error saving auth to storage:", error);
  }
};

export const loadAuthFromStorage = createAsyncThunk(
  "auth/loadFromStorage",
  async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading auth from storage:", error);
    }
    return null;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; token: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      state.isLoading = false;
      saveAuthToStorage(state);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
      saveAuthToStorage(state);
    },
    updateKycLevel: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.kycLevel = action.payload;
        saveAuthToStorage(state);
      }
    },
    resetKycLevel: (state) => {
      if (state.user) {
        state.user.kycLevel = 1;
        saveAuthToStorage(state);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadAuthFromStorage.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loadAuthFromStorage.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        if (action.payload.user) state.user = action.payload.user;
        if (action.payload.token) {
          state.token = action.payload.token;
          state.isAuthenticated = Boolean(action.payload.isAuthenticated ?? true);
        }
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
        if (typeof action.payload.hasCompletedOnboarding === "boolean") {
          state.hasCompletedOnboarding = action.payload.hasCompletedOnboarding;
        }
      }
    });
    builder.addCase(loadAuthFromStorage.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
  completeOnboarding,
  updateKycLevel,
  resetKycLevel,
} = authSlice.actions;
export default authSlice.reducer;
