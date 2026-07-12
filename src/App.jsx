import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/base.css";
import "./styles/buttons.css";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Services from "./components/Services.jsx";
import Projects from "./components/Projects.jsx";
import ProjectsListModal from "./components/modals/ProjectsListModal.jsx";
import ProjectDetailModal from "./components/modals/ProjectDetailModal.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import { useRevealOnScroll } from "./hooks/useRevealOnScroll";
import { useModalScrollLock } from "./hooks/useModalScrollLock";
import { useProjects } from "./hooks/useProjects";
import { findProjectBySlug, slugify } from "./lib/slug";
import "./styles/reveal.css";
import "./styles/responsive.css";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, loading, error: projectsError } = useProjects();

  // Which project modal is open is derived from the URL rather than local
  // state, so /projects and /projects/:slug are shareable, deep-linkable and
  // work with the browser Back button. Parsing the pathname directly (instead
  // of useParams) keeps this component usable as the shared layout element for
  // all three project routes.
  const match = location.pathname.match(/^\/projects(?:\/([^/]+))?\/?$/);
  const onProjectsPath = !!match;
  const detailSlug = match && match[1] ? decodeURIComponent(match[1]) : null;
  // Set when a case study is opened from within the All Projects list, so
  // closing it returns to the list instead of the homepage.
  const fromList = !!location.state?.fromList;

  const caseStudyProject = detailSlug
    ? findProjectBySlug(projects, detailSlug)
    : null;
  // The list sits open behind the detail modal only when the user drilled in
  // from it; a card opened straight from the homepage — or a deep link — shows
  // the detail over the homepage alone.
  const allProjectsOpen = onProjectsPath && (!detailSlug || fromList);

  useRevealOnScroll();
  useModalScrollLock(allProjectsOpen || !!detailSlug);

  const openAllProjects = () => navigate("/projects");
  const openCaseStudy = (project) =>
    navigate(`/projects/${slugify(project.name)}`, {
      state: { fromList: allProjectsOpen },
    });
  const closeList = () => navigate("/");
  const closeDetail = () => navigate(fromList ? "/projects" : "/");

  // A hand-typed or stale /projects/:slug that matches no project (once the
  // projects have finished loading) falls back to the full list instead of
  // leaving an empty overlay stuck open.
  useEffect(() => {
    if (
      detailSlug &&
      !loading &&
      !projectsError &&
      projects.length &&
      !caseStudyProject
    ) {
      navigate("/projects", { replace: true });
    }
  }, [detailSlug, loading, projectsError, projects.length, caseStudyProject, navigate]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== "Escape") return;
      if (detailSlug) closeDetail();
      else if (allProjectsOpen) closeList();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProjectsOpen, detailSlug, fromList]);

  return (
    <>
      <Header />
      <Hero />
      <About />
      <Services />
      <Projects
        projects={projects}
        loading={loading}
        error={projectsError}
        onOpenCaseStudy={openCaseStudy}
        onOpenAllProjects={openAllProjects}
      />
      <ProjectsListModal
        open={allProjectsOpen}
        projects={projects}
        onClose={closeList}
        onOpenCaseStudy={openCaseStudy}
      />
      <ProjectDetailModal
        project={caseStudyProject}
        onClose={closeDetail}
      />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
