import { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | missing | sent

  function handleSubmit(e) {
    e.preventDefault();
    const f = e.target;
    if (!f.name.value || !f.email.value) {
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
      {/* glossy chartreuse-gold lightning bolt (right) */}
      <span className="c-obj c-bolt">
        <svg viewBox="0 0 100 124">
          <defs>
            <linearGradient id="bolt" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f4ff7d" />
              <stop offset="42%" stopColor="#c6e23c" />
              <stop offset="76%" stopColor="#93bd20" />
              <stop offset="100%" stopColor="#6f9a12" />
            </linearGradient>
          </defs>
          <path d="M62 6 L24 64 L46 64 L38 118 L84 50 L58 50 Z" fill="url(#bolt)" />
          <path
            d="M58 16 L34 56 L48 56"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".55"
          />
        </svg>
      </span>
      {/* glossy purple knot (left) */}
      <span className="c-obj c-knot">
        <svg viewBox="0 0 120 120">
          <defs>
            <linearGradient id="knot" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c3b0ff" />
              <stop offset="55%" stopColor="#7c5cff" />
              <stop offset="100%" stopColor="#5836d4" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#knot)" strokeWidth="19" strokeLinecap="round">
            <ellipse cx="60" cy="60" rx="35" ry="19" />
            <ellipse cx="60" cy="60" rx="35" ry="19" transform="rotate(60 60 60)" />
            <ellipse cx="60" cy="60" rx="35" ry="19" transform="rotate(120 60 60)" />
          </g>
          <ellipse
            cx="48"
            cy="48"
            rx="9"
            ry="5"
            fill="#fff"
            opacity=".4"
            transform="rotate(-30 48 48)"
          />
        </svg>
      </span>
      <div className="wrap contact-grid">
        <div className="reveal">
          <h2 className="display d-3d-dark">
            LET'S
            <br />
            GET IN
            <br />
            TOUCH
          </h2>
          <a href="mailto:alex@3dturner.com" className="mail">
            alex@3dturner.com
          </a>
        </div>
        <form className="form reveal d1" noValidate onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name*</label>
            <input type="text" name="name" required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input type="tel" name="phone" />
          </div>
          <div className="field full">
            <label>Email*</label>
            <input type="email" name="email" required />
          </div>
          <div className="field full">
            <label>Message</label>
            <textarea name="msg"></textarea>
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
