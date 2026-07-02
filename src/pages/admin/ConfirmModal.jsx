export default function ConfirmModal({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel, busy }) {
  if (!open) return null;
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="admin-modal-actions">
          <button className="admin-btn" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="admin-btn admin-btn-danger" type="button" onClick={onConfirm} disabled={busy}>
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
