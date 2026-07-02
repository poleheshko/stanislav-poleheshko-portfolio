import { Fragment, useEffect, useState } from "react";
import "./ProjectModal.css";
import "./ProjectDetailModal.css";

// Shared between the real detail modal and the admin live preview panel.
export function CaseStudyContent({ project }) {
  const [shotIndex, setShotIndex] = useState(0);

  const cs = project.caseStudy || {};
  const shots = cs.shots || [];
  const role = cs.role || [];
  const techTags = cs.techTags || [];
  const results = cs.results || [];
  const testimonial = cs.testimonial || { quote: "", by: "" };
  const hasMultiple = shots.length > 1;
  const activeIndex = shots.length ? shotIndex % shots.length : 0;
  const shotLabel = shots.length
    ? shots[activeIndex]
    : `product preview — ${project.name.toLowerCase()} ui`;

  return (
    <>
      <div className="cs-gallery">
        <div
          className="cs-shot"
          style={
            project.imageUrl
              ? {
                  backgroundImage: `url(${project.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {hasMultiple && (
            <>
              <div
                className="cs-shot-nav prev"
                onClick={() =>
                  setShotIndex((i) => (i - 1 + shots.length) % shots.length)
                }
              >
                ‹
              </div>
              <div
                className="cs-shot-nav next"
                onClick={() => setShotIndex((i) => (i + 1) % shots.length)}
              >
                ›
              </div>
            </>
          )}
          {!project.imageUrl && <span>{shotLabel}</span>}
        </div>
        {hasMultiple && (
          <>
            <div className="cs-shot-counter">
              {activeIndex + 1} / {shots.length}
            </div>
            <div className="cs-thumbs">
              {shots.map((s, i) => (
                <div
                  key={i}
                  className={`cs-thumb${i === activeIndex ? " active" : ""}`}
                  onClick={() => setShotIndex(i)}
                >
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="eyebrow grad">{cs.eyebrow}</div>
      <h1 className="title">{cs.title}</h1>
      <p className="subtitle">{cs.summary}</p>
      <div className="cs-chips">
        <span className="cs-chip role">{cs.roleTag}</span>
        {techTags.map((t) => (
          <span className="cs-chip" key={t}>
            {t}
          </span>
        ))}
      </div>
      <div className="cs-section">
        <div className="h">Problem & Goal</div>
        <p>{cs.problem}</p>
      </div>
      <div className="cs-section">
        <div className="h">Role & Responsibilities</div>
        <div className="cs-role-grid">
          {role.map(([k, v], i) => (
            <Fragment key={i}>
              <div className="k">{k}</div>
              <div className="v">{v}</div>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="cs-section">
        <div className="h">Approach</div>
        <p>{cs.approach}</p>
      </div>
      <div className="cs-section">
        <div className="h">Results & Metrics</div>
        <div className="cs-results">
          {results.map((r, i) => (
            <div className="cs-stat" key={i}>
              <div className="val">{r.val}</div>
              <div className="lbl">{r.lbl}</div>
              <div className="hint">add data</div>
            </div>
          ))}
        </div>
      </div>
      <div className="cs-section">
        <div className="h">Testimonial</div>
        <div className="cs-testimonial">
          <div className="quote-mark">"</div>
          <p>{testimonial.quote}</p>
          <div className="by">— {testimonial.by}</div>
        </div>
      </div>
    </>
  );
}

export default function ProjectDetailModal({ project, onClose }) {
  const open = !!project;
  // Keep rendering the last-opened project's content while the modal fades
  // out, instead of unmounting it immediately (mirrors the original, which
  // never cleared the modal's markup on close — only the CSS class toggled).
  const [displayProject, setDisplayProject] = useState(project);

  useEffect(() => {
    if (project) setDisplayProject(project);
  }, [project]);

  if (!displayProject) {
    return <div className="proj-modal-overlay cs-overlay" />;
  }

  return (
    <div
      className={`proj-modal-overlay cs-overlay${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="proj-modal cs-modal" data-lenis-prevent>
        <div className="proj-modal-close" onClick={onClose}>
          ×
        </div>
        <CaseStudyContent key={displayProject.id} project={displayProject} />
      </div>
    </div>
  );
}
