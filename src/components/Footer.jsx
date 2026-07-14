import "./Footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-head">
          <div className="foot-heading">
            <h3 className="display foot-name">
              Stanislav
              <br />
              Poleheshko
            </h3>
            <p className="foot-tagline">
              I turn ambiguous ideas into shipped products, whether that's a
              mobile game, a web platform, or an AI agent. Kraków-based,
              always curious about how things work.
            </p>
          </div>
          <a
            href="/Stanislav-Poleheshko-CV.pdf"
            download="Stanislav-Poleheshko-CV.pdf"
            className="btn foot-cv-btn"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M12 3v12m0 0 4.5-4.5M12 15 7.5 10.5M4 19.5h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download CV
          </a>
        </div>

        <div className="foot-line" />

        <div className="foot-cols">
          <div className="foot-col">
            <h4>Social</h4>
            <a
              href="https://linkedin.com/in/stanislavpoleheshko"
              target="_blank"
              rel="noreferrer"
              className="foot-link"
            >
              LinkedIn ↗
            </a>
          </div>
          <div className="foot-col">
            <h4>Contact</h4>
            <a href="mailto:poleheshko@gmail.com" className="foot-link">
              poleheshko@gmail.com
            </a>
            <a href="tel:+48888557420" className="foot-link">
              +48 888 557 420
            </a>
          </div>
          <div className="foot-col">
            <h4>Location</h4>
            <span className="foot-strong">Kraków, Poland</span>
            <span className="foot-muted">Full work authorization (EU)</span>
          </div>
        </div>

        <div className="foot-line" />

        <div className="foot-bottom">
          <span>
            © 2026 Stanislav Poleheshko Advisory · NIP: 6751819560. All
            rights reserved.
          </span>
          <span>
            Designed &amp; built by <strong>Stanislav Poleheshko</strong>
          </span>
        </div>
      </div>
    </footer>
  );
}
