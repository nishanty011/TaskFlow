import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { GuestRoute, ProtectedRoute, PendingRoute } from "./routes/ProtectedRoute";

// Layout components
import AppLayout from "./components/layout/AppLayout";
import ErrorBoundary from "./components/layout/ErrorBoundary";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import WaitingApprovalPage from "./pages/auth/WaitingApprovalPage";

// Public & Shared pages
import HomePage from "./pages/home/HomePage";
import UnauthorizedPage from "./pages/shared/UnauthorizedPage";
import StyleGuidePage from "./pages/shared/StyleGuidePage";
import NotFoundPage from "./pages/shared/NotFoundPage";

// Role Dashboard Views
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import DepartmentManagementPage from "./pages/admin/DepartmentManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import ManagerApprovalsPage from "./pages/manager/ManagerApprovalsPage";
import ManagerEmployeesPage from "./pages/manager/ManagerEmployeesPage";
import ManagerTasksPage from "./pages/manager/ManagerTasksPage";
import ManagerReviewsPage from "./pages/manager/ManagerReviewsPage";
import EmployeeDashboardPage from "./pages/employee/EmployeeDashboardPage";
import EmployeeTasksPage from "./pages/employee/EmployeeTasksPage";
import EmployeeSubmissionsPage from "./pages/employee/EmployeeSubmissionsPage";
import EmployeeTeamPage from "./pages/employee/EmployeeTeamPage";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          {/* Toast notifications — styled with rounded-2xl & smooth elevation */}
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(255, 255, 255, 0.95)",
                color: "#1e293b",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                padding: "12px 16px",
                backdropFilter: "blur(12px)",
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

            {/* Protected authenticated routes wrapped in AppLayout (Sidebar + Navbar + Shell) */}
            <Route element={<ProtectedRoute roles={["admin", "superadmin"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/departments" element={<DepartmentManagementPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute roles={["manager", "superadmin"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
                <Route path="/manager/tasks" element={<ManagerTasksPage />} />
                <Route path="/manager/approvals" element={<ManagerApprovalsPage />} />
                <Route path="/manager/employees" element={<ManagerEmployeesPage />} />
                <Route path="/manager/reviews" element={<ManagerReviewsPage />} />
                <Route path="/manager/analytics" element={<ManagerDashboardPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute roles={["employee"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
                <Route path="/employee/tasks" element={<EmployeeTasksPage />} />
                <Route path="/employee/submissions" element={<EmployeeSubmissionsPage />} />
                <Route path="/employee/team" element={<EmployeeTeamPage />} />
              </Route>
            </Route>

            {/* Shared protected & dev routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/style-guide" element={<StyleGuidePage />} />

            {/* 404 Not Found Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
