import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { GuestRoute, ProtectedRoute, PendingRoute } from "./routes/ProtectedRoute";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import WaitingApprovalPage from "./pages/auth/WaitingApprovalPage";

// Shared & Public pages
import HomePage from "./pages/home/HomePage";
import UnauthorizedPage from "./pages/shared/UnauthorizedPage";
import StyleGuidePage from "./pages/shared/StyleGuidePage";

// Dashboard placeholders — baad mein banenge (C3 onwards)
function AdminDashboard() {
  return <div className="p-10 text-center text-2xl font-bold text-slate-700">Admin Dashboard — Coming in C3 🚧</div>;
}
function ManagerDashboard() {
  return <div className="p-10 text-center text-2xl font-bold text-slate-700">Manager Dashboard — Coming in C3 🚧</div>;
}
function EmployeeDashboard() {
  return <div className="p-10 text-center text-2xl font-bold text-slate-700">Employee Dashboard — Coming in C3 🚧</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications — premium styling */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#1e293b",
              borderRadius: "16px",
              border: "1px solid #f1f5f9",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />

        <Routes>
          {/* Public Home Landing Page */}
          <Route path="/" element={<HomePage />} />

          {/* Guest routes — sirf logged-out users ke liye */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Pending approval route */}
          <Route element={<PendingRoute />}>
            <Route path="/waiting-approval" element={<WaitingApprovalPage />} />
          </Route>

          {/* Protected admin routes */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Protected manager routes */}
          <Route element={<ProtectedRoute roles={["manager"]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          </Route>

          {/* Protected employee routes */}
          <Route element={<ProtectedRoute roles={["employee"]} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          </Route>

          {/* Shared protected */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Dev style guide */}
          <Route path="/style-guide" element={<StyleGuidePage />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl font-black gradient-text mb-4">404</div>
                  <p className="text-slate-500">Page not found</p>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
