document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Menu ----------
const button = document.querySelector('.menu-button');
const menu = document.getElementById('site-menu');

function setMenu(open) {
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', open);
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menu.querySelector('a')?.focus({ preventScroll: true });
  } else {
    menu.classList.remove('is-open');
    setTimeout(() => {
      if (button.getAttribute('aria-expanded') === 'false') menu.hidden = true;
    }, 300);
  }
}
button?.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    button.focus();
  }
});

// ---------- Slide reveal ----------
const slides = document.querySelectorAll('.slide');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  slides.forEach((s) => io.observe(s));
} else {
  slides.forEach((s) => s.classList.add('is-in'));
}

// ---------- Videos: load when near, play only while visible ----------
// Each slide's motion layer (videos + tints + foreground) fades in only once
// every clip in it has a frame, so the still underneath is never tinted twice.
const motions = document.querySelectorAll('.slide-motion');
if (!reduceMotion && motions.length && 'IntersectionObserver' in window) {
  const mo = new IntersectionObserver(
    (entries) => {
      for (const { target: m, isIntersecting } of entries) {
        const vids = [...m.querySelectorAll('video')];
        if (isIntersecting) {
          if (!m.dataset.loaded) {
            m.dataset.loaded = '1';
            let pending = vids.length;
            vids.forEach((v) => {
              v.addEventListener(
                'loadeddata',
                () => {
                  if (--pending === 0) m.classList.add('is-ready');
                },
                { once: true }
              );
              v.src = v.dataset.src;
            });
          }
          vids.forEach((v) => v.play().catch(() => {}));
        } else {
          vids.forEach((v) => v.pause());
        }
      }
    },
    { rootMargin: '200px 0px' }
  );
  motions.forEach((m) => mo.observe(m));
}

// ---------- Home index hover preview ----------
const preview = document.querySelector('.index-preview');
if (preview && window.matchMedia('(hover: hover) and (min-width: 900px)').matches) {
  let raf = 0;
  const move = (e) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const w = preview.offsetWidth;
      const h = preview.offsetHeight;
      const x = window.innerWidth - w - 96;
      const y = Math.max(24, Math.min(window.innerHeight - h - 24, e.clientY - h / 2));
      preview.style.setProperty('--x', `${x}px`);
      preview.style.setProperty('--y', `${y}px`);
    });
  };
  document.querySelectorAll('.index-row a').forEach((a) => {
    a.addEventListener('mouseenter', (e) => {
      preview.src = a.dataset.thumb;
      move(e);
      preview.classList.add('is-on');
    });
    a.addEventListener('mousemove', move);
    a.addEventListener('mouseleave', () => preview.classList.remove('is-on'));
  });
}
