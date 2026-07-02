import { useEffect, useState } from "react";
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
import "./styles/reveal.css";
import "./styles/responsive.css";

export default function App() {
  const [allProjectsOpen, setAllProjectsOpen] = useState(false);
  const [caseStudyProject, setCaseStudyProject] = useState(null);
  const { projects, loading, error: projectsError } = useProjects();

  useRevealOnScroll();
  useModalScrollLock(allProjectsOpen || !!caseStudyProject);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== "Escape") return;
      if (caseStudyProject) setCaseStudyProject(null);
      else if (allProjectsOpen) setAllProjectsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [allProjectsOpen, caseStudyProject]);

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
        onOpenCaseStudy={setCaseStudyProject}
        onOpenAllProjects={() => setAllProjectsOpen(true)}
      />
      <ProjectsListModal
        open={allProjectsOpen}
        projects={projects}
        onClose={() => setAllProjectsOpen(false)}
        onOpenCaseStudy={setCaseStudyProject}
      />
      <ProjectDetailModal
        project={caseStudyProject}
        onClose={() => setCaseStudyProject(null)}
      />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
