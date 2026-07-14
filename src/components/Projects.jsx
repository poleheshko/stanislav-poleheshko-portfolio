import { useEffect, useRef } from "react";
import "./Projects.css";
import { useScrollStack } from "../hooks/useScrollStack";

// Below 1080px the stack cards are content-sized (image banner + text), but
// the View All card has almost no content, so it would collapse to a short
// strip among ~540px-tall cards. CSS can't reference a sibling's height, so
// mirror the height of the card directly above it. The scroll-stack re-reads
// live offsets every frame, so changing the height here is safe.
function useMatchViewAllHeight(stackRef, active) {
  useEffect(() => {
    if (!active) return;
    const stack = stackRef.current;
    const viewall = stack?.querySelector(".ss-viewall");
    const prev = viewall?.previousElementSibling;
    if (!viewall || !prev) return;
    const mq = window.matchMedia("(max-width: 1080px)");
    const sync = () => {
      viewall.style.height = mq.matches ? `${prev.offsetHeight}px` : "";
    };
    const ro = new ResizeObserver(sync);
    ro.observe(prev);
    mq.addEventListener("change", sync);
    sync();
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, [stackRef, active]);
}

export function StackCard({ project, index, onOpen }) {
  // Every status renders as the same fully active card (clickable, full
  // content, opens the case study); a "soon" project only carries an extra
  // "Coming Soon" badge next to its role.
  const isSoon = project.status !== "live" && project.status !== "prototype";
  return (
    <div className="scroll-stack-card is-live" onClick={() => onOpen(project)}>
      <div className="ss-inner">
        <div className="ss-split">
          <div className="ss-left">
            <div className="ss-top">
              <div className="ss-num">{String(index + 1).padStart(2, "0")}</div>
              <div className="ss-role">
                {isSoon && <div className="ss-badge soon">Coming Soon</div>}
                {project.teamBadge && (
                  <>
                    <span className="ss-role-label">Role</span>
                    <div className="ss-badge live">{project.teamBadge}</div>
                  </>
                )}
              </div>
            </div>
            <div className="ss-meta">
              <div className="nm">{project.name}</div>
              <div className="tl">
                {project.tagline || "Case study in progress"}
              </div>
              {project.tags.length > 0 && (
                <div className="ss-tags">
                  {project.tags.map((t) => (
                    <span className="ss-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="ss-divider"></div>
            <div className="ss-foot-row">
              <div className="ss-metric">
                <span className="val">{project.metric.val}</span>
                <span className="lbl">{project.metric.lbl}</span>
              </div>
              <span className="ss-cta live-cta">View case study →</span>
            </div>
          </div>
          <div className="ss-right live">
            {project.imageUrl ? (
              <div className="ss-shot" style={{ backgroundImage: `url(${project.imageUrl})` }} />
            ) : (
              <span>product preview — emily ui</span>
            )}
            {project.employer?.logoUrl && (
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
  useMatchViewAllHeight(stackRef, !loading && !error);

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
