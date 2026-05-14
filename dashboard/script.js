// Optional: Add subtle interactions or future API integration
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Console welcome message
  console.log('%c Synapse-Ace Agent Dashboard ', 'background: #5b78c7; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
  console.log('Neumorphic design loaded. Embed your demo asciicast from demo.cast.');
});
