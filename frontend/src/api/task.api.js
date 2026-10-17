import api from "./axios";

// Tasks list with search, status, priority filters
export const getTasks = (params) => api.get("/tasks", { params });

// Specific task detail
export const getTaskById = (id) => api.get(`/tasks/${id}`);

// Create task (manager/superadmin)
export const createTask = (data) => api.post("/tasks", data);

// Update task details (manager/superadmin)
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data);

// Archive task (manager/superadmin)
export const archiveTask = (id) => api.delete(`/tasks/${id}`);

// Update task status (employee: in_progress | submitted)
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });

// Toggle checklist item (employee)
export const updateChecklist = (id, data) => api.patch(`/tasks/${id}/checklist`, data);

// Task review (manager/superadmin)
export const reviewTask = (id, data) => api.patch(`/tasks/${id}/review`, data);

// Task timeline
export const getTaskTimeline = (id) => api.get(`/tasks/${id}/timeline`);

// Add comment
export const addTaskComment = (id, data) => api.post(`/tasks/${id}/comments`, data);

// Stats
export const getTaskStats = () => api.get("/tasks/stats");
