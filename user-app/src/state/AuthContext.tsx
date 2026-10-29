import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCOUNT_KEY, TOKEN_KEY, setAccessToken } from '../api/client';
import { authApi, userApi } from '../api/endpoints';
import type { User } from '../types';

type AuthValue = {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (identityToken: string) => Promise<void>;
  loginWithApple: (identityToken: string, nonce: string, name?: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; city?: string; phone?: string }) => Promise<void>;
  updateProfile: (input: { name?: string; city?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem(TOKEN_KEY), AsyncStorage.getItem(ACCOUNT_KEY)])
      .then(async ([token, account]) => {
        if (!active) return;
        if (token && account) {
          try { setUser(JSON.parse(account) as User); setAccessToken(token); return; } catch { /* invalid local cache */ }
        }
        await AsyncStorage.multiRemove([TOKEN_KEY, ACCOUNT_KEY]);
      })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function persist(account: User, token: string) {
    await AsyncStorage.multiSet([[TOKEN_KEY, token], [ACCOUNT_KEY, JSON.stringify(account)]]);
    setAccessToken(token);
    setUser(account);
  }
  const value = useMemo<AuthValue>(() => ({
    user, loading,
    login: async (email, password) => { const response = await authApi.login(email, password); await persist(response.data.data.account, response.data.data.token); },
    loginWithGoogle: async (identityToken) => { const response = await authApi.google(identityToken); await persist(response.data.data.account, response.data.data.token); },
    loginWithApple: async (identityToken, nonce, name) => { const response = await authApi.apple(identityToken, nonce, name); await persist(response.data.data.account, response.data.data.token); },
    register: async (input) => { const response = await authApi.register(input); await persist(response.data.data.account, response.data.data.token); },
    updateProfile: async (input) => { const response = await userApi.update(input); await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(response.data.data)); setUser(response.data.data); },
    logout: async () => { await AsyncStorage.multiRemove([TOKEN_KEY, ACCOUNT_KEY]); setAccessToken(null); setUser(null); },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requires AuthProvider');
  return context;
}
