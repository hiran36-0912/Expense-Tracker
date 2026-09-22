import api from './api';

export const getBudgets = (month, year) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return api.get('/budgets', { params });
};

export const createBudget = (data) => api.post('/budgets', data);

export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data);

export const deleteBudget = (id) => api.delete(`/budgets/${id}`);
