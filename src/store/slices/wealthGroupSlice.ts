import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "@wealth_groups";

export interface WealthGroup {
  id: string;
  name: string;
  category: string;
  coverImage: string | null;
  description: string;
  amount: string;
  frequency: string;
  hasInterest: boolean;
  startDate: string;
  endDate: string;
  memberLimit: string;
  accessType: string;
  penalty: string;
  earlyExit: string;
  exitRule: boolean;
  emergencyWithdrawal: boolean;
  membersCount: number;
  currentSavings: string;
  growthToday: string;
  isAdmin: boolean;
  isMember: boolean;
}

interface WealthGroupState {
  groups: WealthGroup[];
}

const initialState: WealthGroupState = {
  groups: [
    {
      id: "1",
      name: "Wealthy People Savings",
      category: "Business",
      coverImage: null,
      description:
        "A group for high-achievers to save together for big business goals.",
      amount: "5,000,000",
      frequency: "Weekly",
      hasInterest: true,
      startDate: "2/12/2023",
      endDate: "2/12/2026",
      memberLimit: "200",
      accessType: "Public/Open",
      penalty: "Immediate (5%)",
      earlyExit: "Fixed Penalty (10%)",
      exitRule: true,
      emergencyWithdrawal: true,
      membersCount: 50,
      currentSavings: "56,632.42",
      growthToday: "230.00",
      isAdmin: false,
      isMember: false,
    },
    {
      id: "2",
      name: "Rent Savers 2026",
      category: "Personal",
      coverImage: null,
      description: "Saving up for our next big apartment relocation.",
      amount: "2,000,000",
      frequency: "Monthly",
      hasInterest: false,
      startDate: "1/01/2024",
      endDate: "1/01/2026",
      memberLimit: "10",
      accessType: "Private/Invite-Only",
      penalty: "Grace period (24h)",
      earlyExit: "No Withdrawal",
      exitRule: true,
      emergencyWithdrawal: false,
      membersCount: 3,
      currentSavings: "1,200,000.00",
      growthToday: "0.00",
      isAdmin: false,
      isMember: false,
    },
  ],
};

export const saveGroupsToStorage = async (groups: WealthGroup[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error("Error saving groups to storage:", error);
  }
};

export const loadGroupsFromStorage = createAsyncThunk(
  "wealthGroup/loadGroups",
  async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as WealthGroup[];
      }
    } catch (error) {
      console.error("Error loading groups from storage:", error);
    }
    return null;
  },
);

const wealthGroupSlice = createSlice({
  name: "wealthGroup",
  initialState,
  reducers: {
    addGroup: (state, action: PayloadAction<WealthGroup>) => {
      state.groups.unshift(action.payload);
      saveGroupsToStorage(state.groups);
    },
    joinGroup: (state, action: PayloadAction<string>) => {
      const group = state.groups.find((g) => g.id === action.payload);
      if (group) {
        group.isMember = true;
        group.membersCount += 1;
        saveGroupsToStorage(state.groups);
      }
    },
    hydrateGroups: (state, action: PayloadAction<WealthGroup[]>) => {
      state.groups = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadGroupsFromStorage.fulfilled, (state, action) => {
      if (action.payload) {
        // Merge stored groups with initial state (avoiding duplicates if possible)
        // But for simplicity, we'll just replace or merge.
        // The user wants created groups to persist.
        const storedIds = new Set(action.payload.map((g) => g.id));
        const initialFiltered = initialState.groups.filter(
          (g) => !storedIds.has(g.id),
        );
        state.groups = [...action.payload, ...initialFiltered];
      }
    });
  },
});

export const { addGroup, joinGroup, hydrateGroups } = wealthGroupSlice.actions;
export default wealthGroupSlice.reducer;
