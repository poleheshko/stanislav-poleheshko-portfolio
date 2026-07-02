import "./Footer.css";

const GEO = [
  { c: "#ff5ea3", p: "M21 4 L38 21 L21 38 L4 21 Z" },
  {
    c: "#5bd17a",
    p: "M21 6 q12 0 12 15 q-15 0 -15 12 q0 -12 -15 -12 q15 0 18 -15",
  },
  { c: "#5b8bf0", p: "M21 5 a16 16 0 1 0 .1 0 Z" },
  { c: "#b15cf0", p: "M6 21 q15 -18 30 0 q-15 18 -30 0" },
  { c: "#ff7a59", p: "M21 5 L37 35 L5 35 Z" },
  {
    c: "#ffd166",
    p: "M21 4 L26 16 L38 21 L26 26 L21 38 L16 26 L4 21 L16 16 Z",
  },
  { c: "#48cae4", p: "M6 6 h30 v30 h-30 Z" },
  {
    c: "#f15bb5",
    p: "M21 6 C10 6 6 14 6 21 C6 30 14 36 21 36 C28 36 36 30 36 21 C36 14 32 6 21 6 Z M21 14 a7 7 0 1 1 0 14 a7 7 0 0 1 0 -14",
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-big display">
            ALEX
            <br />
            TURNER
          </div>
          <div className="foot-col">
            <h4>Social</h4>
            <ul>
              <li>
                <a href="#">Instagram</a>
              </li>
              <li>
                <a href="#">Facebook</a>
              </li>
              <li>
                <a href="#">Artstation</a>
              </li>
              <li>
                <a href="#">Behance</a>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="mailto:alex@3dturner.com">alex@3dturner.com</a>
              </li>
              <li>+1 (555) 123-4567</li>
              <li>123 Creative Lane, Suite 45</li>
              <li>Design City, CA 90210</li>
            </ul>
          </div>
        </div>
        <div className="icon-row">
          {GEO.map((g, i) => (
            <div className="geo" key={i}>
              <svg viewBox="0 0 42 42" width="42" height="42">
                <path d={g.p} fill={g.c} />
              </svg>
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>© 2026 Alex Turner. All rights reserved.</span>
          <span>Designed & built with ♥</span>
        </div>
      </div>
    </footer>
  );
}
