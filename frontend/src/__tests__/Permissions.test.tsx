import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { ReimbursementDetail } from '../pages/reimbursements/ReimbursementDetail';
import * as AuthContext from '../contexts/AuthContext';

vi.mock('../services/reimbursements.service', () => ({
  getById: vi.fn((id) => Promise.resolve({
    id,
    descricao: 'Viagem',
    valor: 1500,
    dataDespesa: '2023-10-10',
    status: 'ENVIADO',
    categoria: { nome: 'Transporte' },
    solicitante: { nome: 'João Colaborador' },
    attachments: [],
    history: []
  })),
}));

describe('Controle de Acesso - ReimbursementDetail', () => {
  const renderDetail = () => {
    render(<ReimbursementDetail reimbursement={{ id: '123', status: 'ENVIADO' }} onClose={() => {}} onEdit={() => {}} />);
  };

  it('Colaborador NÃO deve ver botões de Aprovar ou Confirmar Pagamento', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', nome: 'João', email: 'joao@pitang.com', perfil: 'COLABORADOR' },
      token: 'fake',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true
    });

    renderDetail();

    await waitFor(() => expect(screen.queryByText(/Detalhes da Solicitação/i)).toBeInTheDocument());

    expect(screen.queryByRole('button', { name: /Aprovar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Confirmar Pagamento/i })).not.toBeInTheDocument();
  });

  it('Gestor DEVE ver o botão de Aprovar em solicitações ENVIADAS', async () => {
    // Forja um Gestor logado
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'g1', nome: 'Maria Gestora', email: 'maria@pitang.com', perfil: 'GESTOR' },
      token: 'fake',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true
    });

    renderDetail();

    await waitFor(() => expect(screen.queryByText(/Detalhes da Solicitação/i)).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /Aprovar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rejeitar/i })).toBeInTheDocument();
  });
});
