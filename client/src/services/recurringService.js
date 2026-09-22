import api from './api';

export const getRecurring = () => api.get('/recurring');

export const createRecurring = (data) => api.post('/recurring', data);

export const updateRecurring = (id, data) => api.put(`/recurring/${id}`, data);

export const toggleRecurringActive = (id, active) => api.put(`/recurring/${id}`, { active });

export const deleteRecurring = (id) => api.delete(`/recurring/${id}`);
