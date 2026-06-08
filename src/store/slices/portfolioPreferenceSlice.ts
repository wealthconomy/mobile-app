import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PortfolioType = "flex" | "fix" | "goal" | "fam" | "flow" | "group";
export type WealthPreference = "Interest Based" | "Impact Wealth" | "Mixed";

type PortfolioPreferenceState = {
  [key in PortfolioType]: WealthPreference;
};

const initialState: PortfolioPreferenceState = {
  flex: "Interest Based",
  fix: "Interest Based",
  goal: "Interest Based",
  fam: "Interest Based",
  flow: "Interest Based",
  group: "Interest Based",
};

const portfolioPreferenceSlice = createSlice({
  name: "portfolioPreference",
  initialState,
  reducers: {
    setPortfolioPreference: (
      state,
      action: PayloadAction<{ type: PortfolioType; value: WealthPreference }>
    ) => {
      state[action.payload.type] = action.payload.value;
    },
  },
});

export const { setPortfolioPreference } = portfolioPreferenceSlice.actions;
export default portfolioPreferenceSlice.reducer;
