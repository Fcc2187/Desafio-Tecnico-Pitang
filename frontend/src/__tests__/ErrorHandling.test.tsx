import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test/test-utils';
import { LoginPage } from '../pages/auth/LoginPage';
import * as authService from '../services/auth.service';
import Swal from 'sweetalert2';

vi.mock('../services/auth.service', () => ({
  login: vi.fn(),
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  },
}));

describe('Tratamento de Erros na UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir um alerta de erro se a API retornar 500 no login', async () => {
    const mockError = {
      response: {
        data: { message: 'Erro interno no servidor' },
        status: 500,
      },
    };
    (authService.login as any).mockRejectedValue(mockError);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('seu@pitang.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    const submitBtn = screen.getByRole('button', { name: /Entrar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        icon: 'error',
        title: 'Falha no login',
        text: 'Erro interno no servidor',
      }));
    });
  });
});
