import React, { createContext, useContext, useState } from "react";

type AuthState = { user: any; token: string } | null;

const AuthContext = createContext<{
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
}>({ auth: null, setAuth: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(null);
  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);