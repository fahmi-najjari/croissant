"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, logout, signin, signup, type AuthResponse, type User } from "@/lib/api";
import type { Locale } from "@/i18n/config";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    preferred_language: Locale;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const tokenKey = "23-en-voie-token";
const userKey = "23-en-voie-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((session: AuthResponse) => {
    setToken(session.token);
    setUser(session.user);
    window.localStorage.setItem(tokenKey, session.token);
    window.localStorage.setItem(userKey, JSON.stringify(session.user));
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(tokenKey);
    window.localStorage.removeItem(userKey);
  }, []);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(tokenKey);
    const savedUser = window.localStorage.getItem(userKey);

    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    if (savedUser) {
      setUser(JSON.parse(savedUser) as User);
    }

    getMe(savedToken)
      .then((freshUser) => {
        setUser(freshUser);
        window.localStorage.setItem(userKey, JSON.stringify(freshUser));
      })
      .catch(clearSession)
      .finally(() => setIsLoading(false));
  }, [clearSession]);

  const signIn = useCallback(
    async (payload: { email: string; password: string }) => {
      applySession(await signin(payload));
    },
    [applySession],
  );

  const signUp = useCallback(
    async (payload: {
      email: string;
      password: string;
      first_name?: string;
      last_name?: string;
      phone_number?: string;
      preferred_language: Locale;
    }) => {
      applySession(await signup(payload));
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    const currentToken = token;
    clearSession();
    if (currentToken) {
      await logout(currentToken).catch(() => undefined);
    }
  }, [clearSession, token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [isLoading, signIn, signOut, signUp, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
