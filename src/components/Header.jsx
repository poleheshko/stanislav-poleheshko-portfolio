import { useEffect, useState } from "react";
import "./Header.css";
import StaggeredMenu from "./StaggeredMenu.jsx";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Portfolio" },
  { href: "#contact", label: "Contact" },
];

const STAGGERED_ITEMS = [
  { label: "About", ariaLabel: "Go to about section", link: "#about" },
  { label: "Portfolio", ariaLabel: "Go to portfolio section", link: "#projects" },
  { label: "Contact", ariaLabel: "Go to contact section", link: "#contact" },
  {
    label: "Download CV",
    ariaLabel: "Download CV",
    link: "/Stanislav-Poleheshko-CV.pdf",
    download: "Stanislav-Poleheshko-CV.pdf",
  },
];

const STAGGERED_SOCIALS = [
  { label: "LinkedIn", link: "https://linkedin.com/in/stanislavpoleheshko" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [staggeredOpen, setStaggeredOpen] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
      const hero = document.getElementById("top");
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      setNavHidden(heroBottom < 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClassName = [
    scrolled && "scrolled",
    open && "open",
    navHidden && "nav-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        className={["nav-toggle", open && "open"].filter(Boolean).join(" ")}
        aria-label="Toggle menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={navClassName}>
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hide-sm"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a
          href="/Stanislav-Poleheshko-CV.pdf"
          download="Stanislav-Poleheshko-CV.pdf"
          className="hide-sm"
          onClick={() => setOpen(false)}
        >
          Download CV
        </a>
      </nav>
      <button
        type="button"
        className={"scroll-top-btn" + (navHidden ? " visible" : "")}
        aria-label="Scroll to top"
        onClick={() => {
          if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 });
          else window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            d="M12 19V5M5 12l7-7 7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className={(navHidden || staggeredOpen) ? "sm-visible" : ""}>
        <StaggeredMenu
          isFixed
          items={STAGGERED_ITEMS}
          socialItems={STAGGERED_SOCIALS}
          displaySocials
          displayItemNumbering
          menuButtonColor="#fff"
          openMenuButtonColor="#fff"
          accentColor="#b15cf0"
          colors={["#ff5ea3", "#5b8bf0"]}
          onMenuOpen={() => setStaggeredOpen(true)}
          onMenuClose={() => setStaggeredOpen(false)}
        />
      </div>
    </>
  );
}
