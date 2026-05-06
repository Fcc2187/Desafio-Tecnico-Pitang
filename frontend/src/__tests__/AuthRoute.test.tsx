import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthRoute } from '../components/shared/AuthRoute';
import * as AuthContext from '../contexts/AuthContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from '../components/ui/provider';

describe('AuthRoute', () => {
  const renderAuthRoute = (perfil: any, token: string | null, allowedRoles?: any) => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: perfil ? { id: '1', nome: 'User', email: 'u@u.com', perfil } : null,
      token,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    return render(
      <Provider>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
            <Route element={<AuthRoute allowedRoles={allowedRoles} />}>
              <Route path="/protected" element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it('deve redirecionar para /login se não houver token', async () => {
    renderAuthRoute(null, null);
    await waitFor(() => expect(screen.getByText(/Login Page/i)).toBeInTheDocument());
  });

  it('deve permitir acesso se houver token e sem restrição de papel', async () => {
    renderAuthRoute('COLABORADOR', 'fake-token');
    await waitFor(() => expect(screen.getByText(/Protected Content/i)).toBeInTheDocument());
  });

  it('deve redirecionar para a home se o perfil não for permitido', async () => {
    renderAuthRoute('COLABORADOR', 'fake-token', ['ADMIN']);
    await waitFor(() => expect(screen.getByText(/Home Page/i)).toBeInTheDocument());
  });

  it('deve permitir acesso se o perfil estiver na lista permitida', async () => {
    renderAuthRoute('ADMIN', 'fake-token', ['ADMIN']);
    await waitFor(() => expect(screen.getByText(/Protected Content/i)).toBeInTheDocument());
  });
});
