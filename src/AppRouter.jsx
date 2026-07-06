import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";

// The admin panel (dashboard, project form, employers, 2FA/security) is only
// ever seen by the site owner, so it's code-split out of the public bundle:
// a first-time homepage visitor never downloads it. React.lazy defers each
// chunk until its route is actually navigated to.
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const ProtectedRoute = lazy(() => import("./pages/admin/ProtectedRoute.jsx"));

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="route-loading">Loading…</div>}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
