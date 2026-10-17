import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notification.api";
import { formatRelativeTime } from "../../utils/formatDate";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const { latestNotification, isConnected } = useSocket();

  // Notifications fetch karein
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await getMyNotifications({ limit: 8 });
      const notifs = data.data?.notifications || [];
      const serverUnread = data.data?.unreadCount ?? notifs.filter((n) => !n.isRead).length;
      setNotifications(notifs);
      setUnreadCount(serverUnread);
    } catch {
      // silent fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time live notification append
  useEffect(() => {
    if (latestNotification) {
      setNotifications((prev) => [latestNotification, ...prev]);
      setUnreadCount((c) => c + 1);
    }
  }, [latestNotification]);

  // Dropdown ke bahar click karne par close karein
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  // Notification type icon
  const getIcon = (type) => {
    switch (type) {
      case "task_assigned":
        return "📋";
      case "submission_received":
      case "task_submitted":
        return "📥";
      case "submission_approved":
      case "task_approved":
        return "✨";
      case "changes_requested":
        return "⚠️";
      case "feedback_added":
      case "comment_added":
        return "💬";
      case "user_approved":
      case "employee_approved":
        return "🎉";
      case "task_overdue":
        return "⏰";
      case "deadline_reminder":
        return "⏳";
      case "employee_registered":
        return "👤";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60 shadow-sm transition-all hover:scale-105 active:scale-95"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-slate-400/30 overflow-hidden z-50 animate-scale-in">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-200">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100/80">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2 font-medium">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 text-xl">
                  ✨
                </div>
                <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">No notifications right now.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    n.isRead ? "bg-white hover:bg-slate-50/60" : "bg-brand-50/30 hover:bg-brand-50/60"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-base flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
