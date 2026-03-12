document.addEventListener("DOMContentLoaded", () => {
    const chapters = [...document.querySelectorAll(".chapter")];
    const navLinks = [...document.querySelectorAll(".nav-link")];
    const chapterNav = document.querySelector(".chapter-nav");
    const openingAbstract = document.querySelector(".opening-abstract");
  
    if (!chapters.length || !navLinks.length || !chapterNav) return;
  
    const navMap = new Map(
      navLinks.map((link) => [link.dataset.target, link])
    );
  
    const setActiveLink = (id) => {
      navLinks.forEach((link) => {
        const isActive = link.dataset.target === id;
        link.classList.toggle("is-active", isActive);
        link.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };
  
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  
    const updateProgress = () => {
      const viewportHeight = window.innerHeight;
  
      let mostVisibleId = chapters[0].id;
      let bestScore = -1;
  
      chapters.forEach((chapter) => {
        const rect = chapter.getBoundingClientRect();
        const link = navMap.get(chapter.id);
  
        if (!link) return;
  
        const chapterScrollable = Math.max(rect.height - viewportHeight, 1);
        const rawProgress = -rect.top / chapterScrollable;
        const normalizedProgress =
          rect.height <= viewportHeight
            ? clamp(
                (viewportHeight - rect.top) / (viewportHeight + rect.height),
                0,
                1
              )
            : clamp(rawProgress, 0, 1);
  
        const progressRightInset = `${(1 - normalizedProgress) * 100}%`;
        link.style.setProperty("--chapter-progress", progressRightInset);
  
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, viewportHeight);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibilityScore = visibleHeight / Math.min(rect.height, viewportHeight);
  
        if (visibilityScore > bestScore) {
          bestScore = visibilityScore;
          mostVisibleId = chapter.id;
        }
      });
  
      setActiveLink(mostVisibleId);
  
      if (openingAbstract) {
        const introBottom = openingAbstract.getBoundingClientRect().bottom;
        chapterNav.classList.toggle("is-visible", introBottom <= viewportHeight * 0.65);
      } else {
        chapterNav.classList.add("is-visible");
      }
    };
  
    let ticking = false;
  
    const requestTick = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
    };
  
    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const id = link.dataset.target;
        const target = document.getElementById(id);
        if (!target) return;
  
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
  
    updateProgress();
  });