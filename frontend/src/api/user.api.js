import api from "./axios";

// Saare employees fetch karo — search, status filter, pagination
export const getEmployees = (params) => api.get("/users", { params });

// Specific employee ka detail
export const getEmployeeById = (id) => api.get(`/users/${id}`);

// Pending approval employees list
export const getPendingEmployees = () => api.get("/users/pending");

// Employee ko approve karo
export const approveEmployee = (id, data = {}) => api.patch(`/users/${id}/approve`, data);

// Employee ko reject karo
export const rejectEmployee = (id, data) => api.patch(`/users/${id}/reject`, data);

// User ko suspend karo (superadmin)
export const suspendUser = (id) => api.patch(`/users/${id}/suspend`);

// Profile update
export const updateProfile = (data) => api.patch("/users/profile", data);

// Password change
export const changePassword = (data) => api.patch("/users/change-password", data);
