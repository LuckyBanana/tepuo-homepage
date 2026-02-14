/**
 * Tē Pūō Website - Animations
 *
 * Scroll-triggered animations using IntersectionObserver.
 * Supports staggered delays via data-animate-delay attribute.
 * Respects prefers-reduced-motion user preference.
 */

document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.animate-on-scroll');

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  // Graceful degradation for older browsers
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = Number(entry.target.dataset.animateDelay) || 0;
        if (delay > 0) {
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);
        } else {
          entry.target.classList.add('is-visible');
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  elements.forEach(el => observer.observe(el));
});
