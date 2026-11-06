import { useSelector } from "react-redux";
import type { RootState } from "../store";

/**
 * Returns true only when a valid token exists and the user is authenticated.
 * Subscribes to primitive booleans to avoid re-rendering on other auth slice changes.
 */
export const useIsAuthenticated = (): boolean => {
  return useSelector(
    (state: RootState) => Boolean(state.auth.token && state.auth.isAuthenticated)
  );
};
