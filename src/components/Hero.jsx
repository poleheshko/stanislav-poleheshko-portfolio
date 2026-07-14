import { useRef } from "react";
import "./Hero.css";
import { useHeroFit } from "../hooks/useHeroFit";
import { useCharTilt } from "../hooks/useCharTilt";
import { useHeroCenterOnPhoto } from "../hooks/useHeroCenterOnPhoto";

export default function Hero() {
  const heroRef = useRef(null);
  const innerRef = useRef(null);
  const h1Ref = useRef(null);
  const charRef = useRef(null);
  const photoRef = useRef(null);

  useHeroFit(h1Ref);
  useCharTilt(heroRef, charRef);
  useHeroCenterOnPhoto(heroRef, innerRef, photoRef);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <div className="wrap hero-inner" ref={innerRef}>
        <h1 className="display" ref={h1Ref}>
          <span className="hero-line">Hi, I'm</span>{" "}
          <span className="hero-line">Stan</span>
        </h1>
        <div className="hero-row">
          <p className="blurb">
            A PMP-CERTIFIED PROJECT AND DELIVERY MANAGER WITH A BACKGROUND IN
            GAMING, BLOCKCHAIN AND AI IMPLEMENTATION
          </p>
          <div className="char-wrap" ref={photoRef}>
            <img
              className="char"
              ref={charRef}
              src="/ProfileImageCircle1000x.png"
              alt="Stan Poleheshko"
              width="1000"
              height="1000"
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <a href="#contact" className="btn btn-figma-cta">
            Contact Me
          </a>
        </div>
      </div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to next section">
        <span>Discover More</span>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M5 9 L12 16 L19 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}
