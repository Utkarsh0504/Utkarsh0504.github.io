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

  document.querySelectorAll('.project-more').forEach(button => {
    button.addEventListener('click', () => {
      const details = document.getElementById(button.getAttribute('aria-controls'));
      const opening = button.getAttribute('aria-expanded') !== 'true';
      details.hidden = !opening;
      button.setAttribute('aria-expanded', String(opening));
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
})();
