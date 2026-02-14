/**
 * Te Puo Website - Animations
 * 
 * This file initializes the tsparticles animation for the hero section background
 * and sets up scroll-triggered animations for other elements on the page.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize tsparticles
  if (document.getElementById('tsparticles')) {
    tsParticles.load('tsparticles', {
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'repulse',
          },
          resize: true,
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: '#8B7355',
        },
        links: {
          color: '#8B7355',
          distance: 150,
          enable: true,
          opacity: 0.2,
          width: 1,
        },
        collisions: {
          enable: true,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 80,
        },
        opacity: {
          value: 0.2,
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
    });
  }

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('animated')) {
          entry.target.classList.add('fade-in-up');
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  const animatedElements = document.querySelectorAll('.animated');
  animatedElements.forEach(el => observer.observe(el));
});
