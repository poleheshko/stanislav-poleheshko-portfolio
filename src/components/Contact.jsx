import { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | missing | sent

  function handleSubmit(e) {
    e.preventDefault();
    const f = e.target;
    if (!f.name.value || !f.email.value || !f.consent.checked) {
      setStatus("missing");
      setTimeout(() => setStatus("idle"), 1600);
      return;
    }
    setStatus("sent");
    setTimeout(() => {
      setStatus("idle");
      f.reset();
    }, 2400);
  }

  const btnLabel =
    status === "missing"
      ? "Fill required fields"
      : status === "sent"
        ? "Message Sent ✓"
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
            >
              {btnLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
