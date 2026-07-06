import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import { useProjects } from "../../hooks/useProjects";
import { deleteProject, swapSortOrder, updateProject } from "../../lib/projects";
import { deleteProjectImages } from "../../lib/storage";
import { signOut } from "../../lib/auth";
import ProjectForm from "./ProjectForm.jsx";
import EmployersTab from "./EmployersTab.jsx";
import SecurityTab from "./SecurityTab.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { projects, loading, error, reload } = useProjects();
  const [tab, setTab] = useState("projects"); // "projects" | "employers" | "security"
  const [view, setView] = useState("list"); // "list" | "form"
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  async function handleLogout() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  function openNewForm() {
    setEditingProject(null);
    setActionError("");
    setView("form");
  }
  function openEditForm(project) {
    setEditingProject(project);
    setActionError("");
    setView("form");
  }
  function handleSaved() {
    setView("list");
    setEditingProject(null);
    reload();
  }

  async function toggleHighlighted(project) {
    setActionError("");
    try {
      await updateProject(project.id, { highlighted: !project.highlighted });
      reload();
    } catch (err) {
      setActionError(err.message || "Could not update project.");
    }
  }

  async function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    setActionError("");
    try {
      await swapSortOrder(projects[index], projects[target]);
      reload();
    } catch (err) {
      setActionError(err.message || "Could not reorder projects.");
    }
  }

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await deleteProject(deleteTarget.id);
      const paths = (deleteTarget.images || []).map((im) => im.path).filter(Boolean);
      await deleteProjectImages(paths);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      setActionError(err.message || "Could not delete project.");
    } finally {
      setDeleteBusy(false);
    }
  }

  const nextSortOrder = projects.length
    ? Math.max(...projects.map((p) => p.sortOrder)) + 1
    : 1;

  return (
    <div className="admin-screen">
      <header className="admin-topbar">
        <h1>Portfolio admin</h1>
        <button className="admin-btn" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <div className="admin-tabs" role="tablist">
        <button
          className={`admin-tab${tab === "projects" ? " active" : ""}`}
          onClick={() => {
            setTab("projects");
            setView("list");
          }}
        >
          Projects
        </button>
        <button
          className={`admin-tab${tab === "employers" ? " active" : ""}`}
          onClick={() => setTab("employers")}
        >
          Employers
        </button>
        <button
          className={`admin-tab${tab === "security" ? " active" : ""}`}
          onClick={() => setTab("security")}
        >
          Security
        </button>
      </div>

      <main className={`admin-main${tab === "projects" && view === "form" ? " admin-main-wide" : ""}`}>
        {tab === "security" && <SecurityTab />}

        {tab === "employers" && <EmployersTab />}

        {tab === "projects" && view === "form" && (
          <ProjectForm
            key={editingProject?.id ?? "new"}
            project={editingProject}
            nextSortOrder={nextSortOrder}
            onSaved={handleSaved}
            onCancel={() => setView("list")}
          />
        )}

        {tab === "projects" && view === "list" && (
          <>
            <div className="admin-list-head">
              <div>{projects.filter((p) => p.highlighted).length} highlighted</div>
              <button className="admin-btn admin-btn-primary" onClick={openNewForm}>
                + New project
              </button>
            </div>

            {actionError && <div className="admin-error">{actionError}</div>}
            {error && <div className="admin-error">{error.message || "Could not load projects."}</div>}

            {loading ? (
              <div className="admin-card">Loading…</div>
            ) : (
              <div className="admin-project-list">
                {projects.map((p, i) => (
                  <div className="admin-project-row" key={p.id}>
                    <div className="admin-project-thumb">
                      {p.imageUrl ? <img src={p.imageUrl} alt="" /> : <span>No image</span>}
                    </div>
                    <div className="admin-project-info">
                      <div className="admin-project-name">{p.name}</div>
                      <div className="admin-project-badges">
                        <span className={`admin-badge admin-badge-${p.status}`}>{p.status}</span>
                        {p.highlighted && <span className="admin-badge admin-badge-highlighted">highlighted</span>}
                      </div>
                    </div>
                    <div className="admin-project-order">
                      <button className="admin-btn admin-btn-small" onClick={() => move(i, -1)} disabled={i === 0}>
                        ↑
                      </button>
                      <button
                        className="admin-btn admin-btn-small"
                        onClick={() => move(i, 1)}
                        disabled={i === projects.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                    <div className="admin-project-actions">
                      <button className="admin-btn admin-btn-small" onClick={() => toggleHighlighted(p)}>
                        {p.highlighted ? "Un-highlight" : "Highlight"}
                      </button>
                      <button className="admin-btn admin-btn-small" onClick={() => openEditForm(p)}>
                        Edit
                      </button>
                      <button
                        className="admin-btn admin-btn-small admin-btn-danger"
                        onClick={() => setDeleteTarget(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {!projects.length && <div className="admin-card">No projects yet.</div>}
              </div>
            )}
          </>
        )}
      </main>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete project?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        busy={deleteBusy}
      />
    </div>
  );
}
