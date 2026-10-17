import api from "./axios";

// Sab departments fetch karo — register form ke dropdown ke liye
export const getAllDepartments = () => api.get("/departments/public");
