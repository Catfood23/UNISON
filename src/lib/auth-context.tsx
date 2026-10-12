import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/lib/demo-types";
import {
  getSession,
  listUsers,
  loginUser,
  saveUsers,
  saveSession,
  signupUser,
  SESSION_TTL,
} from "@/lib/demo-store";

type AuthContextValue = {
  user: User | null;
  role: User["role"] | null;
  loading: boolean;
  login: (email: string, password: string) => User;
  signup: (input: { name: string; email: string; neighborhood: string; password: string }) => User;
  logout: () => void;
  updateProfile: (changes: { name?: string; neighborhood?: string; password?: string }) => void;
  refreshUser: () => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = useCallback(() => {
    const session = getSession();
    setUser(
      session
        ? (listUsers().find((item) => item.id === session.userId && item.active) ?? null)
        : null,
    );
    setLoading(false);
  }, []);
  useEffect(() => {
    refreshUser();
    window.addEventListener("unison-demo-changed", refreshUser);
    return () => window.removeEventListener("unison-demo-changed", refreshUser);
  }, [refreshUser]);
  const sessionUserId = user?.id;
  useEffect(() => {
    if (!sessionUserId) return;
    const session = getSession();
    if (!session) {
      setUser(null);
      return;
    }
    const timeout = window.setTimeout(
      () => {
        saveSession(null);
        setUser(null);
      },
      Math.max(0, session.expiresAt - Date.now()),
    );
    return () => window.clearTimeout(timeout);
  }, [sessionUserId]);
  const login = useCallback((email: string, password: string) => {
    const next = loginUser(email, password);
    if (!saveSession({ userId: next.id, expiresAt: Date.now() + SESSION_TTL }))
      throw new Error("Browser storage is unavailable. Enable site storage and try again.");
    setUser(next);
    return next;
  }, []);
  const signup = useCallback(
    (input: { name: string; email: string; neighborhood: string; password: string }) => {
      const next = signupUser(input);
      if (!saveSession({ userId: next.id, expiresAt: Date.now() + SESSION_TTL }))
        throw new Error("Browser storage is unavailable. Enable site storage and try again.");
      setUser(next);
      return next;
    },
    [],
  );
  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
  }, []);
  const updateProfile = useCallback(
    (changes: { name?: string; neighborhood?: string; password?: string }) => {
      if (!user) throw new Error("Sign in to update your profile.");
      const updated = { ...user, ...changes };
      const users = listUsers().map((item) => (item.id === user.id ? updated : item));
      if (!saveUsers(users)) {
        throw new Error("Browser storage is unavailable. Your changes were not saved.");
      }
      setUser(updated);
      window.dispatchEvent(new Event("unison-demo-changed"));
    },
    [user],
  );
  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      login,
      signup,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, loading, login, signup, logout, updateProfile, refreshUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
