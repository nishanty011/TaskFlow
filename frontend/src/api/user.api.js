import api from "./axios";

export const getEmployees = (params) => api.get("/users", { params });
export const getEmployeeById = (id) => api.get(`/users/${id}`);
export const getPendingEmployees = () => api.get("/users/pending");
export const approveEmployee = (id, data = {}) => api.patch(`/users/${id}/approve`, data);
export const rejectEmployee = (id, data) => api.patch(`/users/${id}/reject`, data);
export const suspendUser = (id) => api.patch(`/users/${id}/suspend`);
export const updateProfile = (data) => api.patch("/users/profile", data);
export const changePassword = (data) => api.patch("/users/change-password", data);
