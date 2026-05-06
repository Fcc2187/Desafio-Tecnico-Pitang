import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { ReimbursementDetail } from '../pages/reimbursements/ReimbursementDetail';
import * as service from '../services/reimbursements.service';
import * as AuthContext from '../contexts/AuthContext';

vi.mock('../services/reimbursements.service', () => ({
  getById: vi.fn((id) => Promise.resolve({
    id,
    descricao: 'Viagem de Teste',
    valor: 150,
    dataDespesa: '2023-10-10',
    status: 'RASCUNHO',
    categoria: { nome: 'Transporte' },
    solicitante: { nome: 'João' },
    attachments: [],
    history: []
  })),
  submit: vi.fn(() => Promise.resolve()),
}));

describe('Fluxo de Submissão de Reembolso', () => {
  it('deve chamar o serviço de submissão ao clicar em Enviar para Aprovação no Detalhe', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', nome: 'João', email: 'j@j.com', perfil: 'COLABORADOR' },
      token: 'fake',
      login: vi.fn(),
      logout: vi.fn(),
      loading: false
    });

    render(<ReimbursementDetail reimbursement={{ id: '123' }} onClose={handleClose} onEdit={() => {}} />);

    // Esperar carregar detalhes
    await waitFor(() => expect(screen.queryByText(/Viagem de Teste/i)).toBeInTheDocument());

    const submitBtn = screen.getByRole('button', { name: /Enviar para Aprovação/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(service.submit).toHaveBeenCalledWith('123');
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
