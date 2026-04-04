// src/hooks/useAuth.ts

import { useState } from "react";
import {
  setToken,
  removeToken,
  isAuthenticated,
} from "../services/auth";

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean>(isAuthenticated());

  // login
  const login = (token: string) => {
    setToken(token);
    setIsAuth(true);
  };

  // logout
  const logout = () => {
    removeToken();
    setIsAuth(false);
  };

  return {
    isAuth,
    login,
    logout,
  };
};