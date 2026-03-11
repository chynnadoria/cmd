// bio reveal on page load
window.addEventListener('load', () => {
  const bio = document.getElementById('about-bio');
  if (bio) setTimeout(() => bio.classList.add('revealed'), 300);
});

// hamburger menu toggle
const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// activate nav links on scroll
const sections  = document.querySelectorAll('section[id]');
const allLinks  = document.querySelectorAll('nav a');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      allLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, {
  rootMargin: '-10% 0px -60% 0px',   // section is in top 40% of viewport
  threshold: 0
});

sections.forEach(s => navObserver.observe(s));

// scroll reveal
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── HELPER: generic slide carousel ──────────
function makeCarousel({ slides, prevBtn, nextBtn, dotsContainer }) {
  let idx = 0;

  if (dotsContainer) {
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => go(i));
      dotsContainer.appendChild(d);
    });
  }

  function go(n) {
    slides[idx].classList.remove('active');
    if (dotsContainer) dotsContainer.children[idx].classList.remove('active');
    idx = (n + slides.length) % slides.length;
    slides[idx].classList.add('active');
    if (dotsContainer) dotsContainer.children[idx].classList.add('active');
  }

  prevBtn.addEventListener('click', () => go(idx - 1));
  nextBtn.addEventListener('click', () => go(idx + 1));
}

// ── HELPER: translate-based carousel ────────
function makeTrackCarousel({ trackId, prevBtn, nextBtn, slideSelector }) {
  const track  = document.getElementById(trackId);
  const slides = track.querySelectorAll(slideSelector);
  let idx = 0;

  function go(n) {
    idx = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
  }

  prevBtn.addEventListener('click', () => go(idx - 1));
  nextBtn.addEventListener('click', () => go(idx + 1));
}

// experiences carousel
makeCarousel({
  slides:         Array.from(document.querySelectorAll('.exp-slide')),
  prevBtn:        document.getElementById('exp-prev'),
  nextBtn:        document.getElementById('exp-next'),
  dotsContainer:  document.getElementById('exp-dots'),
});

// certification carousel
makeTrackCarousel({
  trackId:       'cert-slides',
  prevBtn:       document.getElementById('cert-prev'),
  nextBtn:       document.getElementById('cert-next'),
  slideSelector: '.side-slide',
});

// dashboards carousel (reusing same styles as certifications since it's also a side-scroll)
makeTrackCarousel({
  trackId:       'dash-slides',
  prevBtn:       document.getElementById('dash-prev'),
  nextBtn:       document.getElementById('dash-next'),
  slideSelector: '.side-slide',
});

// projects carousel: three cards per slide
makeTrackCarousel({
  trackId:       'proj-slides',
  prevBtn:       document.getElementById('proj-prev'),
  nextBtn:       document.getElementById('proj-next'),
  slideSelector: '.side-slide',
});

// skills tabs
const tabs   = document.querySelectorAll('.skill-tab');
const panels = document.querySelectorAll('.skills-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');

    const target = document.getElementById('cat-' + tab.dataset.cat);
    if (target) {
      target.classList.add('active');
      // animate bars that haven't animated yet in this panel
      target.querySelectorAll('.skill-bar:not(.animated)').forEach(bar => {
        const w = parseFloat(bar.dataset.width) * 100 + '%';
        requestAnimationFrame(() => {
          bar.style.width = w;
          bar.classList.add('animated');
        });
      });
    }
  });
});

// skill bars animation on scroll 
const skillBarObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // only animate bars inside the currently active panel
      const activePanelBars = document.querySelectorAll('.skills-panel.active .skill-bar');
      activePanelBars.forEach(bar => {
        if (!bar.classList.contains('animated')) {
          const w = parseFloat(bar.dataset.width) * 100 + '%';
          bar.style.width = w;
          bar.classList.add('animated');
        }
      });
      skillBarObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

const skillsSection = document.querySelector('.skills-wrapper');
if (skillsSection) skillBarObserver.observe(skillsSection);
