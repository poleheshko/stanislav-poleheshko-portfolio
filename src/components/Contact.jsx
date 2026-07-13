import { useState } from "react";
import "./Contact.css";

// Formspree endpoint, e.g. https://formspree.io/f/xxxxxxxx — set in .env.
const FORM_ENDPOINT = import.meta.env.VITE_CONTACT_FORM_ENDPOINT;

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | missing | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    const f = e.target;
    if (!f.name.value || !f.email.value || !f.consent.checked) {
      setStatus("missing");
      setTimeout(() => setStatus("idle"), 1600);
      return;
    }

    if (!FORM_ENDPOINT) {
      console.error(
        "Missing VITE_CONTACT_FORM_ENDPOINT. Copy .env.example to .env and set your Formspree form endpoint.",
      );
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(f),
      });
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
      setStatus("sent");
      f.reset();
      setTimeout(() => setStatus("idle"), 2400);
    } catch (err) {
      console.error("Contact form submission failed:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const btnLabel =
    status === "missing"
      ? "Fill required fields"
      : status === "sending"
        ? "Sending…"
        : status === "sent"
          ? "Message Sent ✓"
          : status === "error"
            ? "Something went wrong — try again"
            : "Send";

  return (
    <section className="contact" id="contact">
      <div className="wrap contact-grid">
        <div className="reveal">
          <h2 className="display d-3d-dark">
            LET'S
            <br />
            GET IN
            <br />
            TOUCH
          </h2>
        </div>
        <form className="form reveal d1" noValidate onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name*</label>
            <input type="text" name="name" required />
          </div>
          <div className="field">
            <label>Company</label>
            <input type="text" name="company" />
          </div>
          <div className="field full">
            <label>Email*</label>
            <input type="email" name="email" required />
          </div>
          <div className="field full">
            <label>Message</label>
            <textarea name="msg"></textarea>
          </div>
          <div className="field full consent">
            <label>
              <input type="checkbox" name="consent" required />
              <span>
                I agree to the processing of my personal data provided in
                this form in order to receive a reply to my enquiry
                (GDPR)*
              </span>
            </label>
          </div>
          <div className="send">
            <button
              type="submit"
              className={`btn send-btn${status === "sent" ? " sent" : ""}`}
              disabled={status === "sending"}
            >
              {btnLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
