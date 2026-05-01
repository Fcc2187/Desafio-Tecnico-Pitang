import api from './api';
import type { Perfil } from '../contexts/AuthContext';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    perfil: Perfil;
  };
}

export const login = async (email: string, senha: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { email, senha });
  return response.data;
};

export const register = async (nome: string, email: string, senha: string, perfil: Perfil) => {
  const response = await api.post('/auth/register', { nome, email, senha, perfil });
  return response.data;
};
