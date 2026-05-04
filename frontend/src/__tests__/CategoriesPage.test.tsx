import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { CategoriesPage } from '../pages/categories/CategoriesPage';

const { mockCreateCategory } = vi.hoisted(() => ({
  mockCreateCategory: vi.fn(() => Promise.resolve()),
}));

vi.mock('../services/reimbursements.service', () => ({
  listCategories: vi.fn(() => Promise.resolve([
    { id: 'cat-1', nome: 'Alimentação', ativo: true, limiteValor: null }
  ])),
  createCategory: mockCreateCategory,
}));

describe('CategoriesPage - Diferencial Premium', () => {
  it('Deve permitir criar uma nova categoria COM limite de valor', async () => {
    const user = userEvent.setup();
    render(<CategoriesPage />);

    await waitFor(() => expect(screen.queryByText(/Alimentação/i)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Nova Categoria/i }));

    const nameInput = screen.getByPlaceholderText(/Ex: Refeições, Hospedagem/i);
    await user.type(nameInput, 'Viagem Internacional');

    const limitInput = screen.getByPlaceholderText(/Ex: 1000.00/i);
    await user.type(limitInput, '5000');

    await user.click(screen.getByRole('button', { name: /Salvar Categoria/i }));

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith('Viagem Internacional', 5000);
    });
  });

  it('Deve permitir criar uma nova categoria SEM limite de valor', async () => {
    const user = userEvent.setup();
    render(<CategoriesPage />);

    await waitFor(() => expect(screen.queryByText(/Alimentação/i)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Nova Categoria/i }));

    const nameInput = screen.getByPlaceholderText(/Ex: Refeições, Hospedagem/i);
    await user.type(nameInput, 'Brindes');

    await user.click(screen.getByRole('button', { name: /Salvar Categoria/i }));

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith('Brindes', null);
    });
  });
});
