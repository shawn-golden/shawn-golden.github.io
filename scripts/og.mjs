// Generates 1200×630 link-preview cards into docs/assets/og/ (needs ImageMagick).
// Usage: node scripts/og.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, projects, demoReel } from '../content/site.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs/assets/og');
const SLIDES = join(ROOT, 'docs/assets/slides');
mkdirSync(OUT, { recursive: true });

const fontDir = join(homedir(), 'Library/Fonts');
const font = (f) => (existsSync(join(fontDir, f)) ? join(fontDir, f) : 'Helvetica');
const DISPLAY = font('InterDisplay-Regular.ttf');
const TEXT = font('Inter-Regular.ttf');

const firstImage = (p) => {
  const s = p.slides?.[0];
  return typeof s === 'string' ? s : s?.src || s?.row?.[0];
};

function card({ slug, title, accent, dark, image, kicker }) {
  const fg = dark ? '#ffffff' : '#000000';
  const args = ['-size', '1200x630', `xc:${accent}`];
  if (image && existsSync(join(SLIDES, `${image}.webp`))) {
    args.push(
      '(', join(SLIDES, `${image}.webp`), '-resize', '540x304^', '-gravity', 'center', '-extent', '540x304',
      '(', '+clone', '-alpha', 'extract', '-draw', "fill black polygon 0,0 0,8 8,0 fill white circle 8,8 8,0",
      '(', '+clone', '-flip', ')', '-compose', 'Multiply', '-composite',
      '(', '+clone', '-flop', ')', '-compose', 'Multiply', '-composite', ')',
      '-alpha', 'off', '-compose', 'CopyOpacity', '-composite', ')',
      '-gravity', 'northeast', '-geometry', '+48+48', '-compose', 'over', '-composite'
    );
  }
  args.push(
    '-gravity', 'northwest', '-fill', fg,
    '-font', TEXT, '-pointsize', '24', '-annotate', '+48+52', `${site.name}\n${kicker}`,
    '-font', DISPLAY, '-pointsize', title.length > 14 ? '104' : '132', '-kerning', '-4',
    '-gravity', 'southwest', '-annotate', '+44+34', title,
    join(OUT, `${slug}.png`)
  );
  execFileSync('magick', args);
}

const kicker = site.titles.join(', ');
card({ slug: 'home', title: site.name, accent: '#f6f6f6', image: firstImage(projects[0]), kicker });
card({ slug: 'about', title: 'About', accent: '#000000', dark: true, image: 'capabilities', kicker });
card({ slug: demoReel.slug, title: 'Demo Reel', accent: '#cccccc', image: demoReel.thumb, kicker });
for (const p of projects.filter((p) => !p.hidden)) {
  card({ slug: p.slug, title: p.title, accent: p.accent, dark: p.dark, image: firstImage(p), kicker });
}
console.log('Share images written to docs/assets/og/');
