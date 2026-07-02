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
        <div className="ss-num">0{index + 1}</div>
        <div className={`ss-badge ${isLive ? "live" : "soon"}`}>
          {isLive ? "Live" : "Coming Soon"}
        </div>
      </div>
      <div className="nm">{project.name}</div>
      <div className="tl">
        {isLive ? project.tagline : "Case study in progress"}
      </div>
      {isLive && (
        <>
          <div className="ss-tags">
            {project.tags.map((t) => (
              <span className="ss-tag" key={t}>
                {t}
              </span>
            ))}
          </div>
          <div className="ss-cta live-cta" style={{ marginTop: "16px" }}>
            View case study →
          </div>
        </>
      )}
    </div>
  );
}

export default function ProjectsListModal({ open, onClose, onOpenCaseStudy, projects }) {
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
      </div>
    </div>
  );
}
