import api from './api';

export const updateProfile = (data) => api.put('/users/profile', data);
