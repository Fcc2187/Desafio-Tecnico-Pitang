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

export const list = async (): Promise<Reimbursement[]> => {
  const response = await api.get('/reimbursements');
  return response.data;
};

export const getDetail = async (id: string): Promise<any> => {
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

export const listCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (nome: string) => {
  const response = await api.post('/categories', { nome });
  return response.data;
};
