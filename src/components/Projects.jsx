import { useRef } from "react";
import "./Projects.css";
import { useScrollStack } from "../hooks/useScrollStack";
import { HIGHLIGHTED_LIMIT } from "../lib/projects";

function StackCard({ project, index, onOpen }) {
  const isLive = project.status === "live";
  return (
    <div
      className={`scroll-stack-card ${isLive ? "is-live" : "is-soon"}`}
      onClick={isLive ? () => onOpen(project) : undefined}
    >
      <div className="ss-inner">
        <div className="ss-split">
          <div className="ss-left">
            <div className="ss-top">
              <div className="ss-num">0{index + 1}</div>
              <div className={`ss-badge ${isLive ? "live" : "soon"}`}>
                {isLive ? project.teamBadge : "Coming Soon"}
              </div>
            </div>
            <div className="ss-meta">
              <div className="nm">{project.name}</div>
              <div className="tl">
                {isLive ? project.tagline : "Case study in progress"}
              </div>
              {isLive && (
                <div className="ss-tags">
                  {project.tags.map((t) => (
                    <span className="ss-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {isLive ? (
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
          <div
            className={`ss-right ${isLive ? "live" : "soon"}`}
            style={
              project.imageUrl
                ? { backgroundImage: `url(${project.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            {!project.imageUrl && (
              <span>
                {isLive ? "product preview — emily ui" : "case study in progress"}
              </span>
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
  const visibleProjects = projects.filter((p) => p.highlighted).slice(0, HIGHLIGHTED_LIMIT);
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
            <div className="scroll-stack-end"></div>
          </div>
        )}
      </div>
    </section>
  );
}
