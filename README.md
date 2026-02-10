# LMS Project - AI Assisted Learning Management System

A comprehensive Learning Management System built with Node.js, Express, MongoDB, and React (MUI).

## Features

### 🔐 Authentication & Roles
- JWT-based authentication with secure cookie/header management.
- Role-Based Access Control (RBAC) for Admin, Teacher, and Student.
- Password hashing using Bcrypt.

### 📚 Course Management
- Admin: Create, edit, delete courses and assign teachers.
- Teacher: View assigned courses and manage quizzes.
- Student: Browse, search, and enroll in courses.

### 📝 Quiz System
- Teacher: MCQ question builder with auto-grading support.
- Student: Interactive quiz interface with a real-time countdown timer.
- Auto-submission on timer expiry.

### 💰 Payment & Enrollment
- Course enrollment requires a ₹3000 security fee.
- Students upload payment receipts (Multer-based file storage).
- Admin panel for reviewing and approving payments to activate enrollments.

## Tech Stack
- **Frontend**: React, Vite, Material UI (MUI), Axios, React Router.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Morgan (Logging), Multer (File Uploads).

## Getting Started

### Prerequisites
- Node.js installed.
- MongoDB running locally or on Atlas.

### Installation
1. Clone the repository.
2. **Backend**:
   ```bash
   cd lms/backend
   npm install
   # Create .env from .env.example
   node seed.js # To populate initial users and courses
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd lms/frontend
   npm install
   npm run dev
   ```

### Default Credentials (after seeding)
- **Admin**: `admin@lms.com` / `password123`
- **Teacher**: `teacher@lms.com` / `password123`
- **Student**: `student@lms.com` / `password123`

## Directory Structure
- `/backend`: Express API, Mongoose models, and auth logic.
- `/frontend`: React SPA, MUI components, and contextual state management.
- `/brain`: Project task lists and implementation plans.
