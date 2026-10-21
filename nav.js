// Shared nav + footer injected into every page
(function () {
  const ROOT = document.documentElement.dataset.root || '';

  // ── Nav ──────────────────────────────────────────────────
  const navHtml = `
<nav class="nav" id="site-nav">
  <div class="nav-inner">
    <a href="${ROOT}index.html" class="nav-logo">
      <img src="${ROOT}public/images/logo.png" alt="Gallatin Demo & Removal logo" onerror="this.style.display='none'">
      <span>Gallatin <span class="accent">Demo</span></span>
    </a>
    <ul class="nav-links">
      <li><a href="${ROOT}index.html">Home</a></li>
      <li><a href="${ROOT}index.html#services">Services</a></li>
      <li><a href="${ROOT}projects/index.html">Projects</a></li>
      <li><a href="${ROOT}index.html#quote">Contact</a></li>
    </ul>
    <a href="${ROOT}index.html#quote" class="btn btn-primary nav-cta" style="font-size:0.78rem;padding:0.6rem 1.3rem;">Get a Free Quote</a>
    <button class="nav-hamburger" aria-label="Menu" onclick="document.getElementById('mobile-menu').classList.toggle('open')">
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none"><rect width="22" height="2.5" rx="1.25" fill="currentColor"/><rect y="7.75" width="22" height="2.5" rx="1.25" fill="currentColor"/><rect y="15.5" width="22" height="2.5" rx="1.25" fill="currentColor"/></svg>
    </button>
  </div>
  <div class="nav-mobile" id="mobile-menu">
    <a href="${ROOT}index.html">Home</a>
    <a href="${ROOT}index.html#services">Services</a>
    <a href="${ROOT}projects/index.html">Projects</a>
    <a href="${ROOT}index.html#quote">Contact</a>
    <a href="${ROOT}index.html#quote" class="btn btn-primary">Get a Free Quote</a>
  </div>
</nav>`;

  // ── Footer ───────────────────────────────────────────────
  const footerHtml = `
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <img src="${ROOT}public/images/logo.png" alt="Gallatin Demo & Removal" onerror="this.style.display='none'">
      <p>Veteran co-owned demolition and removal serving Bozeman, Gallatin Valley, and all of Southwest Montana.</p>
    </div>
    <div class="footer-col">
      <h5>Services</h5>
      <ul>
        <li><a href="${ROOT}projects/bozeman-siding-removal.html">Siding Removal</a></li>
        <li><a href="${ROOT}projects/deck-demolition.html">Deck Demolition</a></li>
        <li><a href="${ROOT}projects/hot-tub-removal.html">Hot Tub Removal</a></li>
        <li><a href="${ROOT}projects/mobile-home-demolition.html">Mobile Home Demo</a></li>
        <li><a href="${ROOT}projects/treehouse-removal.html">Treehouse Removal</a></li>
        <li><a href="${ROOT}projects/flooring-removal.html">Flooring Removal</a></li>
        <li><a href="${ROOT}projects/debris-hauling.html">Debris Hauling</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h5>Company</h5>
      <ul>
        <li><a href="${ROOT}index.html">Home</a></li>
        <li><a href="${ROOT}projects/index.html">All Projects</a></li>
        <li><a href="${ROOT}index.html#quote">Get a Quote</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>&copy; ${new Date().getFullYear()} Gallatin Demo &amp; Removal — Bozeman, Montana</span>
    <span class="vet">&#9733; Veteran Co-Owned &amp; Operated</span>
  </div>
</footer>`;

  // Inject
  const navTarget = document.getElementById('nav-placeholder');
  const footerTarget = document.getElementById('footer-placeholder');
  if (navTarget) navTarget.outerHTML = navHtml;
  if (footerTarget) footerTarget.outerHTML = footerHtml;

  // Fade-in observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Lightbox
  window.openLightbox = function(imgs, idx) {
    let cur = idx;
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    if (!lb || !lbImg) return;
    lbImg.src = imgs[cur];
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    window._lbImgs = imgs;
    window._lbCur = cur;
  };
  window.closeLightbox = function() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('open');
    document.body.style.overflow = '';
  };
  window.lbNext = function() {
    const imgs = window._lbImgs;
    window._lbCur = (window._lbCur + 1) % imgs.length;
    document.getElementById('lightbox-img').src = imgs[window._lbCur];
  };
  window.lbPrev = function() {
    const imgs = window._lbImgs;
    window._lbCur = (window._lbCur - 1 + imgs.length) % imgs.length;
    document.getElementById('lightbox-img').src = imgs[window._lbCur];
  };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.closeLightbox();
    if (e.key === 'ArrowRight') { if (document.getElementById('lightbox')?.classList.contains('open')) window.lbNext(); }
    if (e.key === 'ArrowLeft')  { if (document.getElementById('lightbox')?.classList.contains('open')) window.lbPrev(); }
  });
})();
