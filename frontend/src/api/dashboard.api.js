import api from "./axios";

// Admin dashboard — org-wide overview
export const getAdminDashboard = () => api.get("/dashboard/admin");

// Manager dashboard — department level
export const getManagerDashboard = () => api.get("/dashboard/manager");

// Employee dashboard — personal tasks/progress
export const getEmployeeDashboard = () => api.get("/dashboard/employee");
