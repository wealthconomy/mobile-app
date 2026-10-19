import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LockoutType = 'MAINTENANCE' | 'SUSPENDED' | 'BLOCKED' | null;

interface AppStatusState {
  isLocked: boolean;
  lockoutType: LockoutType;
  title: string;
  message: string;
  isInactivityLocked: boolean;
}

const initialState: AppStatusState = {
  isLocked: false,
  lockoutType: null,
  title: '',
  message: '',
  isInactivityLocked: false,
};

const appStatusSlice = createSlice({
  name: 'appStatus',
  initialState,
  reducers: {
    setLockout: (
      state,
      action: PayloadAction<{ type: LockoutType; title?: string; message: string }>
    ) => {
      state.isLocked = true;
      state.lockoutType = action.payload.type;
      state.message = action.payload.message;

      if (action.payload.title) {
        state.title = action.payload.title;
      } else {
        switch (action.payload.type) {
          case 'MAINTENANCE':
            state.title = 'System Under Maintenance';
            break;
          case 'SUSPENDED':
            state.title = 'Account Suspended';
            break;
          case 'BLOCKED':
            state.title = 'Account Blocked';
            break;
          default:
            state.title = 'Access Restricted';
        }
      }
    },
    clearLockout: (state) => {
      state.isLocked = false;
      state.lockoutType = null;
      state.title = '';
      state.message = '';
    },
    lockAppForInactivity: (state) => {
      state.isInactivityLocked = true;
    },
    unlockAppFromInactivity: (state) => {
      state.isInactivityLocked = false;
    },
  },
});

export const {
  setLockout,
  clearLockout,
  lockAppForInactivity,
  unlockAppFromInactivity,
} = appStatusSlice.actions;
export default appStatusSlice.reducer;
