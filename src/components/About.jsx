import { useRef } from "react";
import "./About.css";
import { useScrollFloat } from "../hooks/useScrollFloat";

export default function About() {
  const floatRef = useRef(null);
  useScrollFloat(floatRef, "ABOUT ME");

  return (
    <section className="about" id="about">
      <div className="wrap">
        <h2 className="display scroll-float" ref={floatRef}>
          <span className="scroll-float-text">ABOUT ME</span>
        </h2>
        <p className="reveal d1">
          IT Project Manager and PMP®-certified professional with 4+ years of
          experience in project coordination and delivery, including
          experience delivering digital products and games in
          technology-driven environments. Proven in managing parallel
          initiatives, coordinating cross-functional teams, translating
          business vision into executable requirements, and maintaining
          delivery focus under limited resources. Experience in games, mobile
          apps, Web3, blockchain-based platforms, and live products.
        </p>
        <a href="#contact" className="btn btn-figma-cta reveal d2">
          Contact Me
        </a>
      </div>
    </section>
  );
}
