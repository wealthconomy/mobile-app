import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadAuthFromStorage } from './authSlice';

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
  extraReducers: (builder) => {
    builder.addCase(loadAuthFromStorage.fulfilled, (state, action) => {
      const payload = action.payload;
      const isAuth = Boolean(payload?.token && (payload?.isAuthenticated ?? true));
      const hasOnboarding = Boolean(payload?.hasCompletedOnboarding);
      const hasPasscode = Boolean(payload?.user?.hasAppPasscode);
      if (isAuth && hasOnboarding && hasPasscode) {
        state.isInactivityLocked = true;
      }
    });
    builder.addMatcher(
      (action) => action.type === 'auth/logout',
      (state) => {
        state.isInactivityLocked = false;
      }
    );
  },
});

export const {
  setLockout,
  clearLockout,
  lockAppForInactivity,
  unlockAppFromInactivity,
} = appStatusSlice.actions;

let lockSuspended = false;

export const suspendAppLock = (suspend: boolean) => {
  lockSuspended = suspend;
};

export const isAppLockSuspended = () => lockSuspended;

export default appStatusSlice.reducer;
