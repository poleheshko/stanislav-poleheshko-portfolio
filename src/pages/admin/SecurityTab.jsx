import { useCallback, useEffect, useState } from "react";
import { challengeAndVerify, enrollTotp, listTotpFactors, unenrollFactor } from "../../lib/auth";

export default function SecurityTab() {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollment, setEnrollment] = useState(null); // { id, totp: { qr_code, secret } }
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listTotpFactors();
      setFactors(list);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load MFA factors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const verifiedFactor = factors.find((f) => f.status === "verified");
  const unverifiedFactor = factors.find((f) => f.status === "unverified");

  async function handleEnroll() {
    setError("");
    setBusy(true);
    try {
      const data = await enrollTotp();
      setEnrollment(data);
    } catch (err) {
      setError(err.message || "Could not start enrollment.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelPending() {
    const factorId = enrollment?.id || unverifiedFactor?.id;
    if (!factorId) return;
    setBusy(true);
    setError("");
    try {
      await unenrollFactor(factorId);
      setEnrollment(null);
      setCode("");
      await reload();
    } catch (err) {
      setError(err.message || "Could not cancel enrollment.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await challengeAndVerify(enrollment.id, code);
      setEnrollment(null);
      setCode("");
      await reload();
    } catch (err) {
      setError(err.message || "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    if (!verifiedFactor) return;
    if (!window.confirm("Disable two-factor authentication for this account?")) return;
    setBusy(true);
    setError("");
    try {
      await unenrollFactor(verifiedFactor.id);
      await reload();
    } catch (err) {
      setError(err.message || "Could not disable 2FA.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="admin-card">Loading…</div>;

  return (
    <div className="admin-card admin-security">
      <h2>Two-factor authentication</h2>

      {error && <div className="admin-error">{error}</div>}

      {verifiedFactor && (
        <>
          <p>2FA is enabled. You'll be asked for a code from your authenticator app on every sign-in.</p>
          <button className="admin-btn admin-btn-danger" onClick={handleDisable} disabled={busy}>
            Disable 2FA
          </button>
        </>
      )}

      {!verifiedFactor && !enrollment && unverifiedFactor && (
        <>
          <p>You have a pending, unverified enrollment. Cancel it to start a fresh one.</p>
          <button className="admin-btn" onClick={handleCancelPending} disabled={busy}>
            Cancel pending enrollment
          </button>
        </>
      )}

      {!verifiedFactor && !enrollment && !unverifiedFactor && (
        <>
          <p>2FA is not enabled. Enable it to require an authenticator code on every sign-in.</p>
          <button className="admin-btn admin-btn-primary" onClick={handleEnroll} disabled={busy}>
            Enable 2FA
          </button>
        </>
      )}

      {enrollment && (
        <form className="admin-totp-enroll" onSubmit={handleVerify}>
          <p>Scan this QR code with your authenticator app (Google Authenticator, 1Password, Authy…):</p>
          <div
            className="admin-qr"
            dangerouslySetInnerHTML={{ __html: enrollment.totp.qr_code }}
          />
          <p className="admin-login-hint">
            Can't scan it? Enter this key manually: <code>{enrollment.totp.secret}</code>
          </p>
          <label className="admin-field">
            <span>Enter the 6-digit code to confirm</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <div className="admin-form-actions">
            <button type="button" className="admin-btn" onClick={handleCancelPending} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
              {busy ? "Verifying…" : "Verify & enable"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
