import { useEffect, useRef, useState } from "react";
import "./Testimonials.css";

// Builds up to two uppercase initials from a name, for the avatar fallback when
// a testimonial has no photo.
function initialsOf(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const sectionRef = useRef(null);

  // Fetched separately from projects (its own tiny query). The Supabase client
  // is dynamically imported so it stays off the homepage's critical path,
  // mirroring useProjects.
  useEffect(() => {
    let active = true;
    import("../lib/testimonials")
      .then(({ fetchTestimonials }) => fetchTestimonials())
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        // On error we leave the section hidden rather than showing an empty shell.
      });
    return () => {
      active = false;
    };
  }, []);

  // The global useRevealOnScroll observer scans the DOM once on mount, before
  // these cards exist (they arrive async). Run a local observer so they still
  // fade in as they enter the viewport.
  useEffect(() => {
    if (!items.length) return;
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
    sectionRef.current?.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  // Hidden entirely when there are no testimonials yet.
  if (!items.length) return null;

  const cols = [[], [], []];
  items.forEach((t, i) => cols[i % 3].push(t));

  return (
    <section className="testi" id="testimonials" ref={sectionRef}>
      <div className="wrap">
        <h2 className="display chrome reveal">
          What Colleagues
          <br />
          Are Saying
        </h2>
        <div className="tcols">
          {cols.map((col, ci) => (
            <div className={`tcol${ci === 1 ? " mid" : ""}`} key={ci}>
              {col.map((t, i) => {
                const hue = (ci * 97 + i * 53) % 360;
                return (
                  <div
                    className="tcard reveal"
                    key={t.id}
                    style={{ transitionDelay: `${i * 0.07 + ci * 0.05}s` }}
                  >
                    <p>{t.quote}</p>
                    <div className="who">
                      {t.photoUrl ? (
                        <div
                          className="av"
                          style={{ backgroundImage: `url(${t.photoUrl})` }}
                        ></div>
                      ) : (
                        <div
                          className="av av-fallback"
                          style={{
                            background: `linear-gradient(135deg,hsl(${hue},45%,60%),hsl(${(hue + 40) % 360},45%,40%))`,
                          }}
                        >
                          {initialsOf(t.authorName)}
                        </div>
                      )}
                      <div className="who-txt">
                        <div className="nm">{t.authorName}</div>
                        {t.authorRole && <div className="ro">{t.authorRole}</div>}
                      </div>
                      {t.linkUrl && (
                        <a
                          className="who-link"
                          href={t.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${t.authorName} — profile`}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 17 17 7M9 7h8v8"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
