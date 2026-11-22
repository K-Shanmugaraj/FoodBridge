import axiosClient from './axiosClient';

export const donationApi = {
  getAvailable: () => axiosClient.get('/donations'),
  getAll: () => axiosClient.get('/donations/all'),
  getById: (id) => axiosClient.get(`/donations/${id}`),
  getByDonor: (donorId) => axiosClient.get(`/donations/donor/${donorId}`),
  getByNgo: (ngoId) => axiosClient.get(`/donations/ngo/${ngoId}`),
  create: (payload) => axiosClient.post('/donations', payload),
  update: (id, payload) => axiosClient.put(`/donations/${id}`, payload),
  remove: (id, donorId) => axiosClient.delete(`/donations/${id}`, { params: { donorId } }),
  adminRemove: (id) => axiosClient.delete(`/donations/admin/${id}`),
  collect: (id, ngoId) => axiosClient.post(`/donations/${id}/collect`, { ngoId }),
};