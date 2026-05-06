import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import React from 'react';

describe('AuthContext (useAuth Hook)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('deve iniciar com estado deslogado', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('deve realizar login e salvar no localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const mockUser = { id: '1', nome: 'Test', email: 'test@test.com', perfil: 'COLABORADOR' as const };
    const mockToken = 'fake-token';

    act(() => {
      result.current.login(mockToken, mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(localStorage.getItem('@PitangReimburse:token')).toBe(mockToken);
  });

  it('deve realizar logout e limpar o localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('token', { id: '1', nome: 'T', email: 'e', perfil: 'COLABORADOR' });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('@PitangReimburse:token')).toBeNull();
  });
});
