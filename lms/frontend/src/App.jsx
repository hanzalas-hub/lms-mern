import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import CourseManagement from './pages/CourseManagement';
import PaymentApproval from './pages/PaymentApproval';
import TeacherDashboard from './pages/TeacherDashboard';
import QuizManagement from './pages/QuizManagement';
import StudentDashboard from './pages/StudentDashboard';
import CourseDetails from './pages/CourseDetails';
import TakeQuiz from './pages/TakeQuiz';

const Home = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>Welcome to LMS Platform</h1>
    <p>Empower your learning journey with our interactive courses and quizzes.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route element={<PrivateRoute roles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/course/:courseId" element={<CourseDetails />} />
            <Route path="/student/quiz/:quizId" element={<TakeQuiz />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<PrivateRoute roles={['teacher']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/quizzes/:courseId" element={<QuizManagement />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateRoute roles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/payments" element={<PaymentApproval />} />
          </Route>

          {/* Redirect if unknown route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
