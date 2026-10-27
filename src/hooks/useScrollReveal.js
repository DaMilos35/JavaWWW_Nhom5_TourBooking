import { useEffect } from 'react';

/**
 * Custom hook that observes elements with `.reveal`, `.reveal-left`, `.reveal-scale`
 * and applies `.is-visible` when they enter the viewport.
 * Uses native IntersectionObserver with fallback for older browsers.
 */
export function useScrollReveal(deps = []) {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-scale';
    const elements = document.querySelectorAll(selectors);

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useScrollReveal;
