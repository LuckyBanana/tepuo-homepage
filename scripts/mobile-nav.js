/**
 * Mobile Navigation Module
 *
 * Handles mobile nav toggle with full accessibility:
 * - aria-expanded state
 * - Dynamic aria-label
 * - Escape key to close
 * - Focus trap when open
 */

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (!navToggle || !nav) return;

  function openNav() {
    nav.classList.add('nav--visible');
    navToggle.classList.add('nav-toggle--open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fermer la navigation');
    document.addEventListener('keydown', handleKeyDown);
    // Focus the first nav link
    const firstLink = nav.querySelector('.nav-link');
    if (firstLink) firstLink.focus();
  }

  function closeNav() {
    nav.classList.remove('nav--visible');
    navToggle.classList.remove('nav-toggle--open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Ouvrir la navigation');
    document.removeEventListener('keydown', handleKeyDown);
    navToggle.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      closeNav();
      return;
    }

    // Focus trap: cycle through focusable elements within nav + toggle
    if (e.key === 'Tab') {
      const focusableEls = [navToggle, ...nav.querySelectorAll('a, button')];
      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('nav--visible');
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });
});
