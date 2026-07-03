import { Fragment, useEffect, useState } from "react";
import "./ProjectModal.css";
import "./ProjectDetailModal.css";

// Shared between the real detail modal and the admin live preview panel.
export function CaseStudyContent({ project }) {
  const [shotIndex, setShotIndex] = useState(0);

  const cs = project.caseStudy || {};
  const captions = cs.shots || [];
  const role = cs.role || [];
  const techTags = cs.techTags || [];
  const results = cs.results || [];
  const testimonial = cs.testimonial || { quote: "", by: "" };

  // The gallery is driven by real uploaded images when the project has any.
  // Projects created before images existed fall back to the caption-only
  // placeholder slides, so nothing breaks.
  const gallery = project.images?.length
    ? project.images
    : project.imageUrl
      ? [{ url: project.imageUrl }]
      : [];
  const hasImages = gallery.length > 0;
  const slideCount = hasImages ? gallery.length : captions.length;
  const hasMultiple = slideCount > 1;
  const activeIndex = slideCount ? shotIndex % slideCount : 0;
  const activeImage = hasImages ? gallery[activeIndex] : null;
  const activeCaption =
    captions[activeIndex] || (hasImages ? "" : `product preview — ${project.name.toLowerCase()} ui`);

  return (
    <>
      <div className="cs-gallery">
        <div
          className="cs-shot"
          style={
            activeImage
              ? {
                  backgroundImage: `url(${activeImage.url})`,
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
                  setShotIndex((i) => (i - 1 + slideCount) % slideCount)
                }
              >
                ‹
              </div>
              <div
                className="cs-shot-nav next"
                onClick={() => setShotIndex((i) => (i + 1) % slideCount)}
              >
                ›
              </div>
            </>
          )}
          {!activeImage && <span>{activeCaption}</span>}
          {activeImage && activeCaption && (
            <span className="cs-shot-caption">{activeCaption}</span>
          )}
        </div>
        {hasMultiple && (
          <>
            <div className="cs-shot-counter">
              {activeIndex + 1} / {slideCount}
            </div>
            <div className="cs-thumbs">
              {(hasImages ? gallery : captions).map((item, i) => {
                const url = hasImages ? gallery[i].url : null;
                return (
                  <div
                    key={i}
                    className={`cs-thumb${i === activeIndex ? " active" : ""}${url ? " has-img" : ""}`}
                    style={url ? { backgroundImage: `url(${url})` } : undefined}
                    onClick={() => setShotIndex(i)}
                  >
                    {!url && <span>{captions[i]}</span>}
                  </div>
                );
              })}
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
