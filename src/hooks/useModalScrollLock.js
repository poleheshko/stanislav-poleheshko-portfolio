import { useEffect } from "react";

// Locks page scroll while any project modal is open: toggles the
// `modal-lock` class on <html> (see styles/base modal rules) and pauses the
// Lenis smooth-scroll instance so background content can't scroll underneath.
export function useModalScrollLock(isOpen) {
  useEffect(() => {
    document.documentElement.classList.toggle("modal-lock", isOpen);
    if (window.__lenis) {
      isOpen ? window.__lenis.stop() : window.__lenis.start();
    }
  }, [isOpen]);
}
