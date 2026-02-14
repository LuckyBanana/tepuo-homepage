/**
 * Te Puo Website - Animations
 *
 * Scroll-triggered animations using IntersectionObserver.
 * Supports staggered delays via data-animate-delay attribute.
 */

document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.animateDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, Number(delay));
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  const elements = document.querySelectorAll('.animate-on-scroll');
  elements.forEach(el => observer.observe(el));
});
