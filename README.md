# TaskFlow - Employee & Task Management System

TaskFlow is a role-based employee and task management system built with the MERN stack (MongoDB, Express, React, Node.js).

## Architecture & Progress
- **Database (MongoDB)**:
  - Models: Department, User, Task, Submission, Feedback, Comment, Notification, ActivityLog
  - Relationships & Indexes configured for department-level data isolation
- **Backend (Node.js + Express)**:
  - RESTful architecture with error handling, JWT authentication, and scoped access control

## Getting Started

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` from `.env.example`
4. Run dev server: `npm run dev`
