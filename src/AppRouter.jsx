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
        {/* The homepage stays mounted across "/", "/projects" and
            "/projects/:slug" because they are children of one pathless layout
            route whose element is <App />. Navigating between them only changes
            the URL — App is never remounted, so projects aren't refetched and
            the scroll position/animations survive. App reads the URL to decide
            which project modal is open. */}
        <Route element={<App />}>
          <Route path="/" element={null} />
          <Route path="/projects" element={null} />
          <Route path="/projects/:slug" element={null} />
        </Route>
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
