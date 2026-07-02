import { useRef } from "react";
import "./About.css";
import { useScrollFloat } from "../hooks/useScrollFloat";

export default function About() {
  const floatRef = useRef(null);
  useScrollFloat(floatRef, "ABOUT ME");

  return (
    <section className="about" id="about">
      {/* chrome liquid-metal flower (top-left) */}
      <span className="float-obj fo-chrome">
        <svg viewBox="0 0 120 120">
          <defs>
            <radialGradient id="chr" cx="38%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="42%" stopColor="#d2d9e6" />
              <stop offset="74%" stopColor="#8b94a6" />
              <stop offset="100%" stopColor="#565d6e" />
            </radialGradient>
          </defs>
          <g fill="url(#chr)">
            <circle cx="60" cy="30" r="23" />
            <circle cx="89" cy="51" r="23" />
            <circle cx="78" cy="86" r="23" />
            <circle cx="42" cy="86" r="23" />
            <circle cx="31" cy="51" r="23" />
            <circle cx="60" cy="60" r="27" />
          </g>
          <ellipse cx="49" cy="40" rx="14" ry="8" fill="#fff" opacity=".75" />
        </svg>
      </span>
      {/* blue faceted gem (top-right) */}
      <span className="float-obj fo-gem">
        <svg viewBox="0 0 120 120">
          <defs>
            <linearGradient id="gemA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#86c8ff" />
              <stop offset="1" stopColor="#2c5cd8" />
            </linearGradient>
            <linearGradient id="gemB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b3e2ff" />
              <stop offset="1" stopColor="#3f7be0" />
            </linearGradient>
          </defs>
          <polygon points="40,18 72,28 60,70 28,58" fill="url(#gemA)" />
          <polygon points="72,28 98,48 80,84 60,70" fill="url(#gemB)" />
          <polygon points="28,58 60,70 52,102 26,86" fill="#3a6fd0" />
          <polygon points="60,70 80,84 66,106 52,102" fill="#5a92ea" />
          <polygon
            points="40,18 72,28 58,40 44,34"
            fill="#d6efff"
            opacity=".85"
          />
        </svg>
      </span>
      {/* red glossy heart (bottom-left) */}
      <span className="float-obj fo-heart">
        <svg viewBox="0 0 120 120">
          <defs>
            <radialGradient id="rh" cx="38%" cy="28%" r="78%">
              <stop offset="0" stopColor="#ff8294" />
              <stop offset="45%" stopColor="#ef2d4e" />
              <stop offset="100%" stopColor="#a90c29" />
            </radialGradient>
          </defs>
          <path
            d="M60 102 C18 70 14 42 33 30 C48 20 60 33 60 44 C60 33 72 20 87 30 C106 42 102 70 60 102 Z"
            fill="url(#rh)"
          />
          <ellipse cx="43" cy="43" rx="12" ry="7" fill="#fff" opacity=".6" />
        </svg>
      </span>
      {/* purple flower w/ yellow center (bottom-right) */}
      <span className="float-obj fo-purple">
        <svg viewBox="0 0 120 120">
          <defs>
            <radialGradient id="pf" cx="40%" cy="33%" r="72%">
              <stop offset="0" stopColor="#cda6ff" />
              <stop offset="58%" stopColor="#9b5de5" />
              <stop offset="100%" stopColor="#6a32c0" />
            </radialGradient>
          </defs>
          <g fill="url(#pf)">
            <ellipse cx="60" cy="29" rx="18" ry="23" />
            <ellipse
              cx="89"
              cy="52"
              rx="18"
              ry="23"
              transform="rotate(72 89 52)"
            />
            <ellipse
              cx="77"
              cy="87"
              rx="18"
              ry="23"
              transform="rotate(144 77 87)"
            />
            <ellipse
              cx="43"
              cy="87"
              rx="18"
              ry="23"
              transform="rotate(216 43 87)"
            />
            <ellipse
              cx="31"
              cy="52"
              rx="18"
              ry="23"
              transform="rotate(288 31 52)"
            />
          </g>
          <circle cx="60" cy="60" r="16" fill="#ffce3a" />
          <circle cx="54" cy="54" r="5" fill="#fff" opacity=".55" />
        </svg>
      </span>
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
