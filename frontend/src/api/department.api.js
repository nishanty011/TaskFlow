import api from "./axios";

// Public departments — registration dropdown ke liye
export const getPublicDepartments = () => api.get("/departments/public");

// All departments (authenticated)
export const getAllDepartments = () => api.get("/departments");

// Specific department
export const getDepartmentById = (id) => api.get(`/departments/${id}`);

// Create department (superadmin)
export const createDepartment = (data) => api.post("/departments", data);

// Update department (superadmin)
export const updateDepartment = (id, data) => api.patch(`/departments/${id}`, data);

// Assign manager to department (superadmin)
export const assignManager = (id, data) => api.patch(`/departments/${id}/assign-manager`, data);
