import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { LoginPage } from '../pages/auth/LoginPage';

vi.mock('../services/auth.service', () => ({
  login: vi.fn(),
}));

describe('LoginPage', () => {
  it('deve renderizar os campos de email e senha', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('seu@pitang.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('deve exibir erro de validação para email inválido', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('seu@pitang.com');

    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    
    const form = screen.getByRole('button', { name: /Entrar/i }).closest('form');
    fireEvent.submit(form!);

    const errorMsg = await screen.findByText(/Email inválido/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('deve exibir erro para senha curta', async () => {
    render(<LoginPage />);
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(passwordInput, { target: { value: '123' } });
    
    const form = screen.getByRole('button', { name: /Entrar/i }).closest('form');
    fireEvent.submit(form!);

    const errorMsg = await screen.findByText(/A senha deve ter pelo menos 6 caracteres/i);
    expect(errorMsg).toBeInTheDocument();
  });


});

