import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../lib/gsapSetup";

// ScrollStack (adapted from React Bits, window-scroll variant). Pins each
// project card near the top of the viewport and stacks the cards with a
// progressive scale as you scroll. Driven by native window scroll — not
// Lenis — so it keeps working even if Lenis's own scroll event ever fails to
// fire (init race, a conflicting script, a browser extension); Lenis is
// layered on top purely to smooth the motion. Also owns the single global
// Lenis instance (window.__lenis) used to pause/resume scroll for modals,
// and wires smooth-scroll for in-page anchor links.
const cfg = {
  itemDistance: 100, // gap between cards before stacking (px)
  itemScale: 0.03, // scale increment per card
  itemStackDistance: 30, // offset between stacked cards (px)
  stackPosition: 0.2, // where stacking begins (fraction of viewport)
  scaleEndPosition: 0.1, // where scaling ends (fraction of viewport)
  baseScale: 0.85, // scale of the first card in the stack
  rotationAmount: 0, // per-card rotation (deg)
  blurAmount: 0, // blur for cards deeper in the stack (px)
};

// `ready` lets callers whose cards render asynchronously (e.g. fetched data)
// delay setup until the cards actually exist in the DOM — the effect reads
// them synchronously on mount, so if it ran while the container was still
// empty it would bail out and never initialize Lenis for the whole page.
export function useScrollStack(containerRef, ready = true) {
  useEffect(() => {
    if (!ready) return;
    const scroller = containerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.querySelectorAll(".scroll-stack-card"));
    if (!cards.length) return;
    const endEl = scroller.querySelector(".scroll-stack-end");
    const lastTransforms = new Map();
    let ticking = false;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = cfg.itemDistance + "px";
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
    });

    // Measure a card's LAYOUT top by walking the offsetParent chain.
    // offsetTop is unaffected by CSS transforms, whereas
    // getBoundingClientRect() includes the translateY/scale we apply each
    // frame — reading that back would feed our own transform into the next
    // frame's math, making the cards fight the scroll and stutter.
    const layoutTop = (el) => {
      let y = 0;
      for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
      return y;
    };
    const progress = (s, a, b) => (s < a ? 0 : s > b ? 1 : (s - a) / (b - a));

    function update() {
      ticking = false;
      const scrollTop = window.scrollY;
      const vh = window.innerHeight;
      const stackPx = cfg.stackPosition * vh;
      const scaleEndPx = cfg.scaleEndPosition * vh;
      const endTop = endEl ? layoutTop(endEl) : 0;

      cards.forEach((card, i) => {
        const cardTop = layoutTop(card);
        const triggerStart = cardTop - stackPx - cfg.itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPx;
        const pinStart = triggerStart;
        const pinEnd = endTop - vh / 2;

        const sp = progress(scrollTop, triggerStart, triggerEnd);
        const targetScale = cfg.baseScale + i * cfg.itemScale;
        const scale = 1 - sp * (1 - targetScale);
        const rotation = cfg.rotationAmount ? i * cfg.rotationAmount * sp : 0;

        let blur = 0;
        if (cfg.blurAmount) {
          let topIdx = 0;
          for (let j = 0; j < cards.length; j++) {
            const jStart = layoutTop(cards[j]) - stackPx - cfg.itemStackDistance * j;
            if (scrollTop >= jStart) topIdx = j;
          }
          if (i < topIdx) blur = Math.max(0, (topIdx - i) * cfg.blurAmount);
        }

        let translateY = 0;
        if (scrollTop >= pinStart && scrollTop <= pinEnd) {
          translateY = scrollTop - cardTop + stackPx + cfg.itemStackDistance * i;
        } else if (scrollTop > pinEnd) {
          translateY = pinEnd - cardTop + stackPx + cfg.itemStackDistance * i;
        }

        const nt = {
          translateY: Math.round(translateY * 100) / 100,
          scale: Math.round(scale * 1000) / 1000,
          rotation: Math.round(rotation * 100) / 100,
          blur: Math.round(blur * 100) / 100,
        };
        const lt = lastTransforms.get(i);
        const changed =
          !lt ||
          Math.abs(lt.translateY - nt.translateY) > 0.1 ||
          Math.abs(lt.scale - nt.scale) > 0.001 ||
          Math.abs(lt.rotation - nt.rotation) > 0.1 ||
          Math.abs(lt.blur - nt.blur) > 0.1;
        if (changed) {
          card.style.transform = `translate3d(0, ${nt.translateY}px, 0) scale(${nt.scale}) rotate(${nt.rotation}deg)`;
          card.style.filter = nt.blur > 0 ? `blur(${nt.blur}px)` : "";
          lastTransforms.set(i, nt);
        }
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    // Always drive the stack from the native window scroll event. This must
    // never depend solely on Lenis firing correctly.
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Smooth scroll via Lenis — this is what gives the effect its glide.
    // Lenis drives the real window scroll, so window.scrollY stays accurate
    // and the page's other scroll handlers (nav, char tilt) keep working; it
    // just interpolates the motion. We ALSO hook its own scroll event for
    // tighter sync, and share GSAP's ticker so ScrollFloat stays in sync, but
    // onScroll above is what actually guarantees updates happen.
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
      infinite: false,
    });
    window.__lenis = lenis;
    lenis.on("scroll", onScroll);
    lenis.on("scroll", ScrollTrigger.update);
    const rafTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(rafTick);
    gsap.ticker.lagSmoothing(0);

    // keep in-page nav anchors smooth (Lenis disables CSS smooth scroll)
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    const anchorCleanups = anchors.map((a) => {
      const handler = (e) => {
        const id = a.getAttribute("href");
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target);
          }
        }
      };
      a.addEventListener("click", handler);
      return () => a.removeEventListener("click", handler);
    });

    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      gsap.ticker.remove(rafTick);
      anchorCleanups.forEach((cleanup) => cleanup());
      lenis.destroy();
      if (window.__lenis === lenis) window.__lenis = undefined;
    };
  }, [containerRef, ready]);
}
