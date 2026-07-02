import { useEffect } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapSetup";

// ScrollFloat (adapted from React Bits): splits a heading into characters
// that rise + scale into place, staggered left -> right, scrubbed to scroll.
export function useScrollFloat(containerRef, text) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const textEl = el.querySelector(".scroll-float-text");
    if (!textEl) return;

    textEl.innerHTML = text
      .split("")
      .map(
        (ch) => `<span class="sf-char chrome">${ch === " " ? "&nbsp;" : ch}</span>`,
      )
      .join("");
    const chars = el.querySelectorAll(".sf-char");

    const tween = gsap.fromTo(
      chars,
      {
        willChange: "opacity, transform",
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: "50% 0%",
      },
      {
        duration: 1,
        ease: "back.inOut(2)",
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: 0.03,
        scrollTrigger: {
          trigger: el,
          start: "top bottom-=10%",
          end: "bottom center+=10%",
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [containerRef, text]);
}
