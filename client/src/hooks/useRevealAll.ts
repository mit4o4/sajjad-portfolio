import { useEffect } from "react";

const REVEAL_SELECTOR = ".tb-rv, .tb-rv-img, .tb-pstep";
const PENDING_SELECTOR =
  ".tb-rv:not(.is-in), .tb-rv-img:not(.is-in), .tb-pstep:not(.is-in)";
/** Safety net for embedded viewers that pause scroll events / observers. */
const FALLBACK_POLL_MS = 500;

function markIn(el: Element): void {
  el.classList.add("is-in");
  el.querySelectorAll(".tb-rv-img").forEach(child =>
    child.classList.add("is-in")
  );
}

function isInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/**
 * Enables entrance reveals site-wide. Content stays visible without JS because the
 * hidden state only applies under the `tb-js` class this hook adds to <html>.
 */
export function useRevealAll(): void {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;
    root.classList.add("tb-js");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          markIn(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    const observePending = () => {
      document
        .querySelectorAll(PENDING_SELECTOR)
        .forEach(el => observer.observe(el));
    };
    const revealVisible = () => {
      document.querySelectorAll(PENDING_SELECTOR).forEach(el => {
        if (isInViewport(el)) markIn(el);
      });
    };

    observePending();
    revealVisible();

    // New cards appear when filters or language change.
    const mutations = new MutationObserver(observePending);
    mutations.observe(document.body, { childList: true, subtree: true });
    const poll = window.setInterval(revealVisible, FALLBACK_POLL_MS);
    window.addEventListener("scroll", revealVisible, { passive: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.clearInterval(poll);
      window.removeEventListener("scroll", revealVisible);
      root.classList.remove("tb-js");
      document
        .querySelectorAll(REVEAL_SELECTOR)
        .forEach(el => el.classList.add("is-in"));
    };
  }, []);
}
