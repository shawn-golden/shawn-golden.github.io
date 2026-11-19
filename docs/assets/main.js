const SCRIPT_URL = document.currentScript && document.currentScript.src;
// Everything runs once the page content is available (after the password gate).
function boot() {
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---------- Menu ----------
const button = document.querySelector('.menu-button');
const menu = document.getElementById('site-menu');
const menuOpen = () => button?.getAttribute('aria-expanded') === 'true';

function setMenu(open) {
  button.setAttribute('aria-expanded', String(open));
  button.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
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
        }, 700);
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
document.querySelectorAll('.slide img, .info-panel > img, .work-thumb img').forEach((img) => {
  img.addEventListener(img.closest('.work-thumb') ? 'click' : 'dblclick', () => openViewer(img));
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
  return s?.querySelector('.slide img, .info-panel > img, .work-thumb img');
}

// Shortcut hint: always shown on desktop; the eye button collapses it, and the
// choice is remembered between pages (per browser).
const keys = document.querySelector('.keys');
if (keys && canHover && sections.length > 1) {
  if (!prevLink) {
    // Home and About: no projects to step through, nothing to zoom.
    keys.querySelector('.keys-projects')?.remove();
  }
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
  if (document.body.classList.contains('page-home')) {
    const hero = document.querySelector('.home-hero');
    const past = () => keys.classList.toggle('past-hero', window.scrollY > hero.offsetHeight * 0.6);
    window.addEventListener('scroll', past, { passive: true });
    past();
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
  if (e.metaKey || e.ctrlKey || e.altKey || menuOpen() || document.documentElement.classList.contains('w95-on')) return;
  const t = e.target;
  if (t.closest && t.closest('input, textarea, select, [contenteditable], iframe')) return;
  const k = e.key.toLowerCase();
  if (viewer?.open) {
    if (k === 'arrowdown' || k === 'j' || k === 'arrowup' || k === 'k') {
      e.preventDefault();
      const dir = k === 'arrowdown' || k === 'j' ? 1 : -1;
      const all = [...document.querySelectorAll('.slide img, .info-panel > img, .work-thumb img')];
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
  const tick = () => {
    const [hm, ampm] = fmt.format(new Date()).split(' ');
    const [h, m] = hm.split(':');
    clock.innerHTML = ` · ${h}<span class="colon">:</span>${m} ${ampm || ''}`;
  };
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

  // ---------- Half cards: follow you, then reveal into the full cards ----------
  const pagerEl = document.querySelector('.pager');
  const mini = document.querySelector('.mini-pager');
  if (pagerEl && mini) {
    const cards = { prev: pagerEl.querySelector('.is-prev'), next: pagerEl.querySelector('.is-next') };
    const slices = { prev: mini.querySelector('.is-prev'), next: mini.querySelector('.is-next') };
    let reached = false;
    const update = () => {
      const on = window.scrollY > window.innerHeight * 0.6 && !reached;
      mini.classList.toggle('is-on', on);
      document.body.classList.toggle('has-slices', on);
      document.body.style.setProperty('--slice-h', `${mini.offsetHeight}px`);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    // The slice is the top of the card, so the card starts clipped to the
    // slice's height at the slice's position and opens downward.
    const reveal = () => {
      if (reduceMotion) return;
      for (const dir of ['prev', 'next']) {
        const from = slices[dir].getBoundingClientRect();
        const to = cards[dir].getBoundingClientRect();
        if (!from.height || !to.height) continue;
        const cut = Math.max(0, to.height - from.height);
        cards[dir].animate(
          [
            { transform: `translateY(${from.top - to.top}px)`, clipPath: `inset(0 0 ${cut}px 0 round 6px 6px 0 0)` },
            { transform: 'none', clipPath: 'inset(0 0 0 0 round 6px)' },
          ],
          { duration: 700, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
        );
      }
    };
    new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reached) {
          if (mini.classList.contains('is-on')) reveal();
          reached = true;
        } else if (!e.isIntersecting && e.boundingClientRect.top > 0) {
          reached = false;
        }
        update();
      },
      { threshold: 0.3 }
    ).observe(pagerEl);
  }
  // ---------- Previous / next cards: hard-cut through images on hover ----------
  document.querySelectorAll('[data-flip]').forEach((card) => {
    const img = card.querySelector('.pager-thumb');
    const srcs = card.dataset.flip.split('|');
    if (!img || srcs.length < 2 || reduceMotion) return;
    let timer = 0;
    let i = 0;
    let warmed = false;
    card.addEventListener('mouseenter', () => {
      if (!warmed) srcs.forEach((src) => (new Image().src = src));
      warmed = true;
      clearInterval(timer);
      timer = setInterval(() => {
        i = (i + 1) % srcs.length;
        img.src = srcs[i];
      }, 700);
    });
    card.addEventListener('mouseleave', () => {
      clearInterval(timer);
      i = 0;
      img.src = srcs[0];
    });
  });
  // ---------- Hide / show the top chrome ----------
  // After you start scrolling, a round arrow appears beside the name. It tucks
  // away the name, shortcuts and menu; the arrow stays to bring them back.
  const chromeBtn = document.querySelector('.chrome-toggle');
  if (chromeBtn) {
    const setHidden = (hidden) => {
      document.body.classList.toggle('chrome-hidden', hidden);
      chromeBtn.setAttribute('aria-pressed', String(hidden));
      chromeBtn.setAttribute('aria-label', hidden ? 'Show navigation' : 'Hide navigation');
    };
    // The arrow sets a remembered preference. The chrome always shows at the
    // top of a page; with the preference on, it tucks away again as soon as
    // you scroll down, on any page.
    let prefHidden = false;
    try {
      prefHidden = localStorage.getItem('chrome-hidden') === '1';
    } catch (e) {}
    chromeBtn.addEventListener('click', () => {
      prefHidden = !document.body.classList.contains('chrome-hidden');
      setHidden(prefHidden);
      try {
        localStorage.setItem('chrome-hidden', prefHidden ? '1' : '0');
      } catch (e) {}
    });
    let wasScrolled = null;
    const onScrolled = () => {
      const scrolled = window.scrollY > 120;
      if (scrolled === wasScrolled) return;
      wasScrolled = scrolled;
      document.body.classList.toggle('scrolled', scrolled);
      setHidden(scrolled && prefHidden);
    };
    window.addEventListener('scroll', onScrolled, { passive: true });
    onScrolled();
  }
  // ---------- Page transitions: a wipe in the destination project's color ----------
  const html = document.documentElement;
  if (html.classList.contains('wiping')) {
    try {
      sessionStorage.removeItem('wipe');
    } catch (e) {}
    setTimeout(() => {
      html.classList.add('wipe-out');
      setTimeout(() => html.classList.remove('wiping', 'wipe-out'), 700);
    }, 30);
  }
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      html.classList.remove('wiping', 'wipe-out');
      document.querySelector('.wipe')?.remove();
    }
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduceMotion || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || a.getAttribute('href').startsWith('#') || url.protocol === 'mailto:') return;
    const slug = url.pathname.replace(/\/+$/, '').split('/').pop();
    const color = (window.ACCENTS && window.ACCENTS[slug]) || '#111111';
    e.preventDefault();
    try {
      sessionStorage.setItem('wipe', color);
    } catch (err) {}
    const wipe = document.createElement('div');
    wipe.className = 'wipe';
    wipe.style.background = color;
    document.body.appendChild(wipe);
    requestAnimationFrame(() => wipe.classList.add('is-in'));
    setTimeout(() => (location.href = url.href), 380);
  });
  // ---------- Homepage generative band ----------
  const gen = document.querySelector('.gen');
  if (gen && SCRIPT_URL) {
    const url = new URL('gen.js', SCRIPT_URL);
    url.search = new URL(SCRIPT_URL).search;
    import(url.href).then((m) => m.start(gen, reduceMotion)).catch(() => gen.remove());
  }
  // ---------- Footer email: letters drift away from the cursor ----------
  const emailBtn = document.querySelector('.footer-email');
  if (emailBtn && canHover && !reduceMotion) {
    const chars = [...emailBtn.querySelectorAll('.ch')];
    const footer = emailBtn.closest('footer');
    let raf = 0;
    const scatter = (x, y) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const size = parseFloat(getComputedStyle(emailBtn).fontSize);
        const radius = size * 2.4;
        for (const ch of chars) {
          const r = ch.getBoundingClientRect();
          const cx = r.left + r.width / 2 - (parseFloat(ch.dataset.x) || 0);
          const cy = r.top + r.height / 2 - (parseFloat(ch.dataset.y) || 0);
          const dx = cx - x, dy = cy - y;
          const d = Math.hypot(dx, dy) || 1;
          const force = Math.max(0, 1 - d / radius);
          const push = force * force * size * 0.42;
          const ox = (dx / d) * push, oy = (dy / d) * push;
          ch.dataset.x = ox;
          ch.dataset.y = oy;
          ch.style.transform = push > 0.2 ? `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px) rotate(${(ox * 0.6).toFixed(1)}deg)` : '';
        }
      });
    };
    const settle = () => {
      cancelAnimationFrame(raf);
      chars.forEach((ch) => {
        ch.style.transform = '';
        ch.dataset.x = ch.dataset.y = 0;
      });
    };
    footer.addEventListener('pointermove', (e) => scatter(e.clientX, e.clientY));
    footer.addEventListener('pointerleave', settle);
  }

  // ---------- Principles set themselves, word by word ----------
  document.querySelectorAll('.principle-quote').forEach((q) => {
    if (reduceMotion || q.dataset.split) return;
    q.dataset.split = '1';
    const words = q.textContent.trim().split(/\s+/);
    q.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.style.setProperty('--w', i);
      span.textContent = w;
      q.append(span, i < words.length - 1 ? ' ' : '');
    });
    q.setAttribute('aria-label', words.join(' '));
  });

  // ---------- "Welcome back." on a return visit ----------
  // Shown once, at the start of a new visit, for people who've been here before.
  try {
    if (!sessionStorage.getItem('seen')) {
      sessionStorage.setItem('seen', '1');
      const visits = (parseInt(localStorage.getItem('visits'), 10) || 0) + 1;
      localStorage.setItem('visits', String(visits));
      if (visits > 1) {
        const hello = document.createElement('div');
        hello.className = 'welcome chip';
        hello.setAttribute('role', 'status');
        hello.textContent = 'Welcome back.';
        document.body.appendChild(hello);
        document.body.classList.add('welcoming');
        setTimeout(() => hello.classList.add('is-on'), 600);
        setTimeout(() => {
          hello.classList.remove('is-on');
          document.body.classList.remove('welcoming');
          setTimeout(() => hello.remove(), 500);
        }, 3800);
      }
    }
  } catch (e) {}
  // ---------- Windows 95 mode ----------
  let w95 = null;
  const enterW95 = () => {
    if (w95 || !SCRIPT_URL) return;
    const dataEl = document.getElementById('w95-data');
    if (!dataEl) return;
    if (menuOpen()) setMenu(false);
    const v = new URL(SCRIPT_URL).search;
    if (!document.querySelector('link[data-w95-css]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = new URL('w95.css' + v, SCRIPT_URL).href;
      css.dataset.w95Css = '';
      document.head.appendChild(css);
    }
    w95 = 'loading';
    import(new URL('w95.js' + v, SCRIPT_URL).href)
      .then((m) => {
        w95 = m.start(JSON.parse(dataEl.textContent), { onExit: () => (w95 = null) });
      })
      .catch(() => (w95 = null));
  };
  document.querySelectorAll('[data-w95]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.preventDefault();
      enterW95();
    })
  );
  document.addEventListener('keydown', (e) => {
    if (w95 || e.metaKey || e.ctrlKey || e.altKey || menuOpen() || viewer?.open) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key.toLowerCase() === 'w') enterW95();
  });
  // =================== Micro-interactions ===================

  // Magnetic capsules: lean toward the cursor when it gets close.
  if (canHover && !reduceMotion) {
    const magnets = [...document.querySelectorAll('.menu-button, .chrome-toggle')];
    let mraf = 0;
    window.addEventListener(
      'pointermove',
      (e) => {
        cancelAnimationFrame(mraf);
        mraf = requestAnimationFrame(() => {
          for (const m of magnets) {
            const r = m.getBoundingClientRect();
            if (!r.width) continue;
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const dx = e.clientX - cx, dy = e.clientY - cy;
            const d = Math.hypot(dx, dy);
            const reach = 90;
            const k = d < reach ? (1 - d / reach) * 0.35 : 0;
            m.style.setProperty('--mx', `${(dx * k).toFixed(1)}px`);
            m.style.setProperty('--my', `${(dy * k).toFixed(1)}px`);
          }
        });
      },
      { passive: true }
    );
  }

  // Soft reveal: images that still need to load fade in from the project color.
  document.querySelectorAll('.slide img, .work-thumb img, .info-panel > img').forEach((img) => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('is-loading');
    const done = () => img.classList.remove('is-loading');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });

  // Homepage numbers count up as each group scrolls into view.
  const nums = document.querySelectorAll('.index-num');
  if (nums.length && !reduceMotion && 'IntersectionObserver' in window) {
    const no = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          no.unobserve(en.target);
          const n = en.target;
          const target = parseInt(n.textContent, 10);
          const t0 = performance.now();
          const step = (t) => {
            const p = Math.min(1, (t - t0) / 700);
            n.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3)))).padStart(2, '0');
            if (p < 1) requestAnimationFrame(step);
          };
          n.textContent = '00';
          setTimeout(() => requestAnimationFrame(step), 0);
        }
      },
      { threshold: 1 }
    );
    nums.forEach((n) => no.observe(n));
  }

  // Homepage tags type themselves in on hover.
  if (canHover && !reduceMotion) {
    document.querySelectorAll('.index-row a').forEach((a) => {
      const tags = a.querySelector('.index-tags');
      if (!tags) return;
      const full = tags.textContent;
      let timer = 0;
      a.addEventListener('mouseenter', () => {
        clearInterval(timer);
        let i = 0;
        tags.textContent = '';
        timer = setInterval(() => {
          i += 2;
          tags.textContent = full.slice(0, i);
          if (i >= full.length) clearInterval(timer);
        }, 16);
      });
      a.addEventListener('mouseleave', () => {
        clearInterval(timer);
        tags.textContent = full;
      });
    });
  }

  // Project pages: reading progress in the name capsule; the big title
  // tightens and fades as you scroll past it.
  const wordmark = document.querySelector('.wordmark');
  const projTitle = document.querySelector('.project-title');
  if (wordmark && document.body.classList.contains('page-project')) {
    let praf = 0;
    const onProg = () => {
      cancelAnimationFrame(praf);
      praf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        wordmark.style.setProperty('--progress', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
        if (projTitle && !reduceMotion) {
          const h = projTitle.offsetTop + projTitle.offsetHeight;
          const p = Math.min(1, Math.max(0, window.scrollY / h));
          projTitle.style.setProperty('--tp', p.toFixed(3));
        }
      });
    };
    window.addEventListener('scroll', onProg, { passive: true });
    onProg();
  }

  // C copies the email from anywhere.
  const toast = (text) => {
    const t = document.createElement('div');
    t.className = 'welcome chip';
    t.setAttribute('role', 'status');
    t.textContent = text;
    document.body.appendChild(t);
    document.body.classList.add('welcoming');
    requestAnimationFrame(() => t.classList.add('is-on'));
    setTimeout(() => {
      t.classList.remove('is-on');
      document.body.classList.remove('welcoming');
      setTimeout(() => t.remove(), 500);
    }, 1800);
  };
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'c' || e.metaKey || e.ctrlKey || e.altKey || menuOpen()) return;
    if (document.documentElement.classList.contains('w95-on') || viewer?.open) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (window.getSelection && String(window.getSelection())) return; // don't fight real copying
    const email = document.querySelector('.footer-email')?.dataset.email;
    if (!email) return;
    navigator.clipboard?.writeText(email).then(() => toast('Email copied. Talk soon.'), () => (location.href = `mailto:${email}`));
  });
  // Demo reel: hide the chrome and project links while the Vimeo video plays.
  const reel = document.querySelector('iframe[src*="player.vimeo.com"]');
  if (reel) {
    const send = (method, value) => reel.contentWindow?.postMessage(JSON.stringify(value ? { method, value } : { method }), 'https://player.vimeo.com');
    const subscribe = () => ['play', 'pause', 'ended'].forEach((ev) => send('addEventListener', ev));
    window.addEventListener('message', (e) => {
      if (e.origin !== 'https://player.vimeo.com') return;
      let d;
      try {
        d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch (_) {
        return;
      }
      if (d.event === 'ready') subscribe();
      else if (d.event === 'play') document.body.classList.add('reel-playing');
      else if (d.event === 'pause' || d.event === 'ended') document.body.classList.remove('reel-playing');
    });
    reel.addEventListener('load', subscribe);
    // Scrolling to the very top or bottom of the page brings the chrome back.
    window.addEventListener('scroll', () => {
      if (!document.body.classList.contains('reel-playing')) return;
      const atTop = window.scrollY < 8;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
      if (atTop || atBottom) document.body.classList.remove('reel-playing');
    }, { passive: true });
  }
  // Client marquee: start scrolling only once it's on screen, so the first
  // names people see are the strongest ones.
  const marquee = document.querySelector('.marquee');
  if (marquee) {
    if (!('IntersectionObserver' in window)) marquee.classList.add('is-playing');
    else {
      const mo = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          marquee.classList.add('is-playing');
          mo.disconnect();
        }
      }, { threshold: 0.6 });
      mo.observe(marquee);
    }
  }
}
if (document.body.hasAttribute('data-locked')) document.addEventListener('site:unlocked', boot, { once: true });
else boot();
