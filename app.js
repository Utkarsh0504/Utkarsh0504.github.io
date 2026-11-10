(() => {
  const body = document.body;
  const menu = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');
  const themeButton = document.getElementById('theme-toggle');
  const progress = document.getElementById('scroll-progress');
  const storedTheme = (() => { try { return localStorage.getItem('utkarsh-theme'); } catch (_) { return null; } })();
  const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';

  function applyTheme(theme) {
    body.dataset.theme = theme;
    themeButton.querySelector('.theme-icon').textContent = theme === 'dark' ? '☼' : '☾';
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    themeButton.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#080d18' : '#f5f8fb');
  }
  applyTheme(initialTheme);
  themeButton.addEventListener('click', () => {
    const next = body.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('utkarsh-theme', next); } catch (_) { /* storage disabled */ }
  });

  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label','Open navigation'); }
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!nav.contains(e.target) && !menu.contains(e.target)) closeMenu(); });

  // Each project has its own details; never stretch its neighbor or open two cards at once.
  document.querySelectorAll('.project-more').forEach(button => {
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll('.project-more').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        const panel = document.getElementById(other.getAttribute('aria-controls'));
        if (panel) panel.hidden = true;
      });
      if (opening) {
        button.setAttribute('aria-expanded', 'true');
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        if (panel) panel.hidden = false;
      }
    });
  });

  const copyButton = document.getElementById('copy-email');
  const status = document.getElementById('copy-status');
  copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.email;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const temp = document.createElement('textarea');
        temp.value = email; temp.style.position = 'fixed'; temp.style.opacity = '0';
        document.body.appendChild(temp); temp.select();
        if (!document.execCommand('copy')) throw new Error('Copy not permitted');
        temp.remove();
      }
      status.textContent = 'Email address copied.';
    } catch (_) { status.textContent = `Copy manually: ${email}`; }
  });

  const year = document.getElementById('current-year');
  year.textContent = String(new Date().getFullYear());

  let ticking = false;
  function updateProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = total > 0 ? `${Math.min(100, Math.max(0, 100 * window.scrollY / total))}%` : '0%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
  }, { passive: true });
  updateProgress();

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    const navLinks = [...document.querySelectorAll('[data-nav]')];
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-25% 0px -62% 0px' });
    document.querySelectorAll('#about,#work,#experience,#skills,#contact').forEach(el => sectionObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // Show destination-specific photos, using copies without embedded metadata.
  const galleries = {
    ladakh: { title: 'Ladakh', photos: [
      {src:'assets/rides/ladakh-khardung-la.webp', caption:'At Khardung La', alt:'Utkarsh beside the Khardung La mountain pass sign'},
      {src:'assets/rides/ladakh-rc390.webp', caption:'A moment with my KTM RC 390 on a Ladakh highway', alt:'Utkarsh leaning toward his orange KTM RC 390 on an open Himalayan road'}
    ]},
    zanskar: { title: 'Zanskar', photos: [
      {src:'assets/rides/zanskar-gombo-ranjan.webp', caption:'Gombo Ranjan and the Zanskar landscape', alt:'Utkarsh in front of the imposing Gombo Ranjan mountain, with prayer flags'}
    ]},
    himachal: { title: 'Himachal', photos: [] },
    sikkim: { title: 'Sikkim', photos: [
      {src:'assets/rides/sikkim-snow-pass.webp', caption:'Snowy mountain roads in Sikkim', alt:'Utkarsh pointing toward snow-covered mountains from beside his motorcycle'},
      {src:'assets/rides/sikkim-rc390.webp', caption:'A mountain stop with the RC 390', alt:'Utkarsh in riding gear standing near his orange KTM RC 390 with snowy peaks behind'}
    ]}
  };
  const galleryDialog = document.getElementById('ride-gallery');
  if (galleryDialog) {
    const galleryTitle = document.getElementById('ride-gallery-title');
    const galleryImage = document.getElementById('ride-gallery-image');
    const galleryEmpty = document.getElementById('ride-gallery-empty');
    const galleryCaption = document.getElementById('ride-gallery-caption');
    const galleryCount = document.getElementById('ride-gallery-count');
    const prev = document.getElementById('ride-prev');
    const next = document.getElementById('ride-next');
    const close = document.getElementById('ride-close');
    let active = 'ladakh';
    let index = 0;
    let trigger = null;

    function renderGallery() {
      const gallery = galleries[active];
      const photos = gallery.photos;
      galleryTitle.textContent = gallery.title;
      if (photos.length) {
        const photo = photos[index];
        galleryImage.src = photo.src;
        galleryImage.alt = photo.alt;
        galleryImage.hidden = false;
        galleryEmpty.hidden = true;
        galleryCaption.textContent = photo.caption;
        galleryCount.textContent = `${index + 1} / ${photos.length}`;
      } else {
        galleryImage.hidden = true;
        galleryImage.removeAttribute('src');
        galleryEmpty.hidden = false;
        galleryCaption.textContent = 'More highlights from Himachal to come.';
        galleryCount.textContent = '';
      }
      prev.disabled = photos.length < 2;
      next.disabled = photos.length < 2;
    }

    document.querySelectorAll('[data-gallery]').forEach(button => {
      button.addEventListener('click', () => {
        const selected = button.dataset.gallery;
        if (!galleries[selected]) return;
        trigger = button;
        active = selected;
        index = 0;
        renderGallery();
        galleryDialog.showModal();
        body.classList.add('ride-modal-open');
        close.focus();
      });
    });
    function stepPhoto(amount) {
      const photos = galleries[active].photos;
      if (photos.length < 2) return;
      index = (index + amount + photos.length) % photos.length;
      renderGallery();
    }
    prev.addEventListener('click', () => stepPhoto(-1));
    next.addEventListener('click', () => stepPhoto(1));
    close.addEventListener('click', () => galleryDialog.close());
    galleryDialog.addEventListener('close', () => {
      body.classList.remove('ride-modal-open');
      if (trigger) trigger.focus();
    });
    galleryDialog.addEventListener('click', event => {
      const rect = galleryDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) galleryDialog.close();
    });
    galleryDialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); stepPhoto(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); stepPhoto(-1); }
    });
  }

  // Explicitly scroll to the top on every click, including when #top is already in the URL.
  document.querySelectorAll('a[href="#top"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      window.scrollTo({top:0,left:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      // Do not leave an unnecessary #top fragment in the shareable URL.
      if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  });

})();
