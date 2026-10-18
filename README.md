# ⚡ TaskFlow — Enterprise Employee & Task Management System

TaskFlow is a modern, high-performance task orchestration and team management platform built with the **MERN** stack (MongoDB, Express 5, React 19, Node.js) with real-time Socket.io communication, role-based access control (RBAC), and automated workflow pipelines.

---

## 🌐 Live Deployments

| Service | Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend Application** | **Vercel** | [https://task-flow-sigma-nine-62.vercel.app](https://task-flow-sigma-nine-62.vercel.app) |
| **Backend REST API** | **Render** | [https://taskflow-1-ibcz.onrender.com](https://taskflow-1-ibcz.onrender.com) |
| **API Health Check** | **Render** | [https://taskflow-1-ibcz.onrender.com/api/health](https://taskflow-1-ibcz.onrender.com/api/health) |
| **Database** | **MongoDB Atlas** | Cloud Replica Set (`Cluster0`) |

---

## 🔑 Demo Credentials

All test accounts come pre-seeded with complete data (tasks, submissions, audit logs, and notifications):

| Portal / Role | Email | Password | Scope / Permissions |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin** | `admin@taskflow.com` | `Password@123` | Full system oversight, department management, user approvals, audit trail |
| **👔 Tech Manager** | `aarav.manager@taskflow.com` | `Password@123` | Technology & Engineering department tasks, deliverables, and employee approvals |
| **👔 Marketing Manager** | `priya.manager@taskflow.com` | `Password@123` | Marketing & Growth department management |
| **👔 R&D Manager** | `vikram.manager@taskflow.com` | `Password@123` | Research & Innovation department management |
| **👔 HR Manager** | `neha.manager@taskflow.com` | `Password@123` | Human Resources department management |
| **👤 Tech Employee** | `rohan.tech@taskflow.com` | `Password@123` | Active employee: tasks, checklist progress, submissions, team view |
| **⏳ Pending Employee** | `aniket.pending@taskflow.com` | `Password@123` | Awaiting approval testing account |

---

## ✨ Key Features

### 1. 👥 Multi-Tier Role-Based Access Control (RBAC)
- **Super Admin:** System-wide metrics, department CRUD & manager assignments, complete user directory management, system audit logs, and global performance analytics.
- **Department Manager:** Department-scoped task delegation, deliverable submissions review with revisions & feedback rating, employee approvals, and team workload metrics.
- **Employee:** Personal task pipeline, interactive weighted checklist progress tracking, multi-file deliverables submission, task discussion comments, and notifications.

### 2. 🔐 Dual Registration & Smart Approval Pipeline
- **Employee Signup:** Automatically scoped to department and routed to the respective **Department Manager** for approval.
- **Manager Signup:** Routed directly to the **Super Admin** for authorization. Approving a manager auto-binds them to their department.
- **Instant In-App Notifications:** Real-time socket events notify managers or admins immediately upon new registration submissions.

### 3. 📋 Intelligent Task Engine
- **Weighted Checklist Auto-Progress:** Tasks track completion percentage dynamically calculated based on weighted sub-checklist items.
- **Deliverables & Versioned Submissions:** Employees upload deliverables with repository links; managers review, grade with feedback, or request revisions.
- **Discussion Thread:** Real-time task discussion comments per assignment.

### 4. ⚡ Real-Time Architecture
- **Socket.io Integration:** Live notification toasts for approvals, task assignments, reviews, and status transitions without page refreshes.
- **Unread Badges:** Live count sync across active browser sessions.

### 5. 🛡️ Enterprise Security & Performance
- HTTP-only JWT refresh cookies with cross-site `SameSite=None` protection.
- Strict department-level query scoping prevents cross-department data leakage.
- Sanitized request inputs against XSS and MongoDB operator injections.
- Rate limiting protection for sensitive auth endpoints.

---

## 🛠️ Technology Stack

### Frontend:
* **Framework:** React 19 + Vite 8
* **Routing:** React Router v7
* **State & Data Fetching:** TanStack React Query v5 + Context API
* **Styling:** Tailwind CSS + Vanilla CSS (Studio Luminous Slate Theme)
* **Real-time:** Socket.io Client
* **Data Visualization:** Recharts
* **Icons:** Lucide React + Custom SVG Logo Design

### Backend:
* **Runtime:** Node.js + Express 5
* **Database & ODM:** MongoDB Atlas + Mongoose 9
* **Authentication:** JSON Web Tokens (Access + HTTP-only Refresh Cookie) + BcryptJS
* **Validation:** Zod Schema Validation
* **Security:** Helmet, Express Rate Limit, Input Sanitizer, Dynamic CORS
* **Email:** Nodemailer (Gmail SMTP)
* **Real-time Server:** Socket.io Server

---

## 🚀 Local Development Setup

### Prerequisites:
- Node.js (v18+)
- Local MongoDB or MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/nishanty011/TaskFlow.git
cd TaskFlow
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_ACCESS_SECRET=super_secret_access_key_12345
JWT_REFRESH_SECRET=super_secret_refresh_key_12345
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
```

Seed initial database demo accounts:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start Vite dev server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📡 API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status | Public |
| `POST` | `/api/auth/register` | Register employee or manager | Public |
| `POST` | `/api/auth/login` | Authenticate & set JWT cookie | Public |
| `POST` | `/api/auth/logout` | Revoke tokens & clear session | Authenticated |
| `GET` | `/api/departments/public` | List active departments | Public |
| `GET` | `/api/departments` | Full department management | Super Admin |
| `GET` | `/api/tasks` | Department/assigned tasks | Protected |
| `POST` | `/api/tasks` | Create task delegation | Manager / Super Admin |
| `GET` | `/api/users/pending` | List pending approval requests | Manager / Super Admin |
| `PATCH`| `/api/users/:id/approve` | Approve user account | Manager / Super Admin |
| `PATCH`| `/api/users/:id/reject` | Reject user account with reason | Manager / Super Admin |
| `GET` | `/api/notifications` | User notifications list | Protected |
| `GET` | `/api/reports/analytics` | Executive performance metrics | Super Admin / Manager |

---

## 📄 License
This project is licensed under the ISC License.
