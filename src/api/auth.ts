/**
 * Mock Authentication API
 * Simulates network requests for login and signup.
 */

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(1500); // Simulate network lag

    // Mock successful login
    return {
      user: {
        id: "1",
        email,
        name: email.split("@")[0],
      },
      token: "mock-jwt-token",
    };
  },

  signup: async (
    email: string,
    password: string,
    name: string,
  ): Promise<AuthResponse> => {
    await delay(1500);

    return {
      user: {
        id: "2",
        email,
        name,
      },
      token: "mock-jwt-token-new",
    };
  },
};
