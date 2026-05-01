import React, { createContext, useContext, useState, useEffect } from 'react';

export type Perfil = 'ADMIN' | 'GESTOR' | 'FINANCEIRO' | 'COLABORADOR';

interface User {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@PitangReimburse:token');
    const storedUser = localStorage.getItem('@PitangReimburse:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    localStorage.setItem('@PitangReimburse:token', newToken);
    localStorage.setItem('@PitangReimburse:user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('@PitangReimburse:token');
    localStorage.removeItem('@PitangReimburse:user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
