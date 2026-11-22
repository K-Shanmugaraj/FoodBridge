import axiosClient from './axiosClient';

export const userApi = {
  getAll: () => axiosClient.get('/users'),
  getById: (id) => axiosClient.get(`/users/${id}`),
  remove: (id) => axiosClient.delete(`/users/${id}`),
};