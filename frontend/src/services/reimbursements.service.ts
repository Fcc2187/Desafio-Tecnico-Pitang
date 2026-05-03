import api from './api';

export interface Reimbursement {
  id: string;
  descricao: string;
  valor: number;
  status: string;
  dataDespesa: string;
  categoria: {
    nome: string;
  };
  solicitante: {
    nome: string;
  };
  justificativaRejeicao?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const list = async (page: number = 1, filters?: { status?: string, categoriaId?: string, colaborador?: string, sortField?: string, sortOrder?: string }): Promise<PaginatedResponse<Reimbursement>> => {
  let url = `/reimbursements?page=${page}&limit=10`;
  if (filters?.status) url += `&status=${filters.status}`;
  if (filters?.categoriaId) url += `&categoriaId=${filters.categoriaId}`;
  if (filters?.colaborador) url += `&colaborador=${filters.colaborador}`;
  if (filters?.sortField) url += `&sortField=${filters.sortField}`;
  if (filters?.sortOrder) url += `&sortOrder=${filters.sortOrder}`;
  
  const response = await api.get(url);
  return response.data;
};

export const getStats = async (): Promise<any> => {
  const response = await api.get('/reimbursements/stats');
  return response.data;
};

export const getById = async (id: string): Promise<any> => {
  const response = await api.get(`/reimbursements/${id}`);
  return response.data;
};

export const create = async (data: any) => {
  const response = await api.post('/reimbursements', data);
  return response.data;
};

export const update = async (id: string, data: any) => {
  const response = await api.put(`/reimbursements/${id}`, data);
  return response.data;
};

export const submit = async (id: string) => {
  const response = await api.post(`/reimbursements/${id}/submit`);
  return response.data;
};

export const approve = async (id: string) => {
  const response = await api.post(`/reimbursements/${id}/approve`);
  return response.data;
};

export const reject = async (id: string, justificativa: string) => {
  const response = await api.post(`/reimbursements/${id}/reject`, { justificativaRejeicao: justificativa });
  return response.data;
};

export const pay = async (id: string) => {
  const response = await api.post(`/reimbursements/${id}/pay`);
  return response.data;
};

export const cancel = async (id: string) => {
  const response = await api.post(`/reimbursements/${id}/cancel`);
  return response.data;
};

export const uploadAttachment = async (reimbursementId: string, data: { nomeArquivo: string, urlArquivo: string, tipoArquivo: string }) => {
  const response = await api.post(`/reimbursements/${reimbursementId}/attachments`, data);
  return response.data;
};

export const listCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (nome: string, limiteValor?: number | null) => {
  const response = await api.post('/categories', { nome, limiteValor });
  return response.data;
};

export const updateCategory = async (id: string, data: { nome?: string, ativo?: boolean, limiteValor?: number | null }) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

