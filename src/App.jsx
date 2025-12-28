import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AssignmentForm from './pages/AssignmentForm';
import AssignmentDetail from './pages/AssignmentDetail';
import SubmissionsList from './pages/SubmissionsList';

const Dashboard = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/assignments/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Navbar />
              <AssignmentForm />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/assignments/:id"
          element={
            <ProtectedRoute>
              <Navbar />
              <AssignmentDetail />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/assignments/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Navbar />
              <AssignmentForm />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/assignments/:assignmentId/submissions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Navbar />
              <SubmissionsList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

