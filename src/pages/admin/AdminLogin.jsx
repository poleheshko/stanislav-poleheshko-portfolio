import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import { challengeAndVerify, getAssuranceLevel, listTotpFactors, signInWithPassword } from "../../lib/auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState("password"); // "password" | "totp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithPassword(email, password);
      const { currentLevel, nextLevel } = await getAssuranceLevel();
      if (nextLevel === "aal2" && currentLevel === "aal1") {
        const factors = await listTotpFactors();
        const verified = factors.find((f) => f.status === "verified");
        if (!verified) {
          setError("2FA is required for this account but no verified authenticator was found. Contact the site owner.");
          setBusy(false);
          return;
        }
        setFactorId(verified.id);
        setStep("totp");
        setBusy(false);
        return;
      }
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Could not sign in.");
      setBusy(false);
    }
  }

  async function handleTotpSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await challengeAndVerify(factorId, code);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid code.");
      setBusy(false);
    }
  }

  return (
    <div className="admin-screen admin-screen-center">
      <form
        className="admin-card admin-login-card"
        onSubmit={step === "password" ? handlePasswordSubmit : handleTotpSubmit}
      >
        <h1 className="admin-login-title">Admin login</h1>

        {step === "password" ? (
          <>
            <label className="admin-field">
              <span>Email</span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className="admin-field">
              <span>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
          </>
        ) : (
          <>
            <p className="admin-login-hint">Enter the 6-digit code from your authenticator app.</p>
            <label className="admin-field">
              <span>Authentication code</span>
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
          </>
        )}

        {error && <div className="admin-error">{error}</div>}

        <button className="admin-btn admin-btn-primary" type="submit" disabled={busy}>
          {busy ? "Please wait…" : step === "password" ? "Sign in" : "Verify"}
        </button>
      </form>
    </div>
  );
}
