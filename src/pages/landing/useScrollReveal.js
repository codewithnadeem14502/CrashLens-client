import { useEffect, useRef } from "react";

// Scroll-entrance reveal for the landing page, following the same
// IntersectionObserver + useRef/useEffect pattern IssueDetailPanel already
// uses for infinite-scroll (features/issues/components/IssueDetailPanel.jsx).
//
// Progressive-enhancement by design: elements are visible by default (see
// .landing-reveal in app.css). This hook only *adds* the class that hides
// them, right before it starts observing - so if the effect never runs
// (JS error, environment without IntersectionObserver), content simply
// stays visible instead of being stuck invisible forever.
export function useScrollReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const targets = Array.from(
      container.querySelectorAll(".landing-reveal"),
    );
    if (targets.length === 0) return undefined;

    targets.forEach((target) => target.classList.add("landing-reveal-pending"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("landing-reveal-pending");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-40px 0px", threshold: 0.15 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
