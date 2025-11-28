import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, UseAuth } from './Utils/AuthContext';

const LoginPage = lazy(() => import('./Pages/LoginPage'));
const RegisterPage = lazy(() => import('./Pages/RegisterPage'));
const DashboardPage = lazy(() => import('./Pages/DashboardPage'));
const TasksPage = lazy(() => import('./Pages/TasksPage'));
const CalendarPage = lazy(() => import('./Pages/CalendarPage'));
const SettingsPage = lazy(() => import('./Pages/SettingsPage'));

// Preload all components after initial render
const PreloadComponents = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./Pages/LoginPage');
      import('./Pages/RegisterPage');
      import('./Pages/DashboardPage');
      import('./Pages/TasksPage');
      import('./Pages/CalendarPage');
      import('./Pages/SettingsPage');
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  return null;
};

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
    </div>
  </div>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { Token, IsLoading } = UseAuth();

  if (IsLoading) {
    return <LoadingFallback />;
  }

  return Token ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { Token, IsLoading } = UseAuth();

  if (IsLoading) {
    return <LoadingFallback />;
  }

  return !Token ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TasksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <CalendarPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <PreloadComponents />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
