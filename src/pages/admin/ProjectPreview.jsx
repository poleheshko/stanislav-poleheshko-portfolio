import { StackCard } from "../../components/Projects.jsx";
import { CaseStudyContent } from "../../components/modals/ProjectDetailModal.jsx";
import { splitCsv } from "../../lib/csv";

const PLACEHOLDER = {
  name: "Project name",
  tagline: "Your tagline will appear here",
  teamBadge: "Your role",
  metricVal: "−40%",
  metricLbl: "metric label",
  eyebrow: "Case Study",
  csTitle: "Case study title",
  summary: "A one- or two-sentence summary of the project.",
  problem: "Describe the problem and the goal.",
  approach: "Describe your approach.",
  roleTag: "Role tag",
};

function buildPreviewProject(form, images, employer) {
  const gallery = (images || []).filter((im) => im.url);
  const mainUrl = (gallery.find((im) => im.main) || gallery[0])?.url || null;
  const tags = splitCsv(form.tags);
  const techTags = splitCsv(form.techTags);
  const roleRows = form.roleRows.filter((r) => r.key.trim() || r.value.trim());
  const resultsRows = form.resultsRows.filter((r) => r.val.trim() || r.lbl.trim());
  const shots = form.shots.map((s) => s.trim()).filter(Boolean);

  return {
    id: "preview",
    name: form.name.trim() || PLACEHOLDER.name,
    status: form.status,
    tagline: form.tagline.trim() || PLACEHOLDER.tagline,
    teamBadge: form.teamBadge.trim() || PLACEHOLDER.teamBadge,
    tags,
    metric: {
      val: form.metricVal.trim() || PLACEHOLDER.metricVal,
      lbl: form.metricLbl.trim() || PLACEHOLDER.metricLbl,
    },
    imageUrl: mainUrl,
    images: gallery,
    employer: employer || null,
    caseStudy: {
      eyebrow: form.eyebrow.trim() || PLACEHOLDER.eyebrow,
      title: form.csTitle.trim() || form.name.trim() || PLACEHOLDER.csTitle,
      summary: form.summary.trim() || PLACEHOLDER.summary,
      shots,
      roleTag: form.roleTag.trim() || PLACEHOLDER.roleTag,
      techTags,
      problem: form.problem.trim() || PLACEHOLDER.problem,
      role: roleRows.map((r) => [r.key.trim(), r.value.trim()]),
      approach: form.approach.trim() || PLACEHOLDER.approach,
      results: resultsRows.map((r) => ({ val: r.val.trim(), lbl: r.lbl.trim() })),
      testimonial: { quote: form.testimonialQuote.trim(), by: form.testimonialBy.trim() },
    },
  };
}

export default function ProjectPreview({ form, images, employer }) {
  const project = buildPreviewProject(form, images, employer);
  const isLive = project.status === "live";

  return (
    <div className="admin-preview-section">
      <div className="admin-preview-block">
        <div className="admin-preview-label">Live preview — homepage card</div>
        <div className="admin-preview-stage card">
          <div className="admin-preview-dark">
            <StackCard project={project} index={0} onOpen={() => {}} />
          </div>
        </div>
        {!isLive && (
          <div className="admin-preview-note">
            Status is “Coming soon” — the tagline, tags, and metric stay hidden on the
            homepage card until you switch this project to Live.
          </div>
        )}
      </div>

      <div className="admin-preview-block">
        <div className="admin-preview-label">Live preview — case study page</div>
        <div className="admin-preview-stage cs">
          <div className="proj-modal cs-modal admin-preview-modal">
            <CaseStudyContent project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}
