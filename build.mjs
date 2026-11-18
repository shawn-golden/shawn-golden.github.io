// Generates the static site into docs/ (GitHub Pages can serve this folder).
// Usage: node build.mjs
import { mkdirSync, writeFileSync, copyFileSync, existsSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, projects, demoReel, about } from './content/site.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'docs');
const VIDEO_DIR = join(OUT, 'assets', 'video');
const SLIDE_W = 1920;
const SLIDE_H = 1080;

const visible = projects.filter((p) => !p.hidden);
const VERSION = createHash('sha1')
  .update(['styles.css', 'main.js'].map((f) => readFileSync(join(ROOT, 'src', f), 'utf8')).join(''))
  .digest('hex')
  .slice(0, 8);
const missingVideos = new Set();

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pct = (v, total) => `${+((v / total) * 100).toFixed(4)}%`;

function pictureTag(name, root, alt, { eager = false } = {}) {
  const base = `${root}assets/slides/${name}`;
  return `<img src="${base}.webp" srcset="${base}-sm.webp 960w, ${base}.webp 1920w" sizes="(max-width: 1000px) 100vw, min(100vw, 1760px)" width="${SLIDE_W}" height="${SLIDE_H}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function boxStyle(v) {
  return [
    `left:${pct(v.x, SLIDE_W)}`,
    `top:${pct(v.y, SLIDE_H)}`,
    `width:${pct(v.w, SLIDE_W)}`,
    `height:${pct(v.h, SLIDE_H)}`,
    v.rotate ? `transform:rotate(${v.rotate}deg)` : '',
    v.radius ? `border-radius:${pct(v.radius, v.w)} / ${pct(v.radius, v.h)}` : '',
    v.color ? `background:${v.color}` : '',
    v.blend ? `mix-blend-mode:${v.blend}` : '',
  ]
    .filter(Boolean)
    .join(';');
}

// Motion layers sit on top of the still slide and fade in together once the
// clips can play: videos, then blend tints (recreating Figma blend modes),
// then foreground artwork that was layered above the video in Figma.
function motionLayers(s, root) {
  const videos = s.videos || [];
  if (!videos.length) return '';
  const missing = videos.filter((v) => !existsSync(join(VIDEO_DIR, v.file)));
  if (missing.length) {
    missing.forEach((v) => missingVideos.add(v.file));
    return '';
  }
  const vids = videos
    .map((v) => `<video class="slide-video" style="${boxStyle(v)}" data-src="${root}assets/video/${esc(v.file)}" muted loop playsinline preload="none" aria-hidden="true"></video>`)
    .join('');
  const blends = (s.blends || []).map((b) => `<div class="slide-layer" style="${boxStyle(b)}"></div>`).join('');
  const overlays = (s.overlays || [])
    .map((o) => `<img class="slide-layer" style="${boxStyle(o)}" src="${root}assets/overlays/${esc(o.img)}" alt="" loading="lazy" decoding="async">`)
    .join('');
  return `<div class="slide-motion">${vids}${blends}${overlays}</div>`;
}

function slideFigure(slide, i, project, root) {
  const s = typeof slide === 'string' ? { src: slide } : slide;
  return `<figure class="slide${i === 0 ? ' reveal-now' : ''}">${pictureTag(s.src, root, `${project.title}, image ${i + 1}`, { eager: i === 0 })}${motionLayers(s, root)}</figure>`;
}

function menu(root, current) {
  const items = [...visible.slice(0, -1), demoReel, visible.at(-1)].map((p) => ({
    href: `${root}${p.slug}/`,
    label: p.title,
    slug: p.slug,
  }));
  return `
  <button class="menu-button" aria-expanded="false" aria-controls="site-menu" aria-label="Open menu"><span></span><span></span><span></span></button>
  <nav class="menu" id="site-menu" aria-label="Site" hidden>
    <div class="menu-inner">
      <div class="menu-col">
        <p class="label">Projects</p>
        <ol class="menu-list">
          ${items.map((it) => `<li><a href="${it.href}"${it.slug === current ? ' aria-current="page"' : ''}>${esc(it.label)}</a></li>`).join('')}
        </ol>
      </div>
      <div class="menu-col">
        <p class="label">Info</p>
        <ol class="menu-list menu-list-sm">
          <li><a href="${root}"${current === 'home' ? ' aria-current="page"' : ''}>Home</a></li>
          <li><a href="${root}about/"${current === 'about' ? ' aria-current="page"' : ''}>About</a></li>
          <li><a href="mailto:${site.email}">${esc(site.email)}</a></li>
        </ol>
      </div>
    </div>
  </nav>`;
}

function layout({ title, description, root, current, body, bodyClass = '', ogImage, theme }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.titles.join(', ')}`;
  const og = ogImage ? `${site.url ? site.url + '/' : root}assets/slides/${ogImage}.webp` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
${og ? `<meta property="og:image" content="${og}">` : ''}
<meta name="theme-color" content="${theme || '#f6f6f6'}">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&family=Inter:opsz,wght@14..32,400;14..32,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}assets/styles.css?v=${VERSION}">
<script>document.documentElement.classList.add('js')</script>
<script src="${root}assets/main.js?v=${VERSION}" defer></script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="wordmark" href="${root}">${esc(site.name)}</a>
</header>
${menu(root, current)}
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="footer-inner">
    <p class="footer-big">Let’s make something.</p>
    <div class="footer-meta">
      <a href="mailto:${site.email}">${esc(site.email)}</a>
      <span>${esc(site.name)} | ${esc(site.titles[0])}</span>
    </div>
  </div>
</footer>
</body>
</html>
`;
}

function write(rel, html) {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const firstSlide = (p) => (typeof p.slides[0] === 'string' ? p.slides[0] : p.slides[0].src);

// ---------- Home ----------
function home() {
  const root = '';
  const rows = [...visible.slice(0, -1), { ...demoReel, isReel: true }, visible.at(-1)]
    .filter(Boolean)
    .map((p, i) => {
      const thumb = p.isReel ? p.thumb : firstSlide(p);
      return `
      <li class="index-row">
        <a href="${p.slug}/" data-thumb="assets/slides/${thumb}-sm.webp">
          <span class="index-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="index-title">${esc(p.title)}</span>
          <span class="index-tags">${esc(p.tags.join(', '))}</span>
          <img class="index-thumb" src="assets/slides/${thumb}-sm.webp" alt="" loading="lazy" width="960" height="540">
        </a>
      </li>`;
    })
    .join('');
  const body = `
  <section class="home-hero">
    <h1 class="home-name">${esc(site.name)}<br>${site.titles.map(esc).join('<br>')}</h1>
    <p class="home-contact"><a href="mailto:${site.email}">${esc(site.email)}</a><br>Based in ${esc(site.location)}</p>
  </section>
  <section class="index" aria-labelledby="projects-label">
    <p class="label" id="projects-label">Projects</p>
    <ol class="index-list">${rows}</ol>
    <img class="index-preview" alt="" aria-hidden="true">
  </section>
  <section class="home-about">
    <p class="home-about-text">${esc(about.intro)}</p>
    <a class="arrow-link" href="about/">About, experience &amp; capabilities <span aria-hidden="true">→</span></a>
  </section>`;
  write(
    'index.html',
    layout({
      root,
      current: 'home',
      body,
      bodyClass: 'page-home',
      description: `${site.name} is a ${site.titles.join(' and ').toLowerCase()} based in ${site.location}.`,
      ogImage: firstSlide(visible[0]),
    })
  );
}

// ---------- Project pages ----------
function credits(p) {
  const col = (label, items) =>
    items && items.length
      ? `<div class="credit"><p class="label">${label}</p><ul>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`
      : '';
  return `<div class="credits">${col('Team', p.team)}${col('Shawn’s Role', p.role)}${col('Contributions', p.contributions)}</div>`;
}

function projectPage(p, next) {
  const root = '../';
  const style = `--accent:${p.accent};--on-accent:${p.dark ? '#fff' : '#000'}`;
  const body = `
  <article class="project">
    <header class="project-hero${p.dark ? ' is-dark' : ''}" style="${style}">
      <h1 class="project-title">${esc(p.title)}</h1>
      <div class="project-intro">
        <p class="label">Project Summary</p>
        <div>
          <p class="project-summary">${esc(p.summary)}</p>
          <p class="project-tags">${esc(p.tags.join(' · '))}</p>
        </div>
      </div>
      ${p.team || p.role ? credits(p) : ''}
    </header>
    <div class="slides">
      ${p.slides.map((s, i) => slideFigure(s, i, p, root)).join('\n      ')}
    </div>
  </article>
  ${nextLink(next, root)}`;
  write(
    `${p.slug}/index.html`,
    layout({
      title: p.title,
      description: p.summary.slice(0, 155).replace(/\s\S*$/, '') + '…',
      root,
      current: p.slug,
      body,
      bodyClass: 'page-project',
      ogImage: firstSlide(p),
      theme: p.accent,
    })
  );
}

function nextLink(next, root) {
  return `<a class="next" href="${root}${next.slug}/">
    <span class="label">Next project</span>
    <span class="next-title">${esc(next.title)} <span aria-hidden="true">→</span></span>
  </a>`;
}

// ---------- Demo reel ----------
function reelPage(next) {
  const root = '../';
  const body = `
  <article class="project">
    <header class="project-hero" style="--accent:#cccccc;--on-accent:#000">
      <h1 class="project-title">Demo Reel</h1>
      <div class="project-intro">
        <p class="label">Motion and Animation</p>
        <div>
          <p class="project-summary">${esc(demoReel.summary)}</p>
          <p class="project-tags">${esc(demoReel.tags.join(' · '))}</p>
        </div>
      </div>
    </header>
    <div class="slides">
      <figure class="slide reel">
        <iframe src="https://player.vimeo.com/video/${demoReel.vimeoId}?title=0&amp;byline=0&amp;portrait=0&amp;dnt=1" title="${esc(site.name)} motion demo reel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
      </figure>
    </div>
  </article>
  ${nextLink(next, root)}`;
  write(
    `${demoReel.slug}/index.html`,
    layout({ title: demoReel.title, description: demoReel.summary, root, current: demoReel.slug, body, bodyClass: 'page-project', ogImage: demoReel.thumb, theme: '#cccccc' })
  );
}

// ---------- About ----------
function aboutPage() {
  const root = '../';
  const list = (items) => `<ul class="plain-list">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  const body = `
  <article class="about">
    <header class="about-hero">
      <p class="label">About</p>
      <h1 class="about-intro">${esc(about.intro)}</h1>
    </header>
    <section class="about-grid">
      <p class="label">Bio</p>
      <div class="about-bio">${about.bio.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
    </section>
    <section class="about-grid">
      <p class="label">Experience</p>
      <ol class="experience">
        ${about.experience
          .map(
            (e) => `<li><span class="exp-role">${esc(e.role)}</span><span class="exp-company">${esc(e.company)}</span><span class="exp-dates">${esc(e.dates)}</span></li>`
          )
          .join('')}
      </ol>
    </section>
    <section class="about-grid">
      <p class="label">Selected Clients</p>
      ${list(about.clients)}
    </section>
    <figure class="slide about-band">${pictureTag(about.capabilitiesImage, root, 'Creative capabilities: direction, brand, interactive, writing, illustration, motion, print')}</figure>
    <section class="about-grid">
      <p class="label">Capabilities</p>
      ${list(about.capabilities)}
    </section>
    <section class="about-grid">
      <p class="label">Tools &amp; Technology</p>
      ${list(about.tools)}
    </section>
  </article>`;
  write(
    'about/index.html',
    layout({ title: 'About', description: about.intro, root, current: 'about', body, bodyClass: 'page-about', ogImage: about.capabilitiesImage })
  );
}

// ---------- Run ----------
mkdirSync(join(OUT, 'assets'), { recursive: true });
mkdirSync(VIDEO_DIR, { recursive: true });
// Remove previously generated pages (keeps assets/).
for (const entry of readdirSync(OUT)) {
  if (entry === 'assets' || entry === 'CNAME' || entry === '.nojekyll') continue;
  rmSync(join(OUT, entry), { recursive: true, force: true });
}
for (const f of ['styles.css', 'main.js', 'favicon.svg']) copyFileSync(join(ROOT, 'src', f), join(OUT, 'assets', f));
writeFileSync(join(OUT, '.nojekyll'), '');

home();
const order = [...visible.slice(0, -1), demoReel, visible.at(-1)];
order.forEach((p, i) => {
  const next = order[(i + 1) % order.length];
  if (p === demoReel) reelPage(next);
  else projectPage(p, next);
});
for (const p of projects.filter((p) => p.hidden)) projectPage(p, visible[0]);
aboutPage();
write('404.html', layout({ title: 'Not found', description: 'Page not found', root: '/', current: '', body: `<section class="about-hero"><h1 class="about-intro">That page doesn’t exist. <a href="/">Back to the work →</a></h1></section>` }));

console.log(`Built ${order.length + 2} pages into docs/`);
if (missingVideos.size) {
  console.log(`\n${missingVideos.size} video(s) not found in docs/assets/video/ (stills shown instead):`);
  for (const f of missingVideos) console.log(`  - ${f}`);
}
