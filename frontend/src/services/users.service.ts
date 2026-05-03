import api from './api';

export const list = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const update = async (id: string, data: { nome?: string, perfil?: string }) => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data;
};
