import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Portfolio } from "@/src/types/portfolio";

const STORAGE_KEY = "@wealthconomy_completed_portfolios_map";

interface CompletedPortfolioState {
  completedMap: Record<string, Portfolio>;
  isHydrated: boolean;
}

const initialState: CompletedPortfolioState = {
  completedMap: {},
  isHydrated: false,
};

export const hydrateCompletedPortfolios = createAsyncThunk(
  "completedPortfolio/hydrateCompletedPortfolios",
  async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const map: Record<string, Portfolio> = JSON.parse(stored);
        if (map && typeof map === "object") {
          return map;
        }
      }
    } catch (err) {
      console.error("Failed to hydrate completed portfolios:", err);
    }
    return {};
  }
);

const persistCompletedMap = (map: Record<string, Portfolio>) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map)).catch((err) =>
    console.error("Failed to persist completed portfolios to AsyncStorage:", err)
  );
};

const completedPortfolioSlice = createSlice({
  name: "completedPortfolio",
  initialState,
  reducers: {
    saveCompletedPortfolios: (state, action: PayloadAction<Portfolio[]>) => {
      let changed = false;
      action.payload.forEach((plan) => {
        if (plan && plan.id) {
          const nextStatus = plan.status === "TERMINATED" ? "TERMINATED" : "COMPLETED";
          const existing = state.completedMap[plan.id];
          if (
            !existing ||
            existing.status !== nextStatus ||
            existing.balance !== (plan.balance || "0")
          ) {
            state.completedMap[plan.id] = {
              ...plan,
              balance: plan.balance || "0",
              status: nextStatus,
            };
            changed = true;
          }
        }
      });
      if (changed) {
        persistCompletedMap(state.completedMap);
      }
    },
    saveSingleCompletedPortfolio: (state, action: PayloadAction<Portfolio>) => {
      const plan = action.payload;
      if (plan && plan.id) {
        const nextStatus = plan.status === "TERMINATED" ? "TERMINATED" : "COMPLETED";
        const existing = state.completedMap[plan.id];
        if (
          existing &&
          existing.status === nextStatus &&
          existing.balance === (plan.balance || "0") &&
          existing.name === plan.name
        ) {
          return;
        }
        state.completedMap[plan.id] = {
          ...plan,
          balance: plan.balance || "0",
          status: nextStatus,
        };
        persistCompletedMap(state.completedMap);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateCompletedPortfolios.fulfilled, (state, action) => {
      if (action.payload) {
        state.completedMap = {
          ...action.payload,
          ...state.completedMap,
        };
      }
      state.isHydrated = true;
    });
  },
});

export const { saveCompletedPortfolios, saveSingleCompletedPortfolio } =
  completedPortfolioSlice.actions;

export default completedPortfolioSlice.reducer;

