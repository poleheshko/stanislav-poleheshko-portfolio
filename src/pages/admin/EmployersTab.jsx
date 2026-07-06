import { useEffect, useRef, useState } from "react";
import { createEmployer, deleteEmployer, fetchEmployers, updateEmployer } from "../../lib/employers";
import { deleteProjectImage, uploadProjectImage } from "../../lib/storage";
import ConfirmModal from "./ConfirmModal.jsx";

// Manage the reusable list of employers/clients a project can be attributed to.
// Logos reuse the shared project-images storage bucket via uploadProjectImage.
export default function EmployersTab() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list"); // "list" | "form"
  const [editing, setEditing] = useState(null); // employer being edited, or null for new
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  // Saved logos carry {url, path}; a freshly picked one carries {file, previewUrl}.
  const [logo, setLogo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Revoke the preview object URL on unmount (ref keeps this reading the latest).
  const logoRef = useRef(logo);
  logoRef.current = logo;
  useEffect(
    () => () => {
      if (logoRef.current?.previewUrl) URL.revokeObjectURL(logoRef.current.previewUrl);
    },
    [],
  );

  async function loadEmployers() {
    setLoading(true);
    try {
      setEmployers(await fetchEmployers());
      setError("");
    } catch (err) {
      setError(err.message || "Could not load employers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployers();
  }, []);

  function openNew() {
    setEditing(null);
    setName("");
    setWebsiteUrl("");
    setLogo(null);
    setError("");
    setView("form");
  }

  function openEdit(employer) {
    setEditing(employer);
    setName(employer.name);
    setWebsiteUrl(employer.websiteUrl || "");
    setLogo(employer.logoUrl ? { url: employer.logoUrl, path: employer.logoPath } : null);
    setError("");
    setView("form");
  }

  function handlePickLogo(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be picked again after removal
    if (!file) return;
    setLogo((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { url: null, path: null, file, previewUrl: URL.createObjectURL(file) };
    });
  }

  function removeLogo() {
    setLogo((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let logoUrl = logo?.url ?? null;
      let logoPath = logo?.path ?? null;
      if (logo?.file) {
        const uploaded = await uploadProjectImage(logo.file);
        logoUrl = uploaded.url;
        logoPath = uploaded.path;
      }

      const row = {
        name: name.trim(),
        logo_url: logoUrl,
        logo_path: logoPath,
        website_url: websiteUrl.trim() || null,
      };
      if (editing) {
        await updateEmployer(editing.id, row);
        // Clean up the replaced/removed logo (best-effort).
        if (editing.logoPath && editing.logoPath !== logoPath) {
          await deleteProjectImage(editing.logoPath);
        }
      } else {
        await createEmployer(row);
      }

      setView("list");
      setEditing(null);
      await loadEmployers();
    } catch (err) {
      setError(err.message || "Could not save employer.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await deleteEmployer(deleteTarget.id);
      if (deleteTarget.logoPath) await deleteProjectImage(deleteTarget.logoPath);
      setDeleteTarget(null);
      await loadEmployers();
    } catch (err) {
      setError(err.message || "Could not delete employer.");
    } finally {
      setDeleteBusy(false);
    }
  }

  const logoSrc = logo?.previewUrl || logo?.url || null;

  if (view === "form") {
    return (
      <form className="admin-card admin-form" onSubmit={handleSubmit}>
        <h2>{editing ? `Edit “${editing.name}”` : "New employer"}</h2>

        <label className="admin-field">
          <span>Name *</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Reality Games" />
        </label>

        <label className="admin-field">
          <span>Website URL</span>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </label>

        <div className="admin-field">
          <span>Logo</span>
          {logoSrc && (
            <div className="admin-employer-logo-preview">
              <img src={logoSrc} alt="" />
              <button type="button" className="admin-btn admin-btn-small admin-btn-danger" onClick={removeLogo}>
                Remove
              </button>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handlePickLogo} />
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-actions">
          <button type="button" className="admin-btn" onClick={() => setView("list")} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="admin-list-head">
        <div>{employers.length} employer{employers.length === 1 ? "" : "s"}</div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + New employer
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-card">Loading…</div>
      ) : (
        <div className="admin-project-list">
          {employers.map((emp) => (
            <div className="admin-project-row" key={emp.id}>
              <div className="admin-project-thumb admin-employer-thumb">
                {emp.logoUrl ? <img src={emp.logoUrl} alt="" /> : <span>No logo</span>}
              </div>
              <div className="admin-project-info">
                <div className="admin-project-name">{emp.name}</div>
              </div>
              <div className="admin-project-actions">
                <button className="admin-btn admin-btn-small" onClick={() => openEdit(emp)}>
                  Edit
                </button>
                <button className="admin-btn admin-btn-small admin-btn-danger" onClick={() => setDeleteTarget(emp)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!employers.length && <div className="admin-card">No employers yet.</div>}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete employer?"
        message={`Delete "${deleteTarget?.name}"? Projects linked to it will keep working — they just won't show a client tag or logo anymore.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        busy={deleteBusy}
      />
    </>
  );
}
