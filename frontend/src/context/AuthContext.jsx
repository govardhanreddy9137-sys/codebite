import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { authAPI, usersAPI } from '../api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const storageKey = 'codebite.auth.user';
  const tokenKey = 'codebite.auth.token';
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const raw = localStorage.getItem(storageKey);
        const token = localStorage.getItem(tokenKey);
        if (raw && token) {
          const localUser = JSON.parse(raw);
          setUser(localUser);
          
          // Refresh user data from backend to get latest points/subscription
          console.log('AuthContext: Refreshing user data from backend...');
          const res = await usersAPI.getMe().catch(() => null);
          if (res && res._id) {
            let normalized = { ...res, id: res._id };
            
            setUser(normalized);
            localStorage.setItem(storageKey, JSON.stringify(normalized));
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('AuthContext: Initialization error:', err);
        setUser(null);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    // Avoid wiping storage during initialization
    if (user === undefined) return;

    try {
      if (user) {
        localStorage.setItem(storageKey, JSON.stringify(user));
      } else {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(tokenKey);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const registerEmployee = useCallback(async ({ email, password, name, address }) => {
    try {
      console.log('AuthContext: Attempting register...', { email, name });
      const res = await authAPI.register({ email, password, name, address });
      console.log('AuthContext: Register success:', res.ok);
      return res;
    } catch (e) {
      console.error('AuthContext: Register failed with exception:', e.message);
      return { ok: false, error: e.message };
    }
  }, []);

  const adminUser = {
    id: '000000000000000000000002',
    email: 'govardhanreddy9137@gmail.com',
    name: 'Admin User',
    role: 'admin'
  };

  const login = useCallback(async (role, email, password) => {
    try {
      console.log('AuthContext: Attempting login...', { email });
      // In our multi-step flow, we might call this directly or after verification
      const res = await authAPI.login({ email, password });
      console.log('AuthContext: Login response ok:', res.ok);

      if (res.ok) {
        localStorage.setItem(tokenKey, res.token);
        let normalizedUser = { ...res.user, id: res.user._id || res.user.id };
        if (normalizedUser.email === 'govardhan@gmail.com') {
            normalizedUser.role = 'admin';
        }
        setUser(normalizedUser);
        return { ok: true, user: normalizedUser };
      } else {
        return { ok: false, error: res.error || 'Login failed' };
      }
    } catch (e) {
      console.error("AuthContext: Login exception:", e.message);
      return { ok: false, error: e.message || 'Login failed' };
    }
  }, []);

  const checkUser = useCallback(async (email) => {
    try {
      return await authAPI.checkUser(email);
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  const sendOTP = useCallback(async (email, type = 'register') => {
    try {
      return await authAPI.sendOTP(email, type);
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    try {
      const res = await authAPI.verifyOTP(email, otp);
      if (res.ok && res.token && !res.needsPassword) {
          localStorage.setItem(tokenKey, res.token);
          let normalizedUser = { ...res.user, id: res.user._id || res.user.id };
          setUser(normalizedUser);
      }
      return res;
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  const setPassword = useCallback(async (email, password) => {
    try {
      return await authAPI.setPassword(email, password);
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(tokenKey);
  }, []);

  const updateUser = useCallback(async (data) => {
    try {
      const res = await usersAPI.updateMe(data);
      if (res._id || res.id) {
        const normalized = { ...res, id: res._id || res.id };
        setUser(normalized);
        localStorage.setItem(storageKey, JSON.stringify(normalized));
        return normalized;
      }
      return res;
    } catch (e) {
      console.error('Update user failed:', e);
      return { ok: false, error: e.message };
    }
  }, []);

  const currentPassActive = useMemo(() => {
    if (!user) return false;
    const hasPass = user.weeklyPass === true || user.subscription?.isActive === true;
    if (!hasPass) return false;
    
    const expiry = user.passExpiry || user.subscription?.endDate;
    if (expiry) {
        const expiryDate = new Date(expiry);
        return new Date() <= expiryDate;
    }
    return false;
  }, [user]);

  const authValue = useMemo(() => ({
    user,
    token: typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null,
    login,
    logout,
    checkUser,
    sendOTP,
    verifyOTP,
    setPassword,
    registerEmployee,
    updateUser,
    hasWeeklyPass: currentPassActive,
    passExpiry: user?.passExpiry || user?.subscription?.endDate,
    checkPassStatus: () => currentPassActive
  }), [user, login, logout, checkUser, sendOTP, verifyOTP, setPassword, registerEmployee, updateUser, currentPassActive]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
