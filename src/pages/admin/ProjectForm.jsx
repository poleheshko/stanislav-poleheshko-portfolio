import { useEffect, useRef, useState } from "react";
import { createProject, fetchHighlightedCount, HIGHLIGHTED_LIMIT, updateProject } from "../../lib/projects";
import { deleteProjectImages, uploadProjectImage } from "../../lib/storage";
import { splitCsv } from "../../lib/csv";
import ProjectPreview from "./ProjectPreview.jsx";

const MAX_IMAGES = 10;

// Normalizes a saved project's gallery into the editor's working shape. Falls
// back to the legacy single image for rows created before multi-image support.
function initialImages(project) {
  const gallery = project?.images?.length
    ? project.images
    : project?.imageUrl
      ? [{ url: project.imageUrl, path: project.imagePath ?? null, main: true }]
      : [];
  return gallery.map((im) => ({ url: im.url, path: im.path ?? null, main: !!im.main }));
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
  // Gallery items: saved ones carry {url, path}; freshly added ones carry
  // {file, previewUrl} and get uploaded on save. Exactly one has main: true.
  const [images, setImages] = useState(() => initialImages(project));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Revoke object URLs on unmount. A ref keeps this reading the latest list
  // without re-registering the cleanup on every gallery edit.
  const imagesRef = useRef(images);
  imagesRef.current = images;
  useEffect(
    () => () => imagesRef.current.forEach((im) => im.previewUrl && URL.revokeObjectURL(im.previewUrl)),
    [],
  );

  // Guarantees exactly one main image (the first, if none is flagged).
  function withMain(list) {
    if (list.length && !list.some((im) => im.main)) {
      return list.map((im, i) => (i === 0 ? { ...im, main: true } : im));
    }
    return list;
  }

  function handleAddFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // let the same file be picked again after removal
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    if (files.length > remaining) {
      setError(`You can have up to ${MAX_IMAGES} images — ${files.length - remaining} were skipped.`);
    } else {
      setError("");
    }
    const added = files.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      url: null,
      path: null,
      main: false,
    }));
    setImages((prev) => withMain([...prev, ...added]));
  }

  function setMainImage(index) {
    setImages((prev) => prev.map((im, i) => ({ ...im, main: i === index })));
  }

  function moveImage(index, dir) {
    setImages((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function removeImage(index) {
    setImages((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return withMain(prev.filter((_, i) => i !== index));
    });
  }

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
    try {
      // Upload any newly added files, then assemble the final ordered gallery.
      const finalImages = [];
      for (const im of images) {
        if (im.file) {
          const uploaded = await uploadProjectImage(im.file);
          finalImages.push({ url: uploaded.url, path: uploaded.path, main: !!im.main });
        } else {
          finalImages.push({ url: im.url, path: im.path ?? null, main: !!im.main });
        }
      }
      if (finalImages.length && !finalImages.some((im) => im.main)) finalImages[0].main = true;
      const mainImage = finalImages.find((im) => im.main) || finalImages[0] || null;

      const row = {
        name: form.name.trim(),
        status: form.status,
        tagline: form.tagline.trim() || null,
        team_badge: form.teamBadge.trim() || null,
        tags: tagsArr,
        metric_val: form.metricVal.trim() || null,
        metric_lbl: form.metricLbl.trim() || null,
        image_url: mainImage?.url ?? null,
        image_path: mainImage?.path ?? null,
        images: finalImages,
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

      // Clean up any images that were removed during this edit.
      const keptPaths = new Set(finalImages.map((im) => im.path).filter(Boolean));
      const removedPaths = (project?.images || [])
        .map((im) => im.path)
        .filter((p) => p && !keptPaths.has(p));
      if (removedPaths.length) await deleteProjectImages(removedPaths);

      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save project.");
    } finally {
      setBusy(false);
    }
  }

  const previewImages = images.map((im) => ({ url: im.previewUrl || im.url, main: !!im.main }));

  return (
    <div className="admin-form-layout">
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

      <div className="admin-field admin-images-field">
        <span>
          Images{" "}
          <small>
            up to {MAX_IMAGES} · ★ sets the homepage card image · ◀ ▶ reorder the case-study gallery
          </small>
        </span>
        {images.length > 0 && (
          <div className="admin-images-grid">
            {images.map((im, i) => (
              <div className={`admin-image-item${im.main ? " is-main" : ""}`} key={im.previewUrl || im.url || i}>
                <div
                  className="admin-image-thumb"
                  style={{ backgroundImage: `url(${im.previewUrl || im.url})` }}
                >
                  {im.main && <span className="admin-image-badge">Main</span>}
                </div>
                <div className="admin-image-controls">
                  <button
                    type="button"
                    className="admin-btn admin-btn-small"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    title="Move earlier"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-small"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === images.length - 1}
                    title="Move later"
                  >
                    ▶
                  </button>
                  <button
                    type="button"
                    className={`admin-btn admin-btn-small${im.main ? " admin-btn-primary" : ""}`}
                    onClick={() => setMainImage(i)}
                    disabled={im.main}
                    title="Set as main (homepage card) image"
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-small admin-btn-danger"
                    onClick={() => removeImage(i)}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {images.length < MAX_IMAGES ? (
          <input type="file" accept="image/*" multiple onChange={handleAddFiles} />
        ) : (
          <div className="admin-preview-note">Maximum of {MAX_IMAGES} images reached.</div>
        )}
      </div>

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

    <ProjectPreview form={form} images={previewImages} />
    </div>
  );
}
