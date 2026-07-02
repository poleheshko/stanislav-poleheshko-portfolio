import { useEffect } from "react";

// Tilts the hero character image toward the cursor, plus a scroll-driven
// tilt as the hero scrolls out of view. Both easings are blended each frame.
export function useCharTilt(heroRef, charRef) {
  useEffect(() => {
    const hero = heroRef.current;
    const char = charRef.current;
    if (!hero || !char) return;

    let tRX = 0,
      tRY = 0,
      cRX = 0,
      cRY = 0,
      sRX = 0;
    let rafId;

    function onMouseMove(e) {
      const dx = (e.clientX / window.innerWidth - 0.5) * 2;
      const dy = (e.clientY / window.innerHeight - 0.5) * 2;
      tRY = dx * 22;
      tRX = dy * 13;
    }
    function onScroll() {
      const h = hero.offsetHeight || window.innerHeight;
      sRX = -Math.min(window.scrollY / h, 1) * 30;
    }
    function tick() {
      cRX += (tRX + sRX - cRX) * 0.07;
      cRY += (tRY - cRY) * 0.07;
      char.style.transform = `perspective(700px) rotateX(${cRX}deg) rotateY(${cRY}deg)`;
      rafId = requestAnimationFrame(tick);
    }

    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll);
    rafId = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [heroRef, charRef]);
}
