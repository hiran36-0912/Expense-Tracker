import api from './api';

export const getGoals = () => api.get('/goals');

export const createGoal = (data) => api.post('/goals', data);

export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);

export const addMoneyToGoal = (id, addAmount) => api.put(`/goals/${id}`, { addAmount });

export const deleteGoal = (id) => api.delete(`/goals/${id}`);
