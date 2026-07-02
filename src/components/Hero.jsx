import { useRef } from "react";
import "./Hero.css";
import { useHeroFit } from "../hooks/useHeroFit";
import { useCharTilt } from "../hooks/useCharTilt";

const BRANDS = [
  {
    n: "ProtoSphere",
    s: "Connection",
    ic: '<circle cx="13" cy="13" r="11" stroke="#ddd" stroke-width="2" fill="none"/><circle cx="13" cy="8" r="2.4" fill="#ddd"/><circle cx="8" cy="17" r="2.4" fill="#ddd"/><circle cx="18" cy="17" r="2.4" fill="#ddd"/>',
  },
  {
    n: "Thelma Watson",
    s: "Artist & Illustrator",
    ic: '<path d="M2 16 q4 -8 7 0 t7 0 t7 0" stroke="#ddd" stroke-width="2.2" fill="none"/>',
  },
  {
    n: "Impact Creative",
    s: "Studio",
    ic: '<path d="M5 5 L21 21 M21 5 L5 21" stroke="#ddd" stroke-width="2.6"/>',
  },
  {
    n: "SCALER",
    s: "Brand Experience",
    ic: '<rect x="4" y="4" width="18" height="18" rx="3" stroke="#ddd" stroke-width="2" fill="none"/><path d="M9 17 L17 9 M17 9 h-5 M17 9 v5" stroke="#ddd" stroke-width="2"/>',
  },
  {
    n: "Pixel Forge",
    s: "Visual Lab",
    ic: '<path d="M6 22 V8 M11 22 V4 M16 22 V10 M21 22 V6" stroke="#ddd" stroke-width="2.4" stroke-linecap="round"/>',
  },
  {
    n: "Violeta Rua",
    s: "Design Studio",
    ic: '<path d="M13 3 L23 9 V19 L13 25 L3 19 V9 Z" stroke="#ddd" stroke-width="1.8" fill="none"/>',
  },
];

export default function Hero() {
  const heroRef = useRef(null);
  const h1Ref = useRef(null);
  const charRef = useRef(null);

  useHeroFit(h1Ref);
  useCharTilt(heroRef, charRef);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <div className="wrap hero-inner">
        <h1 className="display" ref={h1Ref}>
          Hi, I'm Stan
        </h1>
        <div className="char-wrap">
          <img
            className="char"
            ref={charRef}
            src="/ProfileImageCircle1000x.png"
            alt="Profile photo"
          />
        </div>
        <div className="hero-row">
          <p className="blurb">
            A PMP-CERTIFIED PROJECT AND DELIVERY MANAGER WITH A BACKGROUND IN
            GAMING, BLOCKCHAIN AND AI IMPLEMENTATION
          </p>
          <a href="#contact" className="btn btn-figma-cta">
            Contact Me
          </a>
        </div>
      </div>
      <div className="wrap brand-row">
        {BRANDS.map((b) => (
          <div className="brand" key={b.n}>
            <svg viewBox="0 0 26 26" dangerouslySetInnerHTML={{ __html: b.ic }} />
            <span className="bt">
              <b>{b.n}</b>
              <span>{b.s}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
