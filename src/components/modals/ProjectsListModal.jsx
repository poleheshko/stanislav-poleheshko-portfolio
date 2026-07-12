import { useEffect, useState } from "react";
import "./ProjectModal.css";
import "./ProjectsListModal.css";

function MiniCard({ project, index, onOpen }) {
  const isLive = project.status === "live";
  return (
    <div
      className={`proj-mini${isLive ? "" : " soon"}`}
      data-live={isLive ? "1" : undefined}
      onClick={isLive ? () => onOpen(project) : undefined}
    >
      <div className="ss-top">
        <div className="ss-num">{String(index + 1).padStart(2, "0")}</div>
        <div className={`ss-badge ${isLive ? "live" : "soon"}`}>
          {isLive ? "Live" : "Coming Soon"}
        </div>
      </div>
      <div className="nm">{project.name}</div>
      <div className="tl">
        {project.tagline || "Case study in progress"}
      </div>
      {project.teamBadge && (
        <div className="ss-role proj-mini-role">
          <span className="ss-role-label">Role</span>
          <span className="ss-badge live">{project.teamBadge}</span>
        </div>
      )}
      {project.tags?.length > 0 && (
        <div className="ss-tags">
          {project.tags.map((t) => (
            <span className="ss-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      )}
      {(isLive || project.employer?.logoUrl) && (
        <div className="proj-mini-foot">
          {isLive && <span className="ss-cta live-cta">View case study →</span>}
          {project.employer?.logoUrl && (
            <img
              className="proj-mini-employer-mark"
              src={project.employer.logoUrl}
              alt=""
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsListModal({ open, onClose, onOpenCaseStudy, projects }) {
  // The overlay stays in the DOM (visibility:hidden) so it can fade in/out, but
  // browsers still fetch images inside a merely-hidden element. Defer building
  // the card grid — and therefore its employer-logo requests — until the modal
  // is opened for the first time, so it costs nothing on the initial page load.
  const [everOpened, setEverOpened] = useState(false);
  useEffect(() => {
    if (open) setEverOpened(true);
  }, [open]);

  return (
    <div
      className={`proj-modal-overlay${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="proj-modal" data-lenis-prevent>
        <div className="proj-modal-close" onClick={onClose}>
          ×
        </div>
        {everOpened && (
          <>
            <div className="eyebrow grad">Portfolio</div>
            <h2 className="title">All Projects</h2>
            <div className="subtitle">
              {projects.length} project{projects.length === 1 ? "" : "s"} total
            </div>
            <div className="proj-grid">
              {projects.map((p, i) => (
                <MiniCard
                  key={p.id}
                  project={p}
                  index={i}
                  onOpen={onOpenCaseStudy}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
