import { useCallback, useEffect, useState } from "react";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    // Dynamic import keeps the ~55 kB (gzip) Supabase client off the homepage's
    // critical path: the hero paints immediately and the projects fetch (and
    // its client) loads in parallel, settling the "Loading projects…" state.
    return import("../lib/projects")
      .then(({ fetchProjects }) => fetchProjects())
      .then((data) => {
        setProjects(data);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { projects, loading, error, reload };
}
