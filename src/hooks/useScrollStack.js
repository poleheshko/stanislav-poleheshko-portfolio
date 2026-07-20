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
    const lastTransforms = new Map();
    let ticking = false;

    // The pin/scale stack only reads well when cards are SHORTER than the
    // viewport. Below 1080px the layout switches each card to content height
    // (full-width image banner + text), which on a phone is taller than the
    // space between the pin point and the bottom edge — so pinning would cut
    // the cards off and pile their top strips into an unreadable stack. On
    // mobile we therefore skip the effect entirely and let the cards flow as a
    // plain vertical list (see clearPin + the early return in update). The hook
    // still runs so it can own the global Lenis instance and anchor scrolling.
    const mq = window.matchMedia("(max-width: 1080px)");

    // Pin each card with real CSS `position: sticky` instead of a JS-driven
    // translateY. The old approach recomputed a counter-translate every frame
    // to keep the card glued to the viewport — fine under Lenis (which drives
    // scroll in rAF, so scroll and transform paint together) but it visibly
    // juddered when dragging the native scrollbar, because the browser scrolls
    // on the compositor thread while our transform lags a frame behind on the
    // main thread. Sticky is handled by the compositor, so the pin now tracks
    // ANY scroll input — wheel, trackpad, scrollbar drag — with zero lag.
    // JS is left to animate only the scale (see update()); a one-frame scale
    // lag is imperceptible because it doesn't move the card's position.
    const applyPin = () => {
      cards.forEach((card, i) => {
        if (i < cards.length - 1) card.style.marginBottom = cfg.itemDistance + "px";
        card.style.willChange = "transform";
        card.style.transformOrigin = "top center";
        card.style.backfaceVisibility = "hidden";
        card.style.position = "sticky";
        // stackPosition is a fraction of the viewport; each successive card pins
        // itemStackDistance px lower so they fan into a stack as they collect.
        card.style.top = `calc(${cfg.stackPosition * 100}vh + ${cfg.itemStackDistance * i}px)`;
        // later cards paint over earlier ones as they stack on top
        card.style.zIndex = String(i + 1);
      });
    };

    // Strip every inline style applyPin set so the cards fall back to normal
    // document flow (spacing handled by CSS). Used on mobile and when resizing
    // down across the breakpoint.
    const clearPin = () => {
      cards.forEach((card) => {
        card.style.marginBottom = "";
        card.style.willChange = "";
        card.style.transformOrigin = "";
        card.style.backfaceVisibility = "";
        card.style.position = "";
        card.style.top = "";
        card.style.zIndex = "";
        card.style.transform = "";
      });
      lastTransforms.clear();
    };

    if (mq.matches) clearPin();
    else applyPin();

    // Measure a card's LAYOUT top by walking the offsetParent chain.
    // offsetTop is unaffected by CSS transforms and by position: sticky,
    // whereas getBoundingClientRect() would include the per-frame scale (and
    // the sticky shift) — reading that back would feed our own output into the
    // next frame's math, making the scale progress oscillate.
    const layoutTop = (el) => {
      let y = 0;
      for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
      return y;
    };
    const progress = (s, a, b) => (s < a ? 0 : s > b ? 1 : (s - a) / (b - a));

    // Position is handled entirely by `position: sticky`; here we only animate
    // each card's scale as it approaches its pin point, so the stack "settles"
    // as cards collect. No translateY — that's what used to judder.
    function update() {
      ticking = false;
      // Stacking is disabled on mobile — cards flow normally, no scale.
      if (mq.matches) return;
      const scrollTop = window.scrollY;
      const vh = window.innerHeight;
      const stackPx = cfg.stackPosition * vh;
      const scaleEndPx = cfg.scaleEndPosition * vh;

      cards.forEach((card, i) => {
        const cardTop = layoutTop(card);
        const triggerStart = cardTop - stackPx - cfg.itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPx;

        const sp = progress(scrollTop, triggerStart, triggerEnd);
        const targetScale = cfg.baseScale + i * cfg.itemScale;
        const scale = 1 - sp * (1 - targetScale);
        const rotation = cfg.rotationAmount ? i * cfg.rotationAmount * sp : 0;

        const nt = {
          scale: Math.round(scale * 1000) / 1000,
          rotation: Math.round(rotation * 100) / 100,
        };
        const lt = lastTransforms.get(i);
        const changed =
          !lt ||
          Math.abs(lt.scale - nt.scale) > 0.001 ||
          Math.abs(lt.rotation - nt.rotation) > 0.1;
        if (changed) {
          card.style.transform = `scale(${nt.scale}) rotate(${nt.rotation}deg)`;
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

    // Re-apply or tear down the pin when the viewport crosses the breakpoint.
    const onModeChange = () => {
      if (mq.matches) clearPin();
      else applyPin();
      update();
    };
    mq.addEventListener("change", onModeChange);

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
      touchMultiplier: 1,
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
      mq.removeEventListener("change", onModeChange);
      gsap.ticker.remove(rafTick);
      anchorCleanups.forEach((cleanup) => cleanup());
      lenis.destroy();
      if (window.__lenis === lenis) window.__lenis = undefined;
    };
  }, [containerRef, ready]);
}
