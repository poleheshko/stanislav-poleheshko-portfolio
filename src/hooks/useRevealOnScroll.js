import { useEffect } from "react";

// Scroll reveal: fades/slides in any `.reveal` element the first time it
// enters the viewport. Runs once after the whole page has mounted, mirroring
// the original inline script which ran after all sections existed in the DOM.
export function useRevealOnScroll() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
