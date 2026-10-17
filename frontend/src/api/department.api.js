import api from "./axios";

export const getPublicDepartments = () => api.get("/departments/public");
export const getAllDepartments = () => api.get("/departments");
export const getDepartmentById = (id) => api.get(`/departments/${id}`);
export const createDepartment = (data) => api.post("/departments", data);
export const updateDepartment = (id, data) => api.patch(`/departments/${id}`, data);
export const assignManager = (id, data) => api.patch(`/departments/${id}/assign-manager`, data);
