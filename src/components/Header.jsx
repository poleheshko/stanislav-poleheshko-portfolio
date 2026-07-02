import { useEffect, useState } from "react";
import "./Header.css";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Customers" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClassName = [scrolled && "scrolled", open && "open"]
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
      </nav>
    </>
  );
}
