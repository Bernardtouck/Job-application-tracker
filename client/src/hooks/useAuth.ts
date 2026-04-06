import { useState, useCallback } from "react";
import { setToken, removeToken, isAuthenticated } from "../services/auth";

export const useAuth = () => {
  // Re-evaluate on every render so expiry is always fresh
  const [isAuth, setIsAuth] = useState<boolean>(isAuthenticated);

  const login = useCallback((token: string) => {
    setToken(token);
    setIsAuth(true);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setIsAuth(false);
  }, []);

  return { isAuth, login, logout };
};