import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useSocket } from "../../context/SocketContext";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications,
} from "../../api/notification.api";
import { formatDate, timeAgo } from "../../utils/formatDate";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'tasks'

  const { latestNotification } = useSocket();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications({ limit: 50 });
      const notifs = res.data?.data?.notifications || [];
      const unread = res.data?.data?.unreadCount ?? notifs.filter((n) => !n.isRead).length;
      setNotifications(notifs);
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time notification append
  useEffect(() => {
    if (latestNotification) {
      setNotifications((prev) => [latestNotification, ...prev]);
      setUnreadCount((c) => c + 1);
    }
  }, [latestNotification]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read ✓");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      const target = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      toast.success("Read notifications cleared");
    } catch {
      toast.error("Failed to clear read notifications");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "task_assigned":
        return { icon: "📋", bg: "bg-blue-50 text-blue-600 border-blue-200" };
      case "task_submitted":
        return { icon: "📥", bg: "bg-purple-50 text-purple-600 border-purple-200" };
      case "task_approved":
        return { icon: "✨", bg: "bg-emerald-50 text-emerald-600 border-emerald-200" };
      case "changes_requested":
        return { icon: "⚠️", bg: "bg-rose-50 text-rose-600 border-rose-200" };
      case "employee_approved":
        return { icon: "🎉", bg: "bg-amber-50 text-amber-600 border-amber-200" };
      default:
        return { icon: "🔔", bg: "bg-slate-50 text-slate-600 border-slate-200" };
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "tasks") {
      return ["task_assigned", "task_submitted", "task_approved", "changes_requested"].includes(n.type);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-600 text-white shadow-sm shadow-brand-500/20">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time activity alerts, task updates, reviews, and mentions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm"
            >
              ✓ Mark All as Read
            </button>
          )}

          <button
            onClick={handleClearRead}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all"
          >
            Clear Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-white/80 shadow-sm flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: "all", label: "All Alerts", count: notifications.length },
          { id: "unread", label: "Unread", count: unreadCount },
          {
            id: "tasks",
            label: "Tasks & Deliverables",
            count: notifications.filter((n) =>
              ["task_assigned", "task_submitted", "task_approved", "changes_requested"].includes(n.type)
            ).length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              filter === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                filter === tab.id ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          <CardSkeleton count={4} />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon="✨"
          title="All caught up!"
          message={
            filter === "unread"
              ? "You have no unread notifications."
              : "No notifications available at this time."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const { icon, bg } = getIcon(notif.type);

            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                className={`p-4 rounded-3xl border transition-all flex items-start justify-between gap-4 group cursor-pointer ${
                  notif.isRead
                    ? "bg-white/80 border-white/80 hover:bg-white hover:shadow-sm"
                    : "bg-brand-50/40 border-brand-200/70 hover:bg-brand-50/70 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-lg flex-shrink-0 shadow-sm ${bg}`}
                  >
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-semibold">
                      <span>{timeAgo(notif.createdAt)}</span>
                      <span>•</span>
                      <span>{formatDate(notif.createdAt)}</span>

                      {notif.link && (
                        <>
                          <span>•</span>
                          <Link
                            to={notif.link}
                            className="text-brand-600 hover:text-brand-700 font-bold hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open Task View →
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif._id);
                      }}
                      className="p-1.5 rounded-xl hover:bg-white text-slate-500 hover:text-brand-600 text-xs"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(notif._id, e)}
                    className="p-1.5 rounded-xl hover:bg-white text-slate-400 hover:text-rose-600 text-xs"
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
