import api from "./axios";

// Report export — type can be 'tasks' or 'employees'
export const exportReport = (type) =>
  api.get("/reports/export", {
    params: { type },
    responseType: "blob",
  });
