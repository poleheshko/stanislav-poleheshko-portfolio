import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAssuranceLevel, getSession } from "../../lib/auth";

// Re-derives session + MFA assurance level fresh from Supabase on every
// mount rather than trusting cached state from the login page — a session
// that's aal1 when the account requires aal2 must be treated as unauthenticated.
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await getSession();
        if (!session) {
          if (!cancelled) setStatus("denied");
          return;
        }
        const { currentLevel, nextLevel } = await getAssuranceLevel();
        if (!cancelled) setStatus(currentLevel === nextLevel ? "allowed" : "denied");
      } catch {
        if (!cancelled) setStatus("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return <div className="admin-screen admin-screen-center">Checking session…</div>;
  }
  if (status === "denied") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return children;
}
