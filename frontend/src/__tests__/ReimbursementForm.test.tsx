import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { ReimbursementForm } from '../pages/reimbursements/ReimbursementForm';

vi.mock('../services/reimbursements.service', () => ({
  listCategories: vi.fn(() => Promise.resolve([
    { id: 'cat-1', nome: 'Alimentação', ativo: true }
  ])),
  create: vi.fn(() => Promise.resolve()),
  update: vi.fn(() => Promise.resolve()),
}));

describe('ReimbursementForm', () => {
  it('deve exibir erro se a data for no futuro', async () => {
    const user = userEvent.setup();
    render(<ReimbursementForm onClose={() => {}} />);
    
    await waitFor(() => expect(screen.queryByText(/Alimentação/i)).toBeInTheDocument());

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'cat-1' } });
    
    fireEvent.change(screen.getByPlaceholderText('Ex: Almoço com cliente'), { target: { value: 'Almoço de Negócios Longo' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '100' } });

    const dateInput = screen.getByLabelText(/Data da Despesa/i);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateString = futureDate.toISOString().split('T')[0];

    fireEvent.change(dateInput, { target: { value: dateString } });
    
    await user.click(screen.getByRole('button', { name: /Salvar Rascunho/i }));

    const errorMsg = await screen.findByText(/A data não pode ser no futuro/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('deve exigir anexo para valores acima de R$ 1.000,00', async () => {
    const user = userEvent.setup();
    render(<ReimbursementForm onClose={() => {}} />);
    
    await waitFor(() => expect(screen.queryByText(/Alimentação/i)).toBeInTheDocument());

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'cat-1' } });

    fireEvent.change(screen.getByPlaceholderText('Ex: Almoço com cliente'), { target: { value: 'Notebook Novo da Apple' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '5000' } });
    
    fireEvent.change(screen.getByLabelText(/Data da Despesa/i), { target: { value: '2023-10-10' } });

    await user.click(screen.getByRole('button', { name: /Salvar Rascunho/i }));

    const errorMsg = await screen.findByText(/Comprovante obrigatório para valores acima de R\$ 1.000,00/i);
    expect(errorMsg).toBeInTheDocument();
  });
});

