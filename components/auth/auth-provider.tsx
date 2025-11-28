"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import type { User } from "@/lib/types";
import { api } from "@/lib/api-client";

interface LoginCredentials {
	email: string;
	password: string;
}

interface AuthContextType {
	user: User | null;
	login: (credentials: LoginCredentials) => Promise<void>;
	logout: () => Promise<void>;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Validate session on mount by calling /api/auth/me
		validateSession();
	}, []);

	const validateSession = async () => {
		try {
			const currentUser = await api.get<User>("/api/auth/me");
			console.log("CURRENT USER: ", JSON.stringify(currentUser, null, 2));
			setUser(currentUser);
		} catch (error) {
			// If session is invalid or expired, clear user state
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (credentials: LoginCredentials) => {
		try {
			// Call login API endpoint
			const response = await api.post<{ user: User; message: string }>(
				"/api/auth/login",
				credentials,
			);
			// JWT is automatically stored in HTTP-only cookie by the server
			setUser(response.user);
		} catch (error) {
			// Re-throw error to be handled by the login form
			throw error;
		}
	};

	const logout = async () => {
		try {
			// Call logout API endpoint to invalidate session
			await api.post("/api/auth/logout");
		} catch (error) {
			// Even if logout fails, clear local state
			console.error("Logout error:", error);
		} finally {
			// Clear user state regardless of API call result
			setUser(null);
		}
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
