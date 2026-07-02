import { useEffect } from "react";

// Fits the hero h1 to ~92% of the viewport width (matching the .wrap gutter,
// capped at 1180px). Measures with a Range over the text node so only the
// glyphs are bounded, not the box — then re-measures once "Archivo Black"
// finishes loading, since its metrics differ from the fallback font.
export function useHeroFit(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function fit() {
      el.style.fontSize = "100px";
      const range = document.createRange();
      range.selectNodeContents(el);
      const visual = range.getBoundingClientRect().width;
      const target = Math.min(document.documentElement.clientWidth * 0.92, 1180);
      if (visual > 0) {
        el.style.fontSize = (100 * target) / visual + "px";
      }
    }

    fit();
    window.addEventListener("resize", fit);

    let cancelled = false;
    if (document.fonts && document.fonts.load) {
      document.fonts
        .load('400 1em "Archivo Black"')
        .catch(() => {})
        .then(() => document.fonts.ready)
        .then(() => {
          if (!cancelled) fit();
        });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", fit);
    };
  }, [ref]);
}
