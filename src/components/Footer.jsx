import "./Footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-big display">
            STANISLAV
            <br />
            POLEHESHKO
          </div>
          <div className="foot-col">
            <h4>Social</h4>
            <ul>
              <li>
                <a
                  href="https://linkedin.com/in/stanislavpoleheshko"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="mailto:poleheshko@gmail.com">poleheshko@gmail.com</a>
              </li>
              <li>
                <a href="tel:+48888557420">+48 888 557 420</a>
              </li>
              <li>Kraków, Poland</li>
              <li>(Full Work Authorization)</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            © 2026 Stanislav Poleheshko Advisory · NIP: 6751819560. All
            rights reserved.
          </span>
          <span>Designed & built with ♥</span>
        </div>
      </div>
    </footer>
  );
}
