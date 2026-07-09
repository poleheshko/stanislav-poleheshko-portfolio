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
      const photoRect = photo.getBoundingClientRect();
      const delta =
        heroRect.top + heroRect.height / 2 - (photoRect.top + photoRect.height / 2);
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
