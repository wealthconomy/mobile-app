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
          const rawStatus = (plan.status || "").toUpperCase();
          const nextStatus =
            rawStatus === "TERMINATED"
              ? "TERMINATED"
              : rawStatus === "WITHDRAWN"
              ? "WITHDRAWN"
              : rawStatus === "CLOSED"
              ? "CLOSED"
              : "COMPLETED";

          const existing = state.completedMap[plan.id];
          const resolvedType = plan.type || existing?.type;
          const resolvedBalance = plan.balance || "0";

          if (
            !existing ||
            existing.status !== nextStatus ||
            existing.balance !== resolvedBalance ||
            (resolvedType && existing.type !== resolvedType)
          ) {
            state.completedMap[plan.id] = {
              ...existing,
              ...plan,
              type: resolvedType || "",
              balance: resolvedBalance,
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
        const rawStatus = (plan.status || "").toUpperCase();
        const nextStatus =
          rawStatus === "TERMINATED"
            ? "TERMINATED"
            : rawStatus === "WITHDRAWN"
            ? "WITHDRAWN"
            : rawStatus === "CLOSED"
            ? "CLOSED"
            : "COMPLETED";

        const existing = state.completedMap[plan.id];
        const resolvedType = plan.type || existing?.type;
        const resolvedBalance = plan.balance || "0";

        if (
          existing &&
          existing.status === nextStatus &&
          existing.balance === resolvedBalance &&
          existing.name === plan.name &&
          (!resolvedType || existing.type === resolvedType)
        ) {
          return;
        }
        state.completedMap[plan.id] = {
          ...existing,
          ...plan,
          type: resolvedType || "",
          balance: resolvedBalance,
          status: nextStatus,
        };
        persistCompletedMap(state.completedMap);
      }
    },
    removeCompletedPortfolio: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (id && state.completedMap[id]) {
        delete state.completedMap[id];
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

export const {
  saveCompletedPortfolios,
  saveSingleCompletedPortfolio,
  removeCompletedPortfolio,
} = completedPortfolioSlice.actions;

export default completedPortfolioSlice.reducer;

