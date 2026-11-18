document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---------- Menu ----------
const button = document.querySelector('.menu-button');
const menu = document.getElementById('site-menu');
const menuOpen = () => button?.getAttribute('aria-expanded') === 'true';

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
      if (!menuOpen()) menu.hidden = true;
    }, 300);
  }
}
button?.addEventListener('click', () => setMenu(!menuOpen()));

// ---------- Reveal on scroll ----------
const reveals = document.querySelectorAll('.slide, .info-slide, .slide-row, .principle');
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
  reveals.forEach((s) => io.observe(s));
} else {
  reveals.forEach((s) => s.classList.add('is-in'));
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
              v.addEventListener('loadeddata', () => --pending === 0 && m.classList.add('is-ready'), { once: true });
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

// ---------- Home: hover preview ----------
// Hovering a project hard-cuts through its images in place. No transitions.
const preview = document.querySelector('.index-preview');
if (preview && canHover && window.innerWidth >= 900) {
  const img = new Image();
  img.alt = '';
  preview.appendChild(img);
  const cache = new Map();
  let timer = 0;
  const place = (e) => {
    const h = preview.offsetHeight;
    const y = Math.max(24, Math.min(window.innerHeight - h - 40, e.clientY - h / 2));
    preview.style.setProperty('--y', `${y}px`);
  };
  document.querySelectorAll('.index-row a').forEach((a) => {
    const srcs = a.dataset.stack.split('|');
    a.addEventListener('mouseenter', (e) => {
      if (!cache.has(a)) cache.set(a, srcs.map((src) => Object.assign(new Image(), { src })));
      let i = 0;
      img.src = srcs[0];
      place(e);
      preview.classList.add('is-on');
      clearInterval(timer);
      if (!reduceMotion && srcs.length > 1) {
        timer = setInterval(() => {
          i = (i + 1) % srcs.length;
          img.src = srcs[i];
        }, 350);
      }
    });
    a.addEventListener('mousemove', place);
    a.addEventListener('mouseleave', () => {
      preview.classList.remove('is-on');
      clearInterval(timer);
    });
  });
}

// ---------- Viewer (Z to zoom) ----------
const viewer = document.querySelector('.viewer');
const viewerImg = viewer?.querySelector('img');
function openViewer(img) {
  if (!viewer || !img) return;
  viewerImg.src = img.dataset.full || img.currentSrc || img.src;
  viewerImg.alt = img.alt;
  if (!viewer.open) viewer.showModal();
}
function closeViewer() {
  if (viewer?.open) viewer.close();
}
viewer?.addEventListener('click', (e) => {
  if (e.target === viewer || e.target.classList.contains('viewer-close')) closeViewer();
});
document.querySelectorAll('.slide img, .info-panel > img').forEach((img) => {
  img.addEventListener('dblclick', () => openViewer(img));
});

// ---------- Keyboard ----------
// ↓ / ↑ (or J / K) move between sections, ← / → move between projects,
// Z zooms the section in view. The deck this site came from worked the same way.
const sections = [...document.querySelectorAll('[data-section]')];
const prevLink = document.querySelector('link[rel=prev]')?.href;
const nextLink = document.querySelector('link[rel=next]')?.href;

function currentIndex() {
  const mid = window.innerHeight * 0.35;
  let idx = 0;
  sections.forEach((s, i) => {
    if (s.getBoundingClientRect().top <= mid) idx = i;
  });
  return idx;
}
function goTo(i) {
  const s = sections[Math.max(0, Math.min(sections.length - 1, i))];
  if (!s) return;
  const top = s.getBoundingClientRect().top + window.scrollY - (s.matches('.project-hero, .home-hero') ? 0 : 24);
  window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
}
function imageInSection(i) {
  const s = sections[i];
  return s?.querySelector('.slide img, .info-panel > img');
}

// Shortcut hint: always shown on desktop; the eye button collapses it, and the
// choice is remembered between pages (per browser).
const keys = document.querySelector('.keys');
if (keys && canHover && sections.length > 3) {
  if (!prevLink) keys.querySelector('.keys-projects')?.remove();
  const toggle = keys.querySelector('.keys-toggle');
  const setCollapsed = (collapsed) => {
    keys.classList.toggle('is-collapsed', collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Show keyboard shortcuts' : 'Hide keyboard shortcuts');
  };
  let saved = false;
  try {
    saved = localStorage.getItem('keys-hidden') === '1';
  } catch (e) {}
  setCollapsed(saved);
  keys.classList.add('is-on');
  const foot = document.querySelector('.site-footer');
  if (foot && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => keys.classList.toggle('over-footer', e.isIntersecting), {
      rootMargin: '0px 0px -40px 0px',
    }).observe(foot);
  }
  toggle.addEventListener('click', () => {
    const collapsed = !keys.classList.contains('is-collapsed');
    setCollapsed(collapsed);
    try {
      localStorage.setItem('keys-hidden', collapsed ? '1' : '0');
    } catch (e) {}
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (viewer?.open) return; // dialog handles its own Escape
    if (menuOpen()) {
      setMenu(false);
      button.focus();
    }
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey || menuOpen()) return;
  const t = e.target;
  if (t.closest && t.closest('input, textarea, select, [contenteditable], iframe')) return;
  const k = e.key.toLowerCase();
  if (viewer?.open) {
    if (k === 'arrowdown' || k === 'j' || k === 'arrowup' || k === 'k') {
      e.preventDefault();
      const dir = k === 'arrowdown' || k === 'j' ? 1 : -1;
      const all = [...document.querySelectorAll('.slide img, .info-panel > img')];
      const at = all.findIndex((img) => (img.dataset.full || img.src) === viewerImg.getAttribute('src'));
      const nextImg = all[at + dir];
      if (nextImg) openViewer(nextImg);
    } else if (k === 'z') {
      closeViewer();
    }
    return;
  }
  let handled = true;
  if (k === 'arrowdown' || k === 'j') goTo(currentIndex() + 1);
  else if (k === 'arrowup' || k === 'k') goTo(currentIndex() - 1);
  else if (k === 'arrowright' && nextLink) location.href = nextLink;
  else if (k === 'arrowleft' && prevLink) location.href = prevLink;
  else if (k === 'z') {
    const img = imageInSection(currentIndex()) || imageInSection(currentIndex() + 1);
    if (img) openViewer(img);
    else handled = false;
  } else handled = false;
  if (handled) e.preventDefault();
});

// ---------- Live demo: scroll gallery ----------
const tracks = [...document.querySelectorAll('.demo-track')];
if (tracks.length) {
  let ticking = false;
  const update = () => {
    ticking = false;
    for (const track of tracks) {
      const box = track.closest('.demo');
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) continue;
      const progress = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const max = track.scrollWidth - track.parentElement.clientWidth;
      track.style.transform = `translate3d(${-progress * max}px,0,0)`;
    }
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  if (!reduceMotion) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
}

// ---------- Live demo: collage CTA ----------
document.querySelectorAll('.demo-collage').forEach((demo) => {
  const play = () => {
    demo.classList.remove('is-playing');
    void demo.offsetWidth; // restart the transition
    demo.classList.add('is-playing');
  };
  if (reduceMotion || !('IntersectionObserver' in window)) {
    demo.classList.add('is-playing', 'no-motion');
    return;
  }
  const co = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        play();
        co.disconnect();
      }
    },
    { threshold: 0.45 }
  );
  co.observe(demo);
  demo.querySelector('.demo-replay')?.addEventListener('click', play);
});

// ---------- Footer: copy email ----------
document.querySelectorAll('.footer-email').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      btn.classList.add('is-copied');
      setTimeout(() => btn.classList.remove('is-copied'), 2200);
    } catch (e) {
      location.href = `mailto:${email}`;
    }
  });
});

// ---------- Footer: Detroit clock ----------
const clock = document.querySelector('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', hour: 'numeric', minute: '2-digit' });
  const tick = () => (clock.textContent = ` · ${fmt.format(new Date())}`);
  tick();
  setInterval(tick, 15000);
}

// ---------- Footer: build log ----------
const buildBtn = document.querySelector('.footer-build');
const log = document.getElementById('build-log');
function openLog() {
  if (!log || !log.hidden) return;
  const nav = performance.getEntriesByType('navigation')[0];
  const ms = nav ? nav.loadEventEnd || nav.domContentLoadedEventEnd : performance.now();
  const t = log.querySelector('[data-load-time]');
  if (t) t.textContent = ms ? `${(ms / 1000).toFixed(2)}s` : 'under a second';
  log.hidden = false;
  buildBtn.setAttribute('aria-expanded', 'true');
  const rows = [...log.children];
  rows.forEach((r, i) => {
    r.style.setProperty('--d', `${reduceMotion ? 0 : i * 140}ms`);
  });
  requestAnimationFrame(() => log.classList.add('is-open'));
  log.closest('footer').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' });
}
function closeLog() {
  log.classList.remove('is-open');
  log.hidden = true;
  buildBtn.setAttribute('aria-expanded', 'false');
}
buildBtn?.addEventListener('click', () => (log.hidden ? openLog() : closeLog()));
document.querySelectorAll('[data-open-build]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    if (menuOpen()) setMenu(false);
    setTimeout(openLog, 200);
  })
);
if (location.hash === '#colophon') setTimeout(openLog, 400);
