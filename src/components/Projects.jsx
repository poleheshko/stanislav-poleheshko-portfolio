import { useRef } from "react";
import "./Projects.css";
import { useScrollStack } from "../hooks/useScrollStack";

export function StackCard({ project, index, onOpen }) {
  // "Live" and "prototype" projects both render as fully active cards
  // (clickable, full content, opens the case study); only a genuine "soon"
  // placeholder gets the deactivated treatment.
  const isActive = project.status === "live" || project.status === "prototype";
  return (
    <div
      className={`scroll-stack-card ${isActive ? "is-live" : "is-soon"}`}
      onClick={isActive ? () => onOpen(project) : undefined}
    >
      <div className="ss-inner">
        <div className="ss-split">
          <div className="ss-left">
            <div className="ss-top">
              <div className="ss-num">{String(index + 1).padStart(2, "0")}</div>
              {isActive ? (
                <div className="ss-role">
                  <span className="ss-role-label">Role</span>
                  <div className="ss-badge live">{project.teamBadge}</div>
                </div>
              ) : (
                <div className="ss-badge soon">Coming Soon</div>
              )}
            </div>
            <div className="ss-meta">
              <div className="nm">{project.name}</div>
              <div className="tl">
                {isActive ? project.tagline : "Case study in progress"}
              </div>
              {isActive && project.tags.length > 0 && (
                <div className="ss-tags">
                  {project.tags.map((t) => (
                    <span className="ss-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {isActive ? (
              <>
                <div className="ss-divider"></div>
                <div className="ss-foot-row">
                  <div className="ss-metric">
                    <span className="val">{project.metric.val}</span>
                    <span className="lbl">{project.metric.lbl}</span>
                  </div>
                  <span className="ss-cta live-cta">View case study →</span>
                </div>
              </>
            ) : (
              <span className="ss-cta soon-cta">Coming soon</span>
            )}
          </div>
          <div className={`ss-right ${isActive ? "live" : "soon"}`}>
            {project.imageUrl ? (
              <div className="ss-shot" style={{ backgroundImage: `url(${project.imageUrl})` }} />
            ) : (
              <span>
                {isActive ? "product preview — emily ui" : "case study in progress"}
              </span>
            )}
            {isActive && project.employer?.logoUrl && (
              <div className="ss-shot-employer-badge">
                <img src={project.employer.logoUrl} alt={project.employer.name} loading="lazy" decoding="async" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewAllCard({ hiddenCount, onOpen }) {
  return (
    <div className="scroll-stack-card ss-viewall" onClick={onOpen}>
      <div className="ss-inner">
        {hiddenCount > 0 ? (
          <>
            <div className="ss-viewall-count">+{hiddenCount}</div>
            <div className="ss-viewall-label">more projects</div>
          </>
        ) : (
          <div className="ss-viewall-label">browse the full portfolio</div>
        )}
        <div className="ss-viewall-link">
          View All <span className="arrow">→</span>
        </div>
      </div>
    </div>
  );
}

export default function Projects({ projects, loading, error, onOpenCaseStudy, onOpenAllProjects }) {
  const stackRef = useRef(null);
  const visibleProjects = projects.filter((p) => p.highlighted);
  const hiddenCount = Math.max(0, projects.length - visibleProjects.length);
  useScrollStack(stackRef, !loading);

  return (
    <section className="projects" id="projects">
      <div className="wrap">
        <h2 className="display d-3d reveal">PROJECTS</h2>
        {loading ? (
          <div className="projects-status">Loading projects…</div>
        ) : error ? (
          <div className="projects-status">Couldn't load projects right now. Please try again shortly.</div>
        ) : (
          <div className="scroll-stack" ref={stackRef}>
            {visibleProjects.map((p, i) => (
              <StackCard key={p.id} project={p} index={i} onOpen={onOpenCaseStudy} />
            ))}
            <ViewAllCard hiddenCount={hiddenCount} onOpen={onOpenAllProjects} />
          </div>
        )}
      </div>
      {/* Lives outside .wrap so the sticky "PROJECTS" title's containing
          block ends right after the last card, releasing the pin here
          instead of staying stuck through this scroll-room spacer. */}
      {!loading && !error && <div className="scroll-stack-end"></div>}
    </section>
  );
}
