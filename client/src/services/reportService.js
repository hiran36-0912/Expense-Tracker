import api from './api';

export const getReportSummary = (month, year) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return api.get('/reports/summary', { params });
};

export const getReportMonthly = (year) => {
  const params = {};
  if (year) params.year = year;
  return api.get('/reports/monthly', { params });
};

export const getReportCategories = (month, year) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return api.get('/reports/categories', { params });
};
