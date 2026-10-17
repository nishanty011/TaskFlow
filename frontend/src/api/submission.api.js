import api from "./axios";

// Get submissions for a task with full version history
export const getTaskSubmissions = (taskId) => api.get("/submissions", { params: { taskId } });

// Specific submission detail
export const getSubmissionById = (id) => api.get(`/submissions/${id}`);

// Pending submissions awaiting review (manager/superadmin)
export const getPendingSubmissions = () => api.get("/submissions/pending");

// Employee's own submissions
export const getMySubmissions = () => api.get("/submissions/my");

// Review submission (manager/superadmin: approve or request changes with rating)
export const reviewSubmission = (id, data) => api.patch(`/submissions/${id}/review`, data);

// Create submission (employee file upload)
export const createSubmission = (formData) =>
  api.post("/submissions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
