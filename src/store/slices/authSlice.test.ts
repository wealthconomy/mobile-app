import authReducer, {
  setCredentials,
  logout,
  setLoading,
  completeOnboarding,
  updateKycLevel,
} from "./authSlice";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("authSlice reducer", () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    hasCompletedOnboarding: false,
  };

  it("should handle initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setCredentials and store tokens & profile", () => {
    const payload = {
      user: { id: "user-1", email: "jane@example.com", firstName: "Jane" },
      token: "access-token-xyz",
      refreshToken: "refresh-token-abc",
    };

    const nextState = authReducer(initialState, setCredentials(payload));

    expect(nextState.user).toEqual(payload.user);
    expect(nextState.token).toBe("access-token-xyz");
    expect(nextState.refreshToken).toBe("refresh-token-abc");
    expect(nextState.isAuthenticated).toBe(true);
  });

  it("should handle logout by clearing session data", () => {
    const loggedInState = {
      user: { id: "123", email: "test@example.com" },
      token: "token-123",
      refreshToken: "refresh-123",
      isAuthenticated: true,
      isLoading: false,
      hasCompletedOnboarding: true,
    };

    const nextState = authReducer(loggedInState, logout());

    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
    expect(nextState.refreshToken).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
    // onboarding completion should remain intact across logout
    expect(nextState.hasCompletedOnboarding).toBe(true);
  });

  it("should handle setLoading", () => {
    const nextState = authReducer(initialState, setLoading(true));
    expect(nextState.isLoading).toBe(true);
  });

  it("should handle completeOnboarding", () => {
    const nextState = authReducer(initialState, completeOnboarding());
    expect(nextState.hasCompletedOnboarding).toBe(true);
  });

  it("should update user kycLevel when user exists", () => {
    const stateWithUser = {
      ...initialState,
      user: { id: "123", kycLevel: 1 },
      isAuthenticated: true,
    };

    const nextState = authReducer(stateWithUser, updateKycLevel(3));
    expect(nextState.user.kycLevel).toBe(3);
  });
});
