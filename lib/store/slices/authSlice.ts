import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { User } from "@/generated/prisma";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // Start as loading to check for existing session
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isLoading = false;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.isLoading = false;
    },
  },
});

// Export actions
export const { setUser, setLoading, logout } = authSlice.actions;

export const selectUser = (state: RootState): User | null => state.auth.user;

export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.user !== null;

export const selectIsLoading = (state: RootState): boolean =>
  state.auth.isLoading;

export default authSlice.reducer;
