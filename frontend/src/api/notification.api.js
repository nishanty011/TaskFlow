import api from "./axios";

export const getMyNotifications = (params) =>
  api.get("/notifications", { params });

export const markNotificationAsRead = (id) =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = () =>
  api.patch("/notifications/read-all");

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);

export const clearReadNotifications = () =>
  api.delete("/notifications/clear-all");
