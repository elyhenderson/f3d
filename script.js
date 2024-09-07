// Scroll-based effects or animations
window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    // Example of scaling an element as you scroll
    const heroSection = document.querySelector('.hero .content');
    heroSection.style.transform = `scale(${1 + scrollPosition / 1000})`;
  });

  