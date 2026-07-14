import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// On mobile, the address bar hiding/showing while the user scrolls changes
// window height, which triggers ScrollTrigger's auto-refresh mid-scroll and
// can freeze scrub-tied animations (e.g. the About heading char reveal) in a
// half-transformed, garbled-looking state. Ignore those resize events.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
