import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect only when user is authenticated
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    const s = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => {
      setIsConnected(true);
      // Join user personal notification room
      s.emit("join_user", user._id);

      // Join department room if assigned
      const deptId = user.department?._id || user.department;
      if (deptId) {
        s.emit("join_department", deptId.toString());
      }
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    // Real-time notification handler
    s.on("notification", (notif) => {
      setLatestNotification(notif);

      // Toast notification popup
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-sm w-full bg-white/95 backdrop-blur-2xl shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 p-4 border border-brand-200/60`}
          >
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5 text-xl">
                  {notif.type === "task_assigned"
                    ? "📋"
                    : notif.type === "task_approved"
                    ? "✨"
                    : notif.type === "changes_requested"
                    ? "⚠️"
                    : notif.type === "task_submitted"
                    ? "📥"
                    : notif.type === "comment_added"
                    ? "💬"
                    : notif.type === "employee_approved"
                    ? "🎉"
                    : notif.type === "task_overdue"
                    ? "⏰"
                    : notif.type === "deadline_reminder"
                    ? "⏳"
                    : notif.type === "employee_registered"
                    ? "👤"
                    : "🔔"}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-lg p-1 inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
              >
                ✕
              </button>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, user?.department]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, latestNotification }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    return { socket: null, isConnected: false, latestNotification: null };
  }
  return context;
}
