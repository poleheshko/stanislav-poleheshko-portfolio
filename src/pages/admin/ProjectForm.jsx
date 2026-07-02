import { useEffect, useState } from "react";
import { createProject, fetchHighlightedCount, HIGHLIGHTED_LIMIT, updateProject } from "../../lib/projects";
import { deleteProjectImage, uploadProjectImage } from "../../lib/storage";

function splitCsv(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function computeInitialState(project) {
  const cs = project?.caseStudy || {};
  return {
    name: project?.name || "",
    status: project?.status || "soon",
    tagline: project?.tagline || "",
    teamBadge: project?.teamBadge || "",
    tags: (project?.tags || []).join(", "),
    metricVal: project?.metric?.val && project.metric.val !== "—" ? project.metric.val : "",
    metricLbl: project?.metric?.lbl || "",
    projectUrl: project?.projectUrl || "",
    highlighted: !!project?.highlighted,
    imageUrl: project?.imageUrl || null,
    imagePath: project?.imagePath || null,
    eyebrow: cs.eyebrow || "Case Study",
    csTitle: cs.title || "",
    summary: cs.summary || "",
    roleTag: cs.roleTag || "",
    techTags: (cs.techTags || []).join(", "),
    problem: cs.problem || "",
    approach: cs.approach || "",
    testimonialQuote: cs.testimonial?.quote || "",
    testimonialBy: cs.testimonial?.by || "",
    roleRows: cs.role ? cs.role.map(([key, value]) => ({ key, value })) : [],
    resultsRows: cs.results ? cs.results.map((r) => ({ val: r.val, lbl: r.lbl })) : [],
    shots: cs.shots || [],
  };
}

function buildCaseStudy(form, techTagsArr) {
  const roleRows = form.roleRows.filter((r) => r.key.trim() || r.value.trim());
  const resultsRows = form.resultsRows.filter((r) => r.val.trim() || r.lbl.trim());
  const shots = form.shots.map((s) => s.trim()).filter(Boolean);
  const hasContent =
    form.summary.trim() ||
    form.problem.trim() ||
    form.approach.trim() ||
    form.csTitle.trim() ||
    form.roleTag.trim() ||
    techTagsArr.length ||
    roleRows.length ||
    resultsRows.length ||
    shots.length ||
    form.testimonialQuote.trim() ||
    form.testimonialBy.trim();
  if (!hasContent) return null;
  return {
    eyebrow: form.eyebrow.trim() || "Case Study",
    title: form.csTitle.trim() || form.name.trim(),
    summary: form.summary.trim(),
    shots,
    roleTag: form.roleTag.trim(),
    techTags: techTagsArr,
    problem: form.problem.trim(),
    role: roleRows.map((r) => [r.key.trim(), r.value.trim()]),
    approach: form.approach.trim(),
    results: resultsRows.map((r) => ({ val: r.val.trim(), lbl: r.lbl.trim() })),
    testimonial: { quote: form.testimonialQuote.trim(), by: form.testimonialBy.trim() },
  };
}

function validateLive(form, tagsArr, techTagsArr) {
  const missing = [];
  if (!form.tagline.trim()) missing.push("tagline");
  if (!form.teamBadge.trim()) missing.push("team badge");
  if (tagsArr.length === 0) missing.push("at least one tag");
  if (!form.metricVal.trim() || !form.metricLbl.trim()) missing.push("metric value & label");
  if (!form.summary.trim()) missing.push("case study summary");
  if (!form.problem.trim()) missing.push("problem & goal");
  if (!form.approach.trim()) missing.push("approach");
  if (!form.roleTag.trim()) missing.push("role tag");
  if (techTagsArr.length === 0) missing.push("at least one tech tag");
  return missing;
}

export default function ProjectForm({ project, nextSortOrder, onSaved, onCancel }) {
  const [form, setForm] = useState(() => computeInitialState(project));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function field(name) {
    return {
      value: form[name],
      onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
    };
  }

  function updateListItem(listName, index, patch) {
    setForm((f) => ({
      ...f,
      [listName]: f[listName].map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }
  function addListItem(listName, emptyItem) {
    setForm((f) => ({ ...f, [listName]: [...f[listName], emptyItem] }));
  }
  function removeListItem(listName, index) {
    setForm((f) => ({ ...f, [listName]: f[listName].filter((_, i) => i !== index) }));
  }
  function updateShot(index, value) {
    setForm((f) => ({ ...f, shots: f.shots.map((s, i) => (i === index ? value : s)) }));
  }

  async function handleHighlightToggle(checked) {
    setError("");
    if (checked && !project?.highlighted) {
      try {
        const count = await fetchHighlightedCount();
        if (count >= HIGHLIGHTED_LIMIT) {
          setError(
            `You already have ${HIGHLIGHTED_LIMIT} highlighted projects. Un-highlight one first before adding another.`,
          );
          return;
        }
      } catch (err) {
        setError(err.message || "Could not check the highlighted count.");
        return;
      }
    }
    setForm((f) => ({ ...f, highlighted: checked }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setImageRemoved(false);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImageRemoved(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    const tagsArr = splitCsv(form.tags);
    const techTagsArr = splitCsv(form.techTags);

    if (form.status === "live") {
      const missing = validateLive(form, tagsArr, techTagsArr);
      if (missing.length) {
        setError(`Fill in these fields before marking the project Live: ${missing.join(", ")}.`);
        return;
      }
    }

    if (form.highlighted && !project?.highlighted) {
      try {
        const count = await fetchHighlightedCount();
        if (count >= HIGHLIGHTED_LIMIT) {
          setError(`You already have ${HIGHLIGHTED_LIMIT} highlighted projects. Un-highlight one first.`);
          return;
        }
      } catch (err) {
        setError(err.message || "Could not check the highlighted count.");
        return;
      }
    }

    setBusy(true);
    const oldImagePath = project?.imagePath || null;
    try {
      let imageUrl = form.imageUrl;
      let imagePath = form.imagePath;

      if (imageFile) {
        const uploaded = await uploadProjectImage(imageFile);
        imageUrl = uploaded.url;
        imagePath = uploaded.path;
      } else if (imageRemoved) {
        imageUrl = null;
        imagePath = null;
      }

      const row = {
        name: form.name.trim(),
        status: form.status,
        tagline: form.tagline.trim() || null,
        team_badge: form.teamBadge.trim() || null,
        tags: tagsArr,
        metric_val: form.metricVal.trim() || null,
        metric_lbl: form.metricLbl.trim() || null,
        image_url: imageUrl,
        image_path: imagePath,
        project_url: form.projectUrl.trim() || null,
        highlighted: form.highlighted,
        case_study: buildCaseStudy(form, techTagsArr),
      };

      if (project) {
        await updateProject(project.id, row);
      } else {
        row.sort_order = nextSortOrder;
        await createProject(row);
      }

      if (oldImagePath && oldImagePath !== imagePath) {
        await deleteProjectImage(oldImagePath);
      }

      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save project.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-card admin-form" onSubmit={handleSubmit}>
      <h2>{project ? `Edit “${project.name}”` : "New project"}</h2>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span>Name *</span>
          <input required {...field("name")} />
        </label>
        <label className="admin-field">
          <span>Status</span>
          <select {...field("status")}>
            <option value="soon">Coming soon</option>
            <option value="live">Live</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Tagline (short description)</span>
          <input {...field("tagline")} />
        </label>
        <label className="admin-field">
          <span>Team badge</span>
          <input placeholder="e.g. Solo · PM & Dev" {...field("teamBadge")} />
        </label>
        <label className="admin-field">
          <span>Tags (comma separated)</span>
          <input placeholder="Claude API, Zendesk" {...field("tags")} />
        </label>
        <label className="admin-field">
          <span>Metric value</span>
          <input placeholder="−40%" {...field("metricVal")} />
        </label>
        <label className="admin-field">
          <span>Metric label</span>
          <input placeholder="first response time" {...field("metricLbl")} />
        </label>
        <label className="admin-field">
          <span>Project URL</span>
          <input type="url" placeholder="https://…" {...field("projectUrl")} />
        </label>
      </div>

      <label className="admin-field admin-image-field">
        <span>Image</span>
        {imagePreview || (form.imageUrl && !imageRemoved) ? (
          <div className="admin-image-preview">
            <img src={imagePreview || form.imageUrl} alt="" />
            <button type="button" className="admin-btn admin-btn-small" onClick={handleRemoveImage}>
              Remove image
            </button>
          </div>
        ) : null}
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>

      <label className="admin-checkbox-field">
        <input
          type="checkbox"
          checked={form.highlighted}
          onChange={(e) => handleHighlightToggle(e.target.checked)}
        />
        <span>Highlighted (shown in one of the 4 homepage slots)</span>
      </label>

      <details className="admin-details" open={form.status === "live"}>
        <summary>Case study details</summary>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Eyebrow</span>
            <input {...field("eyebrow")} />
          </label>
          <label className="admin-field">
            <span>Case study title</span>
            <input placeholder={form.name || "Defaults to the project name"} {...field("csTitle")} />
          </label>
          <label className="admin-field">
            <span>Role tag</span>
            <input placeholder="Product Manager / Developer" {...field("roleTag")} />
          </label>
          <label className="admin-field">
            <span>Tech tags (comma separated)</span>
            <input placeholder="FastAPI, Claude API, Zendesk, Docker" {...field("techTags")} />
          </label>
        </div>

        <label className="admin-field">
          <span>Summary</span>
          <textarea rows={2} {...field("summary")} />
        </label>
        <label className="admin-field">
          <span>Problem & goal</span>
          <textarea rows={3} {...field("problem")} />
        </label>
        <label className="admin-field">
          <span>Approach</span>
          <textarea rows={3} {...field("approach")} />
        </label>

        <div className="admin-subsection">
          <div className="admin-subsection-head">
            <span>Role & responsibilities</span>
            <button
              type="button"
              className="admin-btn admin-btn-small"
              onClick={() => addListItem("roleRows", { key: "", value: "" })}
            >
              + Add row
            </button>
          </div>
          {form.roleRows.map((row, i) => (
            <div className="admin-row-pair" key={i}>
              <input
                placeholder="Key (e.g. Role)"
                value={row.key}
                onChange={(e) => updateListItem("roleRows", i, { key: e.target.value })}
              />
              <input
                placeholder="Value"
                value={row.value}
                onChange={(e) => updateListItem("roleRows", i, { value: e.target.value })}
              />
              <button
                type="button"
                className="admin-btn admin-btn-small admin-btn-danger"
                onClick={() => removeListItem("roleRows", i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection-head">
            <span>Results & metrics</span>
            <button
              type="button"
              className="admin-btn admin-btn-small"
              onClick={() => addListItem("resultsRows", { val: "", lbl: "" })}
            >
              + Add row
            </button>
          </div>
          {form.resultsRows.map((row, i) => (
            <div className="admin-row-pair" key={i}>
              <input
                placeholder="Value (e.g. −40%)"
                value={row.val}
                onChange={(e) => updateListItem("resultsRows", i, { val: e.target.value })}
              />
              <input
                placeholder="Label"
                value={row.lbl}
                onChange={(e) => updateListItem("resultsRows", i, { lbl: e.target.value })}
              />
              <button
                type="button"
                className="admin-btn admin-btn-small admin-btn-danger"
                onClick={() => removeListItem("resultsRows", i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection-head">
            <span>Gallery captions</span>
            <button type="button" className="admin-btn admin-btn-small" onClick={() => addListItem("shots", "")}>
              + Add caption
            </button>
          </div>
          {form.shots.map((s, i) => (
            <div className="admin-row-pair" key={i}>
              <input placeholder="Zendesk sidebar — Emily panel" value={s} onChange={(e) => updateShot(i, e.target.value)} />
              <button
                type="button"
                className="admin-btn admin-btn-small admin-btn-danger"
                onClick={() => removeListItem("shots", i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Testimonial quote</span>
            <textarea rows={2} {...field("testimonialQuote")} />
          </label>
          <label className="admin-field">
            <span>Testimonial by</span>
            <input {...field("testimonialBy")} />
          </label>
        </div>
      </details>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-form-actions">
        <button type="button" className="admin-btn" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
