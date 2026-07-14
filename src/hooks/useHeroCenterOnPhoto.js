import { useEffect } from "react";

// The hero heading + photo + row are centered as one flex group by default,
// which visually skews the block since the heading is much taller than the
// photo. This shifts the whole group vertically so the photo's center lands
// on the hero's vertical center instead, while every gap inside the group
// (heading-to-photo, photo-to-row) stays exactly as authored in CSS.
export function useHeroCenterOnPhoto(heroRef, innerRef, photoRef) {
  useEffect(() => {
    const hero = heroRef.current;
    const inner = innerRef.current;
    const photo = photoRef.current;
    if (!hero || !inner || !photo) return;

    function center() {
      inner.style.transform = "";
      const heroRect = hero.getBoundingClientRect();
      const innerRect = inner.getBoundingClientRect();
      const photoRect = photo.getBoundingClientRect();
      let delta =
        heroRect.top + heroRect.height / 2 - (photoRect.top + photoRect.height / 2);
      // On short windows perfect centering would push the group outside the
      // hero's padding box (heading under the nav / CTA past the fold) —
      // clamp the shift to whatever slack actually exists.
      const heroStyles = getComputedStyle(hero);
      const minDelta =
        heroRect.top + parseFloat(heroStyles.paddingTop) - innerRect.top;
      const maxDelta =
        heroRect.bottom - parseFloat(heroStyles.paddingBottom) - innerRect.bottom;
      delta =
        minDelta <= maxDelta
          ? Math.min(Math.max(delta, minDelta), maxDelta)
          : 0;
      inner.style.transform = delta ? `translateY(${delta}px)` : "";
    }

    center();

    const ro = new ResizeObserver(center);
    ro.observe(hero);
    ro.observe(inner);
    ro.observe(photo);
    window.addEventListener("resize", center);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", center);
    };
  }, [heroRef, innerRef, photoRef]);
}
