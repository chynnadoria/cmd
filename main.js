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
  rootMargin: '-10% 0px -50% 0px',
  threshold: 0
});

sections.forEach(s => navObserver.observe(s));

// also highlight last nav link when page is scrolled to bottom
window.addEventListener('scroll', () => {
  const nearBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 80;
  if (nearBottom) {
    const lastSection = sections[sections.length - 1];
    allLinks.forEach(a => a.classList.remove('active'));
    const active = document.querySelector(`nav a[href="#${lastSection.id}"]`);
    if (active) active.classList.add('active');
  }
});

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

// ── NEW CARD CAROUSEL for proj / cert / dash ────────────
function makeSlideCarousel({ trackId, prevBtnId, nextBtnId, slideSelector }) {
  const track = document.getElementById(trackId);
  if (!track) return;

  let cards = Array.from(track.querySelectorAll(slideSelector));
  if (!cards.length) return;

  // clone ends for infinite loop
  const prependClones = cards.slice(-1).map(c => c.cloneNode(true));
  const appendClones  = cards.slice(0, 1).map(c => c.cloneNode(true));
  prependClones.forEach(c => track.insertBefore(c, track.firstChild));
  appendClones.forEach(c => track.appendChild(c));

  cards = Array.from(track.querySelectorAll(slideSelector));
  let idx = 1; // start at first real card

  function updatePos(animated = true) {
    const w = cards[0].getBoundingClientRect().width;
    if (!animated) track.style.transition = 'none';
    track.style.transform = `translateX(-${idx * w}px)`;
    if (!animated) {
      track.getBoundingClientRect();
      track.style.transition = '';
    }
  }

  track.addEventListener('transitionend', () => {
    const total = cards.length;
    if (idx <= 0) { idx = total - 2; updatePos(false); }
    else if (idx >= total - 1) { idx = 1; updatePos(false); }
  });

  document.getElementById(prevBtnId).addEventListener('click', () => { idx--; updatePos(true); });
  document.getElementById(nextBtnId).addEventListener('click', () => { idx++; updatePos(true); });
  window.addEventListener('resize', () => updatePos(false));
  window.requestAnimationFrame(() => updatePos(false));
}

// projects carousel
makeSlideCarousel({ trackId: 'proj-slides', prevBtnId: 'proj-prev', nextBtnId: 'proj-next', slideSelector: '.project-wrapper' });

// certifications carousel
makeSlideCarousel({ trackId: 'cert-slides', prevBtnId: 'cert-prev', nextBtnId: 'cert-next', slideSelector: '.side-slide' });

// dashboards carousel
makeSlideCarousel({ trackId: 'dash-slides', prevBtnId: 'dash-prev', nextBtnId: 'dash-next', slideSelector: '.side-slide' });

// ── PROJECTS: click to open URL ──────────────────────────
const projTrack = document.getElementById('proj-slides');
if (projTrack) {
  projTrack.addEventListener('click', e => {
    const wrapper = e.target.closest('.project-wrapper');
    if (wrapper && wrapper.dataset.url) window.open(wrapper.dataset.url, '_blank');
  });
}

// ── LIGHTBOX ─────────────────────────────────────────────
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxBack  = document.getElementById('lightbox-backdrop');

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

// click on cert / dashboard cards
document.addEventListener('click', e => {
  const card = e.target.closest('.media-card[data-lightbox]');
  if (card) openLightbox(card.dataset.lightbox);
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxBack.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

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
