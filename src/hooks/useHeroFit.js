import { useEffect } from "react";

// Fits the hero h1 to ~92% of the viewport width (matching the .wrap gutter,
// capped at 1180px). Measures with a Range over the text node so only the
// glyphs are bounded, not the box — then re-measures once "Archivo Black"
// finishes loading, since its metrics differ from the fallback font.
// Below the hero's mobile breakpoint the heading renders as two block lines
// ("Hi, I'm" / "Stan"); the Range union rect then reports the widest line, so
// the same width fit still applies. The height cap keeps the (now much
// taller) fitted heading from eating the viewport on short, wide windows.
export function useHeroFit(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function fit() {
      el.style.fontSize = "100px";
      // In stacked (two-line) mode each .hero-line is display:block, and a
      // Range over a block box reports the full container width, not the
      // glyphs — so measure each line's contents separately and fit the
      // widest one. In single-line mode measure the whole heading as before.
      const lines = Array.from(el.querySelectorAll(".hero-line"));
      const stacked =
        lines.length > 1 && getComputedStyle(lines[0]).display === "block";
      const parts = stacked ? lines : [el];
      let width = 0;
      let top = Infinity;
      let bottom = -Infinity;
      for (const part of parts) {
        const range = document.createRange();
        range.selectNodeContents(part);
        const rect = range.getBoundingClientRect();
        width = Math.max(width, rect.width);
        top = Math.min(top, rect.top);
        bottom = Math.max(bottom, rect.bottom);
      }
      const target = Math.min(document.documentElement.clientWidth * 0.92, 1180);
      if (width > 0) {
        let size = (100 * target) / width;
        let maxHeight = window.innerHeight * 0.38;
        if (stacked) {
          // The centering hook pins the photo's center to the hero's center,
          // so the heading can only occupy the space above the photo minus
          // clearance for the fixed header — cap it or it slides under the nav
          // on short windows.
          const photo = el.closest(".hero")?.querySelector(".char-wrap");
          const photoHalf = (photo?.offsetWidth || 380) / 2;
          maxHeight = Math.max(
            100,
            Math.min(maxHeight, window.innerHeight / 2 - photoHalf - 60)
          );
        }
        const fittedHeight = (bottom - top) * (size / 100);
        if (fittedHeight > maxHeight) {
          size *= maxHeight / fittedHeight;
        }
        el.style.fontSize = size + "px";
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
