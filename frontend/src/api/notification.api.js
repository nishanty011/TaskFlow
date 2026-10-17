import api from "./axios";

// User ke notifications fetch karein
export const getMyNotifications = (params) =>
  api.get("/notifications", { params });

// Single notification read mark karein
export const markNotificationAsRead = (id) =>
  api.patch(`/notifications/${id}/read`);

// Saare unread notifications read mark karein
export const markAllNotificationsAsRead = () =>
  api.patch("/notifications/read-all");

// Single notification delete karein
export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);

// Read notifications clear karein
export const clearReadNotifications = () =>
  api.delete("/notifications/clear-all");
