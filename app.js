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

  // Each project can be opened or closed independently so multiple details can be compared.
  document.querySelectorAll('.project-more').forEach(button => {
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      button.setAttribute('aria-expanded', String(opening));
      if (panel) panel.hidden = !opening;
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

  // Inline, accessible, destination-specific photo gallery (no modal).
  const galleries = {
    ladakh: {title:'Ladakh', photos:[
      {src:'assets/rides/ladakh-khardung-la.webp', caption:'At Khardung La.', alt:'Utkarsh sitting in front of the Khardung La mountain pass sign'},
      {src:'assets/rides/ladakh-rc390.webp', caption:'A moment with my KTM RC 390 on a Ladakh highway.', alt:'Utkarsh with his orange KTM RC 390 on an open mountain road'}
    ]},
    zanskar: {title:'Zanskar', photos:[
      {src:'assets/rides/zanskar-gombo-ranjan.webp',caption:'The striking Gombo Ranjan peak in Zanskar.',alt:'Utkarsh at Gombo Ranjan peak, with colorful prayer flags'}
    ]},
    himachal: {title:'Himachal', photos:[
      {src:'assets/rides/himachal-stadium.webp',caption:'A stop at a mountain cricket ground in Himachal.',alt:'Utkarsh seated at a cricket stadium with mountains in the background'}
    ]},
    sikkim: {title:'Sikkim', photos:[
      {src:'assets/rides/sikkim-snow-pass.webp',caption:'Snow-covered routes in Sikkim.',alt:'Utkarsh pointing toward a snowy mountain road in Sikkim'},
      {src:'assets/rides/sikkim-rc390.webp',caption:'On the road with the RC 390 in Sikkim.',alt:'Utkarsh standing next to his orange KTM RC 390 with snow-covered peaks behind'}
    ]},
    kashmir: {title:'Kashmir', photos:[
      {src:'assets/rides/kashmir-highway.webp',caption:'An open stretch of road in Kashmir.',alt:'Winding mountain road beneath expansive clouds in Kashmir'},
      {src:'assets/rides/kashmir-zojila.webp',caption:'KTM RC 390 at Zojila Pass.',alt:'Utkarsh on the orange KTM RC 390 at the Zojila Pass sign'}
    ]}
  };
  const galleryPanel = document.getElementById('ride-inline-gallery');
  if (galleryPanel) {
    const tabs = [...document.querySelectorAll('.ride-place')];
    const image = document.getElementById('ride-gallery-image');
    const title = document.getElementById('ride-gallery-title');
    const count = document.getElementById('ride-gallery-count');
    const dots = document.getElementById('ride-photo-dots');
    const caption = document.getElementById('ride-gallery-caption');
    const thumbs = document.getElementById('ride-photo-strip');
    const total = document.getElementById('ride-photo-total');
    const prev = document.getElementById('ride-prev');
    const next = document.getElementById('ride-next');
    const placeholder = document.getElementById('ride-gallery-prompt');
    let currentPlace = null;
    let currentPhoto = 0;

    function renderPhoto() {
      const gallery = galleries[currentPlace];
      const photo = gallery.photos[currentPhoto];
      image.src = photo.src;
      image.alt = photo.alt;
      title.textContent = gallery.title;
      count.textContent = `${currentPhoto + 1} of ${gallery.photos.length}`;
      caption.textContent = photo.caption;
      dots.replaceChildren();
      for (let i=0;i<gallery.photos.length;i++) {
        const dot=document.createElement('i');
        if (i===currentPhoto) dot.classList.add('selected');
        dots.appendChild(dot);
      }
      dots.setAttribute('aria-label',`Photo ${currentPhoto+1} of ${gallery.photos.length}`);
      thumbs.querySelectorAll('.ride-thumb').forEach(node=>node.remove());
      gallery.photos.forEach((item,i)=>{
        const button=document.createElement('button');
        button.type='button';
        button.className='ride-thumb'+(i===currentPhoto?' active':'');
        button.setAttribute('aria-label',`Show ${gallery.title} photo ${i+1}`);
        button.setAttribute('aria-pressed',String(i===currentPhoto));
        const thumb=document.createElement('img');
        thumb.src=item.src;
        thumb.alt='';
        thumb.loading='lazy';
        button.appendChild(thumb);
        button.addEventListener('click',()=>{currentPhoto=i;renderPhoto();});
        thumbs.insertBefore(button,total);
      });
      total.textContent=`${gallery.title} · ${gallery.photos.length} ${gallery.photos.length===1?'photo':'photos'}`;
      prev.disabled=gallery.photos.length<2;
      next.disabled=gallery.photos.length<2;
    }

    function selectPlace(place) {
      if (!galleries[place]) return;
      // The selected destination stays expanded and can be changed with one click.
      currentPlace=place;
      currentPhoto=0;
      tabs.forEach(tab=>{
        const on=tab.dataset.gallery===place;
        tab.classList.toggle('active',on);
        tab.setAttribute('aria-expanded',String(on));
        tab.setAttribute('aria-pressed',String(on));
      });
      galleryPanel.hidden=false;
      placeholder.hidden=true;
      renderPhoto();
    }
    tabs.forEach(button=>button.addEventListener('click',()=>selectPlace(button.dataset.gallery)));
    function stepPhoto(amount){
      const len=galleries[currentPlace].photos.length;
      if(len<2)return;
      currentPhoto=(currentPhoto+amount+len)%len;
      renderPhoto();
    }
    prev.addEventListener('click',()=>stepPhoto(-1));
    next.addEventListener('click',()=>stepPhoto(1));
    galleryPanel.addEventListener('keydown',e=>{
      if(e.key==='ArrowRight'){e.preventDefault();stepPhoto(1);}
      if(e.key==='ArrowLeft'){e.preventDefault();stepPhoto(-1);}
    });
    // The gallery starts unselected; clicking any one of the five tabs opens its images.
    tabs.forEach(tab=>{
      tab.classList.remove('active');
      tab.setAttribute('aria-expanded','false');
      tab.setAttribute('aria-pressed','false');
    });
  }

  // Force top navigation even when already on #top or after browser-history restoration.
  document.querySelectorAll('a[href="#top"]').forEach(link=>{
    link.addEventListener('click',event=>{
      event.preventDefault();
      window.scrollTo({top:0,left:0,behavior:'instant'});
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
      if(window.location.hash) window.history.replaceState(null,'',window.location.pathname+window.location.search);
    });
  });
})();
