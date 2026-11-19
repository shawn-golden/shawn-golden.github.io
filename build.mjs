// Generates the static site into docs/ (GitHub Pages can serve this folder).
// Usage: node build.mjs
import { mkdirSync, writeFileSync, copyFileSync, existsSync, rmSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto';
import { site, projects, demoReel, about, groups, principles, alts } from './content/site.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'docs');
const SLIDES_DIR = join(OUT, 'assets', 'slides');
const VIDEO_DIR = join(OUT, 'assets', 'video');
const SLIDE_W = 1920;
const SLIDE_H = 1080;

const visible = projects.filter((p) => !p.hidden);
const bySlug = Object.fromEntries([...visible, demoReel].map((p) => [p.slug, p]));
const VERSION = createHash('sha1')
  .update(['styles.css', 'main.js', 'gate.js', 'gen.js', 'w95.js', 'w95.css'].map((f) => readFileSync(join(ROOT, 'src', f), 'utf8')).join(''))
  .digest('hex')
  .slice(0, 8);
const missingVideos = new Set();
const missingAlts = new Set();

// Site order follows the homepage groups.
const grouped = groups.map((g) => ({ name: g.name, items: g.slugs.map((s) => bySlug[s]).filter(Boolean) }));
const listed = new Set(grouped.flatMap((g) => g.items.map((p) => p.slug)));
const leftovers = visible.filter((p) => !listed.has(p.slug));
if (leftovers.length) grouped[grouped.length - 1].items.push(...leftovers);
const order = grouped.flatMap((g) => g.items);

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Contrast of a project's text color on its accent; below 7:1 the softened
// (70%) labels would fall under 4.5:1, so those projects keep labels solid.
const contrast = (accent, dark) => {
  const c = accent.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255);
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  return dark ? 1.05 / (L + 0.05) : (L + 0.05) / 0.05;
};
const lowc = (p) => (p && p.accent && contrast(p.accent, p.dark) < 7 ? ' is-lowc' : '');
const pct = (v, total) => `${+((v / total) * 100).toFixed(4)}%`;
const has2x = (name) => existsSync(join(SLIDES_DIR, `${name}-2x.webp`));
const altFor = (name, fallback) => {
  if (alts[name]) return alts[name];
  missingAlts.add(name);
  return fallback;
};
const slideSrc = (s) => (typeof s === 'string' ? s : s.src || (s.row && s.row[0]));
const slideImages = (p) =>
  p.slides.flatMap((s) => (typeof s === 'string' ? [s] : s.row ? s.row : s.body ? [] : [s.src]));

function pictureTag(name, root, alt, { eager = false, half = false } = {}) {
  const base = `${root}assets/slides/${name}`;
  const [w, h] = half ? [944, 1080] : [SLIDE_W, SLIDE_H];
  const set = half
    ? `${base}-sm.webp 480w, ${base}.webp 944w${has2x(name) ? `, ${base}-2x.webp 1888w` : ''}`
    : `${base}-sm.webp 960w, ${base}.webp 1920w${has2x(name) ? `, ${base}-2x.webp 3200w` : ''}`;
  const sizes = half ? '(max-width: 700px) 100vw, 50vw' : '(max-width: 1000px) 100vw, min(100vw, 1760px)';
  return `<img src="${base}.webp" srcset="${set}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" data-full="${base}${has2x(name) ? '-2x' : ''}.webp" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function boxStyle(v, W = SLIDE_W, H = SLIDE_H) {
  return [
    `left:${pct(v.x, W)}`,
    `top:${pct(v.y, H)}`,
    `width:${pct(v.w, W)}`,
    `height:${pct(v.h, H)}`,
    v.rotate ? `transform:rotate(${v.rotate}deg)` : '',
    v.radius ? `border-radius:${pct(v.radius, v.w)} / ${pct(v.radius, v.h)}` : '',
    v.color ? `background:${v.color}` : '',
    v.blend ? `mix-blend-mode:${v.blend}` : '',
    v.round ? 'border-radius:50%' : '',
  ]
    .filter(Boolean)
    .join(';');
}

// Motion layers sit on top of the still slide and fade in together once the
// clips can play: videos, then blend tints (recreating Figma blend modes),
// then foreground artwork that was layered above the video in Figma.
function motionLayers(s, root, W = SLIDE_W, H = SLIDE_H) {
  const videos = s.videos || [];
  if (!videos.length) return '';
  const missing = videos.filter((v) => !existsSync(join(VIDEO_DIR, v.file)));
  if (missing.length) {
    missing.forEach((v) => missingVideos.add(v.file));
    return '';
  }
  const vids = videos
    .map((v) => `<video class="slide-video" style="${boxStyle(v, W, H)}" data-src="${root}assets/video/${esc(v.file)}" muted loop playsinline preload="none" aria-hidden="true"></video>`)
    .join('');
  const blends = (s.blends || []).map((b) => `<div class="slide-layer" style="${boxStyle(b, W, H)}"></div>`).join('');
  const under = (s.under || []).map((u) => `<div class="slide-layer" style="${boxStyle(u, W, H)}"></div>`).join('');
  const overlays = (s.overlays || [])
    .map((o) => `<img class="slide-layer" style="${boxStyle(o, W, H)}" src="${root}assets/overlays/${esc(o.img)}" alt="" loading="lazy" decoding="async">`)
    .join('');
  return `<div class="slide-motion">${under}${vids}${blends}${overlays}</div>`;
}

// Inline text formatting for content strings: _italic_.
const rich = (t) => esc(t).replace(/_(.+?)_/g, '<em>$1</em>');

// ---------- Live demos (Tap to Pay info slides) ----------
const DEMO_PHOTOS = ['sunflower', 'face', 'jacket', 'drink', 'ladder', 'brushes', 'shadow', 'brown', 'produce'];
function demoMarkup(kind, root) {
  const img = (n, extra = '') => `<img src="${root}assets/demo/${n}.webp" alt="" loading="lazy" decoding="async"${extra}>`;
  if (kind === 'scroll-gallery') {
    return `<div class="demo demo-gallery" aria-label="Live demo: a gallery that moves as you scroll">
          <div class="demo-page">
            <p class="demo-kicker">New</p>
            <p class="demo-head">Sell on the go.</p>
            <div class="demo-track">${DEMO_PHOTOS.concat(DEMO_PHOTOS.slice(0, 3)).map((n) => `<span class="demo-tile">${img(n)}</span>`).join('')}</div>
          </div>
          <p class="demo-note">Live demo · scroll the page</p>
        </div>`;
  }
  if (kind === 'collage') {
    // Final positions (% of the stage) and the side each photo flies in from.
    const spots = [
      ['sunflower', 3, 6, 19, 'l'], ['face', 25, 2, 15, 't'], ['jacket', 60, 3, 13, 't'],
      ['drink', 77, 8, 20, 'r'], ['ladder', 2, 42, 17, 'l'], ['brushes', 81, 44, 17, 'r'],
      ['shadow', 8, 72, 18, 'b'], ['brown', 72, 72, 18, 'b'], ['produce', 44, 74, 10, 'b'],
    ];
    return `<div class="demo demo-collage" aria-label="Live demo: photos fly in to frame a call to action">
          <div class="demo-stage">
            ${spots.map(([n, x, y, w, from], i) => `<span class="demo-piece from-${from}" style="left:${x}%;top:${y}%;width:${w}%;--i:${i}">${img(n)}</span>`).join('')}
            <div class="demo-cta"><p class="demo-head">Take your first tap.</p><span class="demo-btn">Get started</span></div>
          </div>
          <button class="demo-replay" type="button">Replay</button>
        </div>`;
  }
  return '';
}

// Info slide: live text on the left, the demo panel (image + any video) on the right.
// Panel coordinates are in the panel's own pixels (Figma: 1387×922).
const PANEL_W = 1387;
const PANEL_H = 922;
function infoSlide(s, project, root) {
  const base = `${root}assets/slides/${s.src}-panel`;
  const figs = (s.figures || [])
    .map((f) => `<img src="${root}assets/slides/${f.img}" width="${f.w}" height="${f.h}" style="width:${f.w}px" alt="${esc(f.alt || '')}" loading="lazy" decoding="async">`)
    .join('');
  const panelImg = `<img src="${base}.webp" srcset="${base}-sm.webp 800w, ${base}.webp 1387w, ${base}-2x.webp 2774w" sizes="(max-width: 900px) 100vw, 70vw" width="${PANEL_W}" height="${PANEL_H}" alt="${esc(`${project.title}: ${s.title}`)}" data-full="${base}-2x.webp" loading="lazy" decoding="async">`;
  return `<section class="info-slide" data-section>
        <div class="info-text">
          <p class="label">${esc(s.eyebrow || 'Interaction design')}</p>
          <h2 class="info-title">${esc(s.title)}</h2>
          <div class="info-body">${s.body.map((p) => `<p>${rich(p)}</p>`).join('')}</div>
          ${figs ? `<div class="info-figs">${figs}</div>` : ''}
        </div>
        <figure class="info-panel${s.demo ? ' has-demo' : ''}">
          ${s.demo ? demoMarkup(s.demo, root) : `${panelImg}${motionLayers(s, root, PANEL_W, PANEL_H)}`}
        </figure>
      </section>`;
}

function principleBlock(pr) {
  return `<blockquote class="principle" data-section>
        <p class="principle-quote">${esc(pr.quote)}</p>
        <footer class="label">${esc(pr.source)}</footer>
      </blockquote>`;
}

function slideFigure(slide, i, project, root) {
  const s = typeof slide === 'string' ? { src: slide } : slide;
  if (s.body) return infoSlide(s, project, root);
  if (s.row) {
    return `<div class="slide-row cols-${s.row.length}" data-section>${s.row
      .map((n) => `<figure class="slide slide-half">${pictureTag(n, root, altFor(n, project.title), { half: true })}</figure>`)
      .join('')}</div>`;
  }
  const fig = `<figure class="slide${i === 0 ? ' reveal-now' : ''}"${s.caption ? '' : ' data-section'}>${pictureTag(s.src, root, altFor(s.src, `${project.title}, image ${i + 1}`), { eager: i === 0 })}${motionLayers(s, root)}</figure>`;
  return s.caption ? `<div class="slide-group" data-section><p class="slide-caption label">${esc(s.caption)}</p>${fig}</div>` : fig;
}

function slidesWithPrinciples(p, root) {
  const prs = principles[p.slug] || [];
  return p.slides
    .map((s, i) => {
      const after = prs.filter((pr) => pr.after === slideSrc(s)).map(principleBlock).join('');
      return slideFigure(s, i, p, root) + after;
    })
    .join('\n      ');
}

function menu(root, current) {
  return `
  <button class="menu-button chip" aria-expanded="false" aria-controls="site-menu"><span class="menu-label">Menu</span><span class="menu-icon" aria-hidden="true"><span></span><span></span></span></button>
  <nav class="menu" id="site-menu" aria-label="Site" hidden>
    <div class="menu-inner">
      <div class="menu-col">
        ${grouped
          .map(
            (g) => `<p class="label">${esc(g.name)}</p>
        <ol class="menu-list">
          ${g.items.map((p) => `<li><a href="${root}${p.slug}/"${p.slug === current ? ' aria-current="page"' : ''}>${esc(p.title)}</a></li>`).join('')}
        </ol>`
          )
          .join('')}
      </div>
      <div class="menu-col">
        <p class="label">Info</p>
        <ol class="menu-list menu-list-sm">
          <li><a href="${root}"${current === 'home' ? ' aria-current="page"' : ''}>Home</a></li>
          <li><a href="${root}work/"${current === 'work' ? ' aria-current="page"' : ''}>All work</a></li>
          <li><a href="${root}about/"${current === 'about' ? ' aria-current="page"' : ''}>About</a></li>
          <li><a href="#colophon" data-open-build>Colophon</a></li>
          <li><a href="#w95" data-w95>Windows 95 mode</a></li>
          <li><a href="mailto:${site.email}">${esc(site.email)}</a></li>
        </ol>
      </div>
    </div>
  </nav>`;
}

// Data for Windows 95 mode (inside each page's encrypted body).
function w95Data(root) {
  const projectsData = order.map((p) => {
    const isReel = p === demoReel;
    return {
      slug: p.slug,
      title: p.title,
      accent: isReel ? '#cccccc' : p.accent,
      role: p.role ? p.role.join(', ') : '',
      summary: p.summary,
      tags: p.tags.join(' · '),
      href: `${root}${p.slug}/`,
      images: (isReel ? [p.thumb] : slideImages(p)).map((n) => `${root}assets/slides/${n}-sm.webp`),
    };
  });
  const aboutText = [
    'ABOUT ME.TXT',
    '',
    about.intro,
    '',
    ...about.bio.flatMap((b) => [b, '']),
    'EXPERIENCE',
    ...about.experience.map((e) => `  ${e.role}, ${e.company} (${e.dates})`),
    '',
    `Say hi: ${site.email}`,
  ].join('\n');
  return JSON.stringify({ projects: projectsData, about: aboutText, email: site.email, workHref: `${root}work/` }).replace(/</g, '\\u003c');
}

// Reading-progress bar color: the project accent, or white when the accent
// is too dark to see on the black name capsule (Ultra, Email).
function barColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum < 0.25 ? '#ffffff' : hex;
}

function layout({ title, description, root, current, body, bodyClass = '', bodyStyle = '', og, theme, prev, next, crumb }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.titles.join(', ')}`;
  const ogUrl = og ? `${site.url}/assets/og/${og}.png` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
${ogUrl ? `<meta property="og:image" content="${ogUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="${theme || '#f6f6f6'}">
${prev ? `<link rel="prev" href="${prev}">` : ''}
${next ? `<link rel="next" href="${next}">` : ''}
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&family=Inter:opsz,wght@14..32,400;14..32,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}assets/styles.css?v=${VERSION}">
<script>document.documentElement.classList.add('js');window.ACCENTS=${JSON.stringify(Object.fromEntries([...visible.map((p) => [p.slug, p.accent]), [demoReel.slug, '#cccccc']]))};try{var w=sessionStorage.getItem('wipe');if(w){document.documentElement.style.setProperty('--wipe',w);document.documentElement.classList.add('wiping')}}catch(e){}</script>
<script src="${root}assets/gate.js?v=${VERSION}" defer></script>
<script src="${root}assets/main.js?v=${VERSION}" defer></script>
</head>
<body class="${bodyClass}"${bodyStyle ? ` style="${bodyStyle}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <button class="chrome-toggle chip" type="button" aria-pressed="false" aria-label="Hide navigation"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <a class="wordmark chip" href="${root}"${crumb ? ` style="--crumb-accent:${barColor(crumb.accent)}"` : ''}><img class="wave" src="${root}assets/cursors/wave-hand.svg?v=ce11431e" alt="" width="70" height="73"><span>${esc(site.name)}</span>${crumb ? `<span class="crumb-sep" aria-hidden="true">/</span><span class="crumb"><i style="background:${crumb.accent}"></i>${esc(crumb.title)}</span>` : ''}<span class="read-progress" aria-hidden="true"></span></a>
</header>
${menu(root, current)}
<main id="main">
${body}
</main>
<footer class="site-footer" id="colophon">
  <div class="footer-inner">
    <p class="label">Got something in mind? Say hi.</p>
    <button class="footer-email" type="button" data-email="${esc(site.email)}" aria-label="Copy ${esc(site.email)}"><span class="footer-email-text">${[...site.email].map((c) => `<span class="ch">${esc(c)}</span>`).join('')}</span><span class="footer-email-done" aria-hidden="true">Copied. Talk soon.</span></button>
    <div class="footer-meta">
      <span class="footer-clock">${esc(site.location)}<time data-clock></time></span>
      <button class="footer-build" type="button" aria-expanded="false" aria-controls="build-log">How this site was built</button>
      <button class="footer-build" type="button" data-w95>Windows 95 mode</button>
      <a href="mailto:${site.email}">${esc(site.email)}</a>
      <span>© ${new Date().getFullYear()} ${esc(site.name)}</span>
    </div>
    <ol class="build-log" id="build-log" hidden>${BUILD_LOG}</ol>
  </div>
</footer>
<div class="keys"><button class="keys-toggle" type="button" aria-expanded="true" aria-label="Hide keyboard shortcuts"><svg class="eye-open" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><svg class="eye-closed" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 4l16 16" stroke="currentColor" stroke-width="1.6"/></svg></button><span class="keys-list" aria-label="Keyboard shortcuts"><span><kbd>↑</kbd><kbd>↓</kbd> Sections</span><span class="keys-projects"><kbd>←</kbd><kbd>→</kbd> Projects</span><span class="keys-w95"><kbd>W</kbd> 95</span><span class="keys-copy"><kbd>C</kbd> Copy email</span></span></div>
<script type="application/json" id="w95-data">${w95Data(root)}</script>
<dialog class="viewer" aria-label="Image viewer"><img alt=""><button class="viewer-close" type="button" aria-label="Close">×</button></dialog>
</body>
</html>
`;
}

function write(rel, html) {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// ---------- Home ----------
function home() {
  const root = '';
  let n = 0;
  const groupsHtml = grouped
    .map((g) => {
      const rows = g.items
        .map((p) => {
          n++;
          const stack = p === demoReel ? [p.thumb] : slideImages(p).slice(0, 10);
          const thumb = stack[0];
          return `
        <li class="index-row">
          <a href="${p.slug}/" data-stack="${esc(stack.map((s) => `assets/slides/${s}-sm.webp`).join('|'))}">
            <span class="index-num">${String(n).padStart(2, '0')}</span>
            <span class="index-title">${esc(p.title)}</span>
            <span class="index-tags">${esc(p.tags.join(', '))}</span>
            <img class="index-thumb" src="assets/slides/${thumb}-sm.webp" alt="" loading="lazy" width="960" height="540">
          </a>
        </li>`;
        })
        .join('');
      return `
    <section class="index-group" data-section>
      <h2 class="index-group-name label">${esc(g.name)}</h2>
      <ol class="index-list">${rows}</ol>
    </section>`;
    })
    .join('');
  const clients = about.clients.map((c) => `<span>${esc(c)}</span>`).join('');
  const body = `
  <section class="home-hero" data-section>
    <h1 class="home-name">${esc(site.name)}<br>${site.titles.map(esc).join('<br>')}</h1>
    <div class="home-side">
      <p class="home-positioning">${esc(site.positioning)}</p>
      <p class="home-contact"><a href="mailto:${site.email}">${esc(site.email)} <span aria-hidden="true">→</span></a></p>
    </div>
  </section>
  <section class="gen" tabindex="0" role="button" aria-label="Generative pattern drawn live. Press to shuffle to another brand system." data-section>
    <canvas aria-hidden="true"></canvas>
    <p class="gen-caption"><span><span class="gen-name">Minka</span> pattern system, drawn live</span><span class="gen-hint">Click to shuffle</span></p>
  </section>
  <section class="marquee" aria-label="Selected clients" data-section>
    <p class="label">Selected clients</p>
    <div class="marquee-track"><div class="marquee-row">${clients}</div><div class="marquee-row" aria-hidden="true">${clients}</div></div>
  </section>
  <div class="index">
    <a class="index-all arrow-link" href="work/">See all work on one page <span aria-hidden="true">→</span></a>${groupsHtml}
    <div class="index-preview" aria-hidden="true"></div>
  </div>
  <section class="home-about" data-section>
    <p class="home-about-text">${esc(about.bio[0])}</p>
    <a class="arrow-link" href="about/">About, experience &amp; capabilities <span aria-hidden="true">→</span></a>
  </section>`;
  write(
    'index.html',
    layout({
      root,
      current: 'home',
      body,
      bodyClass: 'page-home',
      description: `${site.name} is a ${site.titles.join(' and ').toLowerCase()} based in ${site.location}. ${site.positioning}`,
      og: 'home',
    })
  );
}

// ---------- Project pages ----------
// One row of facts under the summary, like the Figma summary slides:
// Team · Shawn's Role · Contributions · Discipline.
function credits(p) {
  const col = (label, items) =>
    items && items.length
      ? `<div class="credit"><p class="label">${label}</p><ul>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`
      : '';
  const cols = [col('Team', p.team), col('Shawn’s Role', p.role), col('Contributions', p.contributions), p === demoReel ? null : col('Discipline', p.tags)].filter(Boolean);
  return `<div class="credits cols-${cols.length}">${cols.join('')}</div>`;
}

// Project header: chapter line, title, then facts (left) and summary (right).
function projectMeta(p) {
  const list = (items) => items.map((t) => `<span>${esc(t)}</span>`).join('');
  const rows = [
    p.role && ['Role', list(p.role)],
    p.team && ['Team', `<span>${p.team.length + 1} people</span><span class="meta-names">${p.team.map((t) => esc(t)).join('<br>')}</span>`],
    ['Discipline', list(p.tags)],
    p.contributions && ['Contributions', list(p.contributions)],
  ].filter(Boolean);
  return `<dl class="project-meta">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}
function eyebrow(p) {
  const i = order.indexOf(p);
  const group = grouped.find((g) => g.items.includes(p));
  if (i < 0) return '';
  return `<p class="project-eyebrow label"><span>${String(i + 1).padStart(2, '0')} / ${String(order.length).padStart(2, '0')}</span>${group ? `<span>${esc(group.name)}</span>` : ''}</p>`;
}
function scopeBar(p) {
  const items = [
    p.role && ['Role', p.role.join(', ')],
    p.team && ['Team', `${p.team.length + 1} people`],
    ['Discipline', p.tags.join(' · ')],
  ].filter(Boolean);
  return `<dl class="scope">${items.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

function neighbors(p) {
  const i = order.indexOf(p);
  return { prev: order[(i - 1 + order.length) % order.length], next: order[(i + 1) % order.length] };
}

function projectPage(p, { prev, next }) {
  const root = '../';
  const onAccent = p.dark ? '#fff' : '#000';
  const style = `--accent:${p.accent};--on-accent:${onAccent}`;
  const body = `
  <article class="project">
    <header class="project-hero${p.dark ? ' is-dark' : ''}${lowc(p)}" style="${style}" data-section>
      <h1 class="project-title">${esc(p.title)}</h1>
      <div class="project-intro">
        <p class="label">Project Summary</p>
        <p class="project-summary">${esc(p.summary)}</p>
      </div>
      ${credits(p)}
    </header>
    <div class="slides">
      ${slidesWithPrinciples(p, root)}
    </div>
  </article>
  ${pager({ prev, next }, root)}`;
  write(
    `${p.slug}/index.html`,
    layout({
      title: p.title,
      description: p.summary.slice(0, 155).replace(/\s\S*$/, '') + '…',
      root,
      current: p.slug,
      body,
      bodyClass: `page-project${p.dark ? ' hero-dark' : ''}${p.slug === 'ugly-magazine' ? ' cursor-ugly' : ''}`,
      bodyStyle: `--menu-bg:${p.accent};--menu-fg:${onAccent}`,
      og: p.slug,
      theme: p.accent,
      crumb: { title: p.shortTitle || p.title, accent: p.accent },
      prev: `${root}${prev.slug}/`,
      next: `${root}${next.slug}/`,
    })
  );
}

const stackAttr = (p, root) => {
  const imgs = p === demoReel ? [p.thumb] : slideImages(p).slice(0, 10);
  return `data-flip="${esc(imgs.map((n) => `${root}assets/slides/${n}-sm.webp`).join('|'))}"`;
};
function pagerCard(p, root, dir) {
  const isReel = p === demoReel;
  const thumb = isReel ? p.thumb : slideImages(p)[0];
  const accent = isReel ? '#cccccc' : p.accent;
  const on = p.dark ? '#fff' : '#000';
  const label = dir === 'prev' ? '<span aria-hidden="true">←</span> Previous project' : 'Next project <span aria-hidden="true">→</span>';
  return `<a class="pager-card is-${dir}${lowc(p)}" href="${root}${p.slug}/" style="--accent:${accent};--on-accent:${on}" ${stackAttr(p, root)}>
      <span class="pager-label label">${label}</span>
      <span class="pager-title">${esc(p.title)}</span>
      <span class="pager-tags">${esc(p.tags.join(' · '))}</span>
      <img class="pager-thumb" src="${root}assets/slides/${thumb}-sm.webp" alt="" loading="lazy" decoding="async" width="960" height="540">
    </a>`;
}
// The top slice of a pager card: same color, label and title, cut off at the
// bottom. Follows you down the page, then reveals into the full card.
function sliceCard(p, root, dir) {
  const thumb = p === demoReel ? p.thumb : slideImages(p)[0];
  const accent = p === demoReel ? '#cccccc' : p.accent;
  const on = p.dark ? '#fff' : '#000';
  const label = dir === 'prev' ? '<span aria-hidden="true">←</span> Previous project' : 'Next project <span aria-hidden="true">→</span>';
  return `<a class="slice is-${dir}${lowc(p)}" href="${root}${p.slug}/" style="--accent:${accent};--on-accent:${on}" tabindex="-1" ${stackAttr(p, root)}>
      <span class="pager-label label">${label}</span>
      <span class="pager-title">${esc(p.title)}</span>
      <img class="pager-thumb" src="${root}assets/slides/${thumb}-sm.webp" alt="" loading="lazy" decoding="async" width="960" height="540">
    </a>`;
}
// Full cards at the end of the page, plus small pills that follow you down
// the page and grow into the full cards when you reach them.
function pager({ prev, next }, root) {
  return `<nav class="pager" aria-label="More projects" data-section>
    ${pagerCard(prev, root, 'prev')}
    ${pagerCard(next, root, 'next')}
  </nav>
  <div class="mini-pager" aria-hidden="true">${sliceCard(prev, root, 'prev')}${sliceCard(next, root, 'next')}</div>`;
}

// ---------- Demo reel ----------
function reelPage({ prev, next }) {
  const root = '../';
  const body = `
  <article class="project">
    <header class="project-hero" style="--accent:#cccccc;--on-accent:#000" data-section>
      <h1 class="project-title">Demo Reel</h1>
      <div class="project-intro">
        <p class="label">Motion and Animation</p>
        <p class="project-summary">${esc(demoReel.summary)}</p>
      </div>
      ${credits(demoReel)}
    </header>
    <div class="slides">
      <figure class="slide reel" data-section>
        <iframe src="https://player.vimeo.com/video/${demoReel.vimeoId}?title=0&amp;byline=0&amp;portrait=0&amp;dnt=1" title="${esc(site.name)} motion demo reel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
      </figure>
    </div>
  </article>
  ${pager({ prev, next }, root)}`;
  write(
    `${demoReel.slug}/index.html`,
    layout({
      title: demoReel.title,
      description: demoReel.summary,
      root,
      current: demoReel.slug,
      body,
      bodyClass: 'page-project',
      bodyStyle: '--menu-bg:#cccccc;--menu-fg:#000',
      og: demoReel.slug,
      theme: '#cccccc',
      crumb: { title: 'Demo Reel', accent: '#cccccc' },
      prev: `${root}${prev.slug}/`,
      next: `${root}${next.slug}/`,
    })
  );
}

// ---------- Work overview ----------
// Every project on one page: the essentials beside a contact sheet of its
// strongest images (a project can set `featured` to choose them).
const firstSentence = (t) => (t.match(/^.*?[.!?](\s|$)/) || [t])[0].trim();
function workPage() {
  const root = '../';
  const blocks = grouped
    .map(
      (g) => `
    <section class="work-group">
      <h2 class="work-group-name"><span>${esc(g.name)}</span><span class="work-group-count">${g.items.length} ${g.items.length === 1 ? 'project' : 'projects'}</span></h2>
      ${g.items
        .map((p) => {
          const isReel = p === demoReel;
          const imgs = isReel ? [p.thumb] : (p.featured || slideImages(p)).slice(0, 6);
          const thumbs = imgs
            .map((n) => {
              const half = /-h\d+$/.test(n);
              const full = `${root}assets/slides/${n}${has2x(n) ? '-2x' : ''}.webp`;
              return `<figure class="work-thumb${half ? ' is-tall' : ''}"><img src="${root}assets/slides/${n}-sm.webp" data-full="${full}" alt="${esc(alts[n] || p.title)}" loading="lazy" decoding="async" width="960" height="540"></figure>`;
            })
            .join('');
          return `
      <article class="work-item" data-section style="--accent:${isReel ? '#cccccc' : p.accent}">
        <div class="work-info">
          <h3 class="work-title"><a href="${root}${p.slug}/"><i></i>${esc(p.title)}</a></h3>
          ${p.role ? `<p class="work-role">${esc(p.role.join(', '))}</p>` : ''}
          <p class="work-summary">${esc(firstSentence(p.summary))}</p>
          <p class="work-tags">${esc(p.tags.join(' · '))}</p>
          <a class="arrow-link" href="${root}${p.slug}/">View project <span aria-hidden="true">→</span></a>
        </div>
        <div class="work-sheet${isReel ? ' is-single' : ''}">${thumbs}</div>
      </article>`;
        })
        .join('')}
    </section>`
    )
    .join('');
  const body = `
  <article class="work">
    <header class="about-hero" data-section>
      <p class="label">Work</p>
      <h1 class="about-intro">${order.length} projects across brand systems, campaigns, design systems and interaction, all on one page.</h1>
    </header>
    ${blocks}
  </article>`;
  write(
    'work/index.html',
    layout({
      title: 'Work',
      description: `An overview of ${site.name}’s work: ${order.map((p) => p.title).join(', ')}.`,
      root,
      current: 'work',
      body,
      bodyClass: 'page-work',
      og: 'home',
      crumb: { title: 'Work', accent: '#ffffff' },
    })
  );
}

// ---------- About ----------
function aboutPage() {
  const root = '../';
  const list = (items) => `<ul class="plain-list">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  const body = `
  <article class="about">
    <header class="about-hero" data-section>
      <p class="label">About</p>
      <h1 class="about-intro">${esc(about.intro)}</h1>
    </header>
    <section class="about-grid" data-section>
      <p class="label">Bio</p>
      <div class="about-bio">${about.bio.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
    </section>
    <section class="about-grid" data-section>
      <p class="label">Experience</p>
      <ol class="experience">
        ${about.experience
          .map(
            (e) => `<li><span class="exp-role">${esc(e.role)}</span><span class="exp-company">${esc(e.company)}</span><span class="exp-dates">${esc(e.dates)}</span></li>`
          )
          .join('')}
      </ol>
    </section>
    <section class="about-grid" data-section>
      <p class="label">Selected Clients</p>
      ${list(about.clients)}
    </section>
    <figure class="slide about-band" data-section>${pictureTag(about.capabilitiesImage, root, alts.capabilities)}</figure>
    <section class="about-grid" data-section>
      <p class="label">Capabilities</p>
      ${list(about.capabilities)}
    </section>
    <section class="about-grid" data-section>
      <p class="label">Tools &amp; Technology</p>
      ${list(about.tools)}
    </section>
  </article>`;
  write(
    'about/index.html',
    layout({ title: 'About', description: about.intro, root, current: 'about', body, bodyClass: 'page-about', og: 'about', crumb: { title: 'About', accent: '#ffffff' } })
  );
}

// Footer build log. Typed out line by line when opened; the last line is
// filled in live with how long the current page took to load.
function buildLog() {
  const lines = readFileSync(join(ROOT, 'build.mjs'), 'utf8').split('\n').length;
  const imageCount = order.reduce((n, p) => n + (p.slides ? slideImages(p).length : 0), 0);
  const videoCount = readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.mp4')).length;
  const rows = [
    ['$', 'open figma “Portfolio 2026”'],
    ['✓', `${imageCount} images exported at 2×, served as WebP`],
    ['✓', `${videoCount} clips pulled from Figma’s video stream, re-encoded`],
    ['$', 'claude code'],
    ['✓', `1 content file → ${order.length + 2} pages via a ${lines}-line build script`],
    ['✓', 'no framework · no theme · no tracking'],
    ['✓', 'homepage HTML + CSS + JS: {{WEIGHT}} KB compressed'],
    ['✓', 'set in Inter and Geist Mono'],
    ['→', 'deployed to GitHub Pages'],
    ['✓', 'this page loaded in <span data-load-time>…</span>'],
  ];
  return rows.map(([k, t]) => `<li><span class="log-k">${k}</span> ${t.includes('<span') ? t : esc(t)}</li>`).join('');
}

// ---------- Run ----------
let BUILD_LOG = '';
mkdirSync(join(OUT, 'assets'), { recursive: true });
mkdirSync(VIDEO_DIR, { recursive: true });
// Remove previously generated pages (keeps assets/).
for (const entry of readdirSync(OUT)) {
  if (entry === 'assets' || entry === 'CNAME' || entry === '.nojekyll') continue;
  rmSync(join(OUT, entry), { recursive: true, force: true });
}
for (const f of ['styles.css', 'main.js', 'gate.js', 'gen.js', 'w95.js', 'w95.css', 'favicon.svg']) copyFileSync(join(ROOT, 'src', f), join(OUT, 'assets', f));
writeFileSync(join(OUT, '.nojekyll'), '');
BUILD_LOG = buildLog();

home();
for (const p of order) {
  if (p === demoReel) reelPage(neighbors(p));
  else projectPage(p, neighbors(p));
}
for (const p of projects.filter((p) => p.hidden)) projectPage(p, { prev: order.at(-1), next: order[0] });
aboutPage();
workPage();
write('404.html', layout({ title: 'Not found', description: 'Page not found', root: '/', current: '', body: `<section class="about-hero"><h1 class="about-intro">That page doesn’t exist. <a href="/">Back to the work →</a></h1></section>` }));

{
  const kb = (f) => gzipSync(readFileSync(join(OUT, f))).length / 1024;
  const weight = String(Math.round(kb('index.html') + kb('assets/styles.css') + kb('assets/main.js')));
  const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? (f === 'assets' ? [] : walk(join(dir, f))) : f.endsWith('.html') ? [join(dir, f)] : []));
  for (const f of walk(OUT)) writeFileSync(f, readFileSync(f, 'utf8').replaceAll('{{WEIGHT}}', weight));
}
// ---------- Password gate ----------
// Each page's <body> content is encrypted (AES-GCM, key from PBKDF2) with the
// password in .site-password, which is never committed. Visitors see a gate;
// gate.js decrypts in the browser. Images and videos stay reachable by direct
// URL, so this hides the site from casual visitors only.
const PW_FILE = join(ROOT, '.site-password');
let gated = 0;
if (existsSync(PW_FILE) && !process.env.NO_GATE) {
  const pw = readFileSync(PW_FILE, 'utf8').trim();
  const salt = createHash('sha256').update('gate-salt:' + pw).digest().subarray(0, 16);
  const iter = 210000;
  const key = pbkdf2Sync(pw, salt, iter, 32, 'sha256');
  const gate = `<div class="gate"><form class="gate-form" autocomplete="on">
  <p class="gate-name">${esc(site.name)}<br>${site.titles.map(esc).join('<br>')}</p>
  <label class="label" for="gate-pw">This portfolio is password protected.</label>
  <div class="gate-row"><input id="gate-pw" name="password" type="password" autocomplete="current-password" required><button type="submit">Enter <span aria-hidden="true">→</span></button>
    <div class="gate-dog" aria-hidden="true">
      <img class="dog-watch" src="/assets/hotdog-watch.svg" alt="" width="130" height="255">
      <img class="dog-hide" src="/assets/hotdog-dontlook.svg" alt="" width="130" height="255">
      <svg class="dog-pupils" viewBox="122 50 130 255"><circle class="pupil" data-cx="159" data-cy="84.5" cx="159" cy="84.5" r="2"/><circle class="pupil" data-cx="174" data-cy="81" cx="174" cy="81" r="2"/></svg>
    </div>
  </div>
  <p class="gate-error label" role="alert" hidden>That’s not it. Try again, or email <a href="mailto:${site.email}">${esc(site.email)}</a>.</p>
</form></div>`;
  const walkHtml = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? (f === 'assets' ? [] : walkHtml(join(dir, f))) : f.endsWith('.html') && f !== '404.html' ? [join(dir, f)] : []));
  for (const f of walkHtml(OUT)) {
    const html = readFileSync(f, 'utf8');
    const m = html.match(/<body([^>]*)>([\s\S]*)<\/body>/);
    if (!m) continue;
    const iv = randomBytes(12);
    const c = createCipheriv('aes-256-gcm', key, iv);
    const data = Buffer.concat([c.update(m[2], 'utf8'), c.final(), c.getAuthTag()]);
    const payload = JSON.stringify({ salt: salt.toString('base64'), iter, iv: iv.toString('base64'), data: data.toString('base64') });
    writeFileSync(f, html.replace(m[0], `<body${m[1]} data-locked>${gate}<script type="application/json" id="locked">${payload}</script></body>`));
    gated++;
  }
}
console.log(`Built ${order.length + 2} pages into docs/${gated ? ` (${gated} password-protected)` : ' (no .site-password: pages are public)'}`);
if (missingVideos.size) {
  console.log(`\n${missingVideos.size} video(s) not found in docs/assets/video/ (stills shown instead):`);
  for (const f of missingVideos) console.log(`  - ${f}`);
}
if (missingAlts.size) console.log(`\nMissing alt text: ${[...missingAlts].join(', ')}`);
const missingOg = ['home', 'about', ...order.map((p) => p.slug)].filter((s) => !existsSync(join(OUT, 'assets', 'og', `${s}.png`)));
if (missingOg.length) console.log(`\nMissing share images (run scripts/og.sh): ${missingOg.join(', ')}`);
