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
      const kyc2Done = await AsyncStorage.getItem("@wealth_kyc_level_2_completed");
      const storedPasscodeFlag = await AsyncStorage.getItem("@wealth_has_app_passcode");
      const storedPasscode = await AsyncStorage.getItem("@wealth_app_passcode");
      const storedBio = await AsyncStorage.getItem("@wealth_biometrics_enabled");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (kyc2Done === "true" && parsed.user) {
          parsed.user.kycLevel = Math.max(parsed.user.kycLevel || 1, 2);
        }
        if (
          parsed.user &&
          (parsed.user.hasAppPasscode ||
            storedPasscodeFlag === "true" ||
            Boolean(storedPasscode && storedPasscode.length === 6))
        ) {
          parsed.user.hasAppPasscode = true;
        }
        if (parsed.user && storedBio !== null) {
          parsed.user.biometricsEnabled = storedBio === "true";
        }
        return parsed;
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
      const u = action.payload.user ? { ...action.payload.user } : null;
      if (u && !u.firstName && u.name) {
        const parts = String(u.name).trim().split(" ");
        u.firstName = parts[0];
        u.lastName = parts.slice(1).join(" ");
      }
      // Preserve existing security onboarding flags if backend /user/me does not return them
      if (state.user?.hasAppPasscode && u && u.hasAppPasscode === undefined) {
        u.hasAppPasscode = true;
      }
      if (state.user?.hasTransactionPin && u && u.hasTransactionPin === undefined) {
        u.hasTransactionPin = true;
      }
      if (state.user?.biometricsEnabled !== undefined && u && u.biometricsEnabled === undefined) {
        u.biometricsEnabled = state.user.biometricsEnabled;
      }
      // Preserve verified KYC level if local state is already Level 2 or higher
      if (state.user?.kycLevel && state.user.kycLevel >= 2 && u && (!u.kycLevel || u.kycLevel < 2)) {
        u.kycLevel = state.user.kycLevel;
      }
      state.user = u;
      if (state.user?.kycStatus === "VERIFIED" || state.user?.kycVerified) {
        state.user.kycRejectionReason = null;
        state.user.rejectionReason = null;
      }
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      state.isLoading = false;
      saveAuthToStorage(state);
    },
    logout: (state) => {
      const userId = state.user?.id;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      AsyncStorage.removeItem("@wealth_has_app_passcode").catch(() => {});
      AsyncStorage.removeItem("@wealth_app_passcode").catch(() => {});
      AsyncStorage.removeItem("@wealth_kyc_level_2_completed").catch(() => {});
      AsyncStorage.removeItem("@wealth_biometrics_enabled").catch(() => {});
      if (userId) {
        AsyncStorage.removeItem(`@wealth_waitlist_joined_${userId}`).catch(() => {});
        AsyncStorage.removeItem(`@wealth_waitlist_pos_${userId}`).catch(() => {});
      }
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
        const current = state.user.kycLevel || 1;
        state.user.kycLevel = Math.max(current, action.payload);
        saveAuthToStorage(state);
      }
      if (action.payload >= 2) {
        AsyncStorage.setItem("@wealth_kyc_level_2_completed", "true").catch(() => {});
      }
    },
    updateKycStatus: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.kycStatus = action.payload;
        if (action.payload === "VERIFIED") {
          state.user.kycVerified = true;
          state.user.kycRejectionReason = null;
          state.user.rejectionReason = null;
        } else if (action.payload === "REJECTED") {
          state.user.kycVerified = false;
        }
        saveAuthToStorage(state);
      }
    },
    updateKycInfo: (
      state,
      action: PayloadAction<{ level?: number; status?: string; rejectionReason?: string | null }>
    ) => {
      if (state.user) {
        if (action.payload.level !== undefined) {
          state.user.kycLevel = action.payload.level;
        }
        if (action.payload.status !== undefined) {
          state.user.kycStatus = action.payload.status;
          if (action.payload.status === "VERIFIED") {
            state.user.kycVerified = true;
            state.user.kycRejectionReason = null;
            state.user.rejectionReason = null;
          } else if (action.payload.status === "REJECTED") {
            state.user.kycVerified = false;
          }
        }
        if (action.payload.rejectionReason !== undefined) {
          state.user.kycRejectionReason = action.payload.rejectionReason || null;
          state.user.rejectionReason = action.payload.rejectionReason || null;
        }
        saveAuthToStorage(state);
      }
    },
    resetKycLevel: (state) => {
      if (state.user) {
        state.user.kycLevel = 1;
        saveAuthToStorage(state);
      }
      AsyncStorage.removeItem("@wealth_kyc_level_2_completed").catch(() => {});
    },
    setHasTransactionPin: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.hasTransactionPin = action.payload;
        saveAuthToStorage(state);
      }
      AsyncStorage.setItem("@wealth_has_transaction_pin", action.payload ? "true" : "false").catch(() => {});
    },
    setHasAppPasscode: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.hasAppPasscode = action.payload;
        saveAuthToStorage(state);
      }
      AsyncStorage.setItem("@wealth_has_app_passcode", action.payload ? "true" : "false").catch(() => {});
    },
    setBiometricsEnabled: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.biometricsEnabled = action.payload;
        saveAuthToStorage(state);
      }
      AsyncStorage.setItem("@wealth_biometrics_enabled", action.payload ? "true" : "false").catch(() => {});
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadAuthFromStorage.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loadAuthFromStorage.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        if (action.payload.user) {
          state.user = action.payload.user;
          // Clear any stale rejection reason if user is already verified
          if (state.user?.kycStatus === "VERIFIED" || state.user?.kycVerified) {
            state.user.kycRejectionReason = null;
            state.user.rejectionReason = null;
          }
        }
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
  updateKycStatus,
  updateKycInfo,
  resetKycLevel,
  setHasTransactionPin,
  setHasAppPasscode,
  setBiometricsEnabled,
} = authSlice.actions;
export default authSlice.reducer;
