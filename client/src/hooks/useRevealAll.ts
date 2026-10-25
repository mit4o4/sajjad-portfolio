import { useEffect } from "react";

const REVEAL_SELECTOR = ".tb-rv, .tb-rv-img, .tb-pstep";
const PENDING_SELECTOR = ".tb-rv:not(.is-in), .tb-rv-img:not(.is-in), .tb-pstep:not(.is-in)";
/** Safety net for embedded viewers that pause scroll events / observers. */
const FALLBACK_POLL_MS = 500;

declare global {
  interface Window {
    __tbReady?: boolean;
  }
}

function markIn(el: Element): void {
  el.classList.add("is-in");
  el.querySelectorAll(".tb-rv-img").forEach((child) => child.classList.add("is-in"));
}

function isInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/**
 * Drives entrance reveals site-wide. The hidden state only applies under the `tb-js` class,
 * which an inline script in index.html adds before first paint (and removes if the app never boots).
 */
export function useRevealAll(): void {
  useEffect(() => {
    window.__tbReady = true;
    const root = document.documentElement;
    if (!root.classList.contains("tb-js")) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          markIn(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    let pollId = 0;
    const main = document.getElementById("main") ?? document.body;
    const observePending = () => main.querySelectorAll(PENDING_SELECTOR).forEach((el) => observer.observe(el));
    const revealVisible = () => {
      const pending = main.querySelectorAll(PENDING_SELECTOR);
      pending.forEach((el) => {
        if (isInViewport(el)) markIn(el);
      });
      if (pending.length === 0) window.clearInterval(pollId);
    };

    observePending();
    revealVisible();
    // New cards appear when filters change; only watch the page content, not the whole document.
    const mutations = new MutationObserver(observePending);
    mutations.observe(main, { childList: true, subtree: true });
    pollId = window.setInterval(revealVisible, FALLBACK_POLL_MS);
    window.addEventListener("scroll", revealVisible, { passive: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.clearInterval(pollId);
      window.removeEventListener("scroll", revealVisible);
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => el.classList.add("is-in"));
    };
  }, []);
}
