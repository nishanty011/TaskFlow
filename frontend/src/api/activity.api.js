import api from "./axios";

// Activity timeline — audit trail with pagination
export const getActivities = (params) => api.get("/activities", { params });

// Activity stats — counts by action type
export const getActivityStats = () => api.get("/activities/stats");
