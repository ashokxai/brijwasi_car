import api from './api';

export const adminLogin = (email, password) =>
  api.post('/admin/login', { email, password });

export const adminFirebaseLogin = (idToken) =>
  api.post('/admin/login/firebase', { idToken });

export const getDashboard = () => api.get('/admin/dashboard');

export const getAdminCars = (params) => api.get('/admin/cars', { params });

export const updateCarStatus = (id, data) =>
  api.patch(`/admin/cars/${id}/status`, data);

export const updateAdminCar = (id, formData) =>
  api.put(`/admin/cars/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getUsers = () => api.get('/admin/users');

export const getBrands = () => api.get('/admin/brands');
export const createBrand = (data) => api.post('/admin/brands', data);
export const updateBrand = (id, data) => api.put(`/admin/brands/${id}`, data);
export const deleteBrand = (id) => api.delete(`/admin/brands/${id}`);

export const getModels = (params) => api.get('/admin/models', { params });
export const createModel = (data) => api.post('/admin/models', data);
export const updateModel = (id, data) => api.put(`/admin/models/${id}`, data);
export const deleteModel = (id) => api.delete(`/admin/models/${id}`);

export const getCities = () => api.get('/admin/cities');
export const createCity = (data) => api.post('/admin/cities', data);
export const updateCity = (id, data) => api.put(`/admin/cities/${id}`, data);
export const deleteCity = (id) => api.delete(`/admin/cities/${id}`);

export const getFuelTypes = () => api.get('/admin/fuel-types');
export const createFuelType = (data) => api.post('/admin/fuel-types', data);
export const updateFuelType = (id, data) => api.put(`/admin/fuel-types/${id}`, data);
export const deleteFuelType = (id) => api.delete(`/admin/fuel-types/${id}`);

export const getBanners = () => api.get('/admin/banners');
export const createBanner = (data) => api.post('/admin/banners', data);
export const updateBanner = (id, data) => api.put(`/admin/banners/${id}`, data);
export const deleteBanner = (id) => api.delete(`/admin/banners/${id}`);

export const getReports = () => api.get('/admin/reports');
