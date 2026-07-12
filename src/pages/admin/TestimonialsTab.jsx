import { useEffect, useRef, useState } from "react";
import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonials,
  swapSortOrder,
  updateTestimonial,
} from "../../lib/testimonials";
import { deleteProjectImage, uploadProjectImage } from "../../lib/storage";
import ConfirmModal from "./ConfirmModal.jsx";

// Manage the testimonials shown on the homepage (quotes from colleagues and
// managers). Photos reuse the shared project-images storage bucket.
export default function TestimonialsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list"); // "list" | "form"
  const [editing, setEditing] = useState(null); // testimonial being edited, or null for new
  const [quote, setQuote] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  // A saved photo carries {url, path}; a freshly picked one carries {file, previewUrl}.
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Revoke the preview object URL on unmount (ref keeps this reading the latest).
  const photoRef = useRef(photo);
  photoRef.current = photo;
  useEffect(
    () => () => {
      if (photoRef.current?.previewUrl) URL.revokeObjectURL(photoRef.current.previewUrl);
    },
    [],
  );

  async function loadItems() {
    setLoading(true);
    try {
      setItems(await fetchTestimonials());
      setError("");
    } catch (err) {
      setError(err.message || "Could not load testimonials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function openNew() {
    setEditing(null);
    setQuote("");
    setAuthorName("");
    setAuthorRole("");
    setLinkUrl("");
    setPhoto(null);
    setError("");
    setView("form");
  }

  function openEdit(item) {
    setEditing(item);
    setQuote(item.quote);
    setAuthorName(item.authorName);
    setAuthorRole(item.authorRole || "");
    setLinkUrl(item.linkUrl || "");
    setPhoto(item.photoUrl ? { url: item.photoUrl, path: item.photoPath } : null);
    setError("");
    setView("form");
  }

  function handlePickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be picked again after removal
    if (!file) return;
    setPhoto((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { url: null, path: null, file, previewUrl: URL.createObjectURL(file) };
    });
  }

  function removePhoto() {
    setPhoto((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!quote.trim()) {
      setError("The testimonial text is required.");
      return;
    }
    if (!authorName.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let photoUrl = photo?.url ?? null;
      let photoPath = photo?.path ?? null;
      if (photo?.file) {
        const uploaded = await uploadProjectImage(photo.file);
        photoUrl = uploaded.url;
        photoPath = uploaded.path;
      }

      const row = {
        quote: quote.trim(),
        author_name: authorName.trim(),
        author_role: authorRole.trim() || null,
        link_url: linkUrl.trim() || null,
        photo_url: photoUrl,
        photo_path: photoPath,
      };
      if (editing) {
        await updateTestimonial(editing.id, row);
        // Clean up the replaced/removed photo (best-effort).
        if (editing.photoPath && editing.photoPath !== photoPath) {
          await deleteProjectImage(editing.photoPath);
        }
      } else {
        // New testimonials go to the end of the list.
        const nextSortOrder = items.length ? Math.max(...items.map((t) => t.sortOrder)) + 1 : 1;
        await createTestimonial({ ...row, sort_order: nextSortOrder });
      }

      setView("list");
      setEditing(null);
      await loadItems();
    } catch (err) {
      setError(err.message || "Could not save testimonial.");
    } finally {
      setBusy(false);
    }
  }

  async function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setError("");
    try {
      await swapSortOrder(items[index], items[target]);
      await loadItems();
    } catch (err) {
      setError(err.message || "Could not reorder testimonials.");
    }
  }

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await deleteTestimonial(deleteTarget.id);
      if (deleteTarget.photoPath) await deleteProjectImage(deleteTarget.photoPath);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      setError(err.message || "Could not delete testimonial.");
    } finally {
      setDeleteBusy(false);
    }
  }

  const photoSrc = photo?.previewUrl || photo?.url || null;

  if (view === "form") {
    return (
      <form className="admin-card admin-form" onSubmit={handleSubmit}>
        <h2>{editing ? `Edit “${editing.authorName}”` : "New testimonial"}</h2>

        <label className="admin-field">
          <span>Testimonial *</span>
          <textarea
            required
            rows={5}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="What they said about working with you…"
          />
        </label>

        <label className="admin-field">
          <span>Name *</span>
          <input
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Jane Kowalska"
          />
        </label>

        <label className="admin-field">
          <span>Role / position</span>
          <input
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            placeholder="Engineering Manager, Reality Games"
          />
        </label>

        <label className="admin-field">
          <span>Profile link (LinkedIn or other)</span>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/…"
          />
        </label>

        <div className="admin-field">
          <span>Photo</span>
          {photoSrc && (
            <div className="admin-testimonial-photo-preview">
              <img src={photoSrc} alt="" />
              <button type="button" className="admin-btn admin-btn-small admin-btn-danger" onClick={removePhoto}>
                Remove
              </button>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handlePickPhoto} />
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
        <div>
          {items.length} testimonial{items.length === 1 ? "" : "s"}
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + New testimonial
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-card">Loading…</div>
      ) : (
        <div className="admin-project-list">
          {items.map((t, i) => (
            <div className="admin-project-row" key={t.id}>
              <div className="admin-project-thumb admin-testimonial-thumb">
                {t.photoUrl ? <img src={t.photoUrl} alt="" /> : <span>No photo</span>}
              </div>
              <div className="admin-project-info">
                <div className="admin-project-name">{t.authorName}</div>
                {t.authorRole && <div className="admin-testimonial-role">{t.authorRole}</div>}
                <div className="admin-testimonial-quote">“{t.quote}”</div>
              </div>
              <div className="admin-project-order">
                <button className="admin-btn admin-btn-small" onClick={() => move(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button
                  className="admin-btn admin-btn-small"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                >
                  ↓
                </button>
              </div>
              <div className="admin-project-actions">
                <button className="admin-btn admin-btn-small" onClick={() => openEdit(t)}>
                  Edit
                </button>
                <button className="admin-btn admin-btn-small admin-btn-danger" onClick={() => setDeleteTarget(t)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!items.length && (
            <div className="admin-card">
              No testimonials yet. The homepage section stays hidden until you add one.
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete testimonial?"
        message={`Delete the testimonial from "${deleteTarget?.authorName}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        busy={deleteBusy}
      />
    </>
  );
}
