// Live generative band on the homepage, drawn in three of the brand systems:
// Minka (stripes and blocks), Ultra (pixel field), Tracebit (rotating marks).
// Click to shuffle. Pauses off screen; still frame for reduced motion.

const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Smooth value noise for the Ultra field.
function makeNoise() {
  const P = new Uint8Array(512);
  const base = [...Array(256).keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 512; i++) P[i] = base[i & 255];
  const fade = (t) => t * t * (3 - 2 * t);
  const grad = (h) => (h / 255) * 2 - 1;
  return (x, y) => {
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const a = grad(P[P[xi] + yi]), b = grad(P[P[xi + 1] + yi]);
    const c = grad(P[P[xi] + yi + 1]), d = grad(P[P[xi + 1] + yi + 1]);
    const u = fade(xf), v = fade(yf);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  };
}

const systems = {
  minka: {
    name: 'Minka',
    bg: '#000000',
    setup(w, h) {
      const size = Math.max(36, Math.round(h / 5));
      const cols = Math.ceil(w / size), rows = Math.ceil(h / size);
      // Mostly black and white; color used sparingly ("a tool, not a theme").
      const colors = ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#f5fc9f', '#ff6f61', '#75a3bc'];
      const cell = () => ({ kind: pick(['stripes', 'stripes', 'stripes', 'block', 'empty', 'empty', 'half']), n: Math.floor(rand(3, 11)), color: pick(colors), flip: Math.random() < 0.5 });
      return { size, cols, rows, cells: Array.from({ length: cols * rows }, cell), cell, t: 0 };
    },
    draw(ctx, s, w, h, dt) {
      s.t += dt;
      if (s.t > 0.12) {
        s.t = 0;
        for (let k = 0; k < 3; k++) s.cells[Math.floor(rand(s.cells.length))] = s.cell();
      }
      ctx.fillStyle = this.bg;
      ctx.fillRect(0, 0, w, h);
      s.cells.forEach((c, i) => {
        const x = (i % s.cols) * s.size, y = Math.floor(i / s.cols) * s.size;
        ctx.fillStyle = c.color;
        if (c.kind === 'block') ctx.fillRect(x, y, s.size, s.size);
        else if (c.kind === 'half') ctx.fillRect(x, c.flip ? y : y + s.size / 2, s.size, s.size / 2);
        else if (c.kind === 'stripes') {
          const step = s.size / c.n;
          for (let j = 0; j < c.n; j++) {
            const lw = step * (c.flip ? (j + 1) / c.n : 1 - j / c.n) * 0.85;
            ctx.fillRect(x + j * step, y, Math.max(1, lw), s.size);
          }
        }
      });
    },
  },
  ultra: {
    name: 'Ultra',
    bg: '#000000',
    setup(w, h) {
      return { noise: makeNoise(), cell: Math.max(8, Math.round(h / 26)), t: rand(100) };
    },
    draw(ctx, s, w, h, dt) {
      s.t += dt * 0.12;
      ctx.fillStyle = this.bg;
      ctx.fillRect(0, 0, w, h);
      const c = s.cell;
      for (let y = 0; y < h; y += c) {
        for (let x = 0; x < w; x += c) {
          const n = s.noise(x / 180 + s.t, y / 180 - s.t * 0.6);
          const m = s.noise(x / 90 - s.t * 0.4 + 40, y / 90 + 40);
          let color = null;
          let round = false;
          if (n > 0.28) color = '#2456e6';
          else if (n > 0.12) { color = '#2456e6'; round = true; }
          else if (n < -0.32) color = '#13a04b';
          else if (n < -0.18) { color = '#13a04b'; round = true; }
          else if (m > 0.42) color = '#e21bd0';
          else if (m < -0.45) { color = '#ffffff'; round = true; }
          if (!color) continue;
          ctx.fillStyle = color;
          if (round) {
            ctx.beginPath();
            ctx.arc(x + c / 2, y + c / 2, c * 0.36, 0, Math.PI * 2);
            ctx.fill();
          } else ctx.fillRect(x + 1, y + 1, c - 2, c - 2);
        }
      }
    },
  },
  tracebit: {
    name: 'Tracebit',
    bg: '#111111',
    setup(w, h) {
      const angles = [0, 17.36, 45, 90, 180, 270].map((a) => (a * Math.PI) / 180);
      const size = Math.max(70, h * 0.62);
      const count = Math.max(3, Math.floor(w / (size * 1.25)));
      const gap = w / count;
      const marks = Array.from({ length: count }, (_, i) => {
        const a = pick(angles);
        return { x: gap * (i + 0.5), y: h / 2, a, target: a, wait: rand(0.3, 2.4) };
      });
      return { angles, size, marks };
    },
    draw(ctx, s, w, h, dt) {
      ctx.fillStyle = this.bg;
      ctx.fillRect(0, 0, w, h);
      for (const m of s.marks) {
        m.wait -= dt;
        if (m.wait <= 0) {
          m.target = pick(s.angles) + Math.PI * 2 * Math.round(m.a / (Math.PI * 2));
          m.wait = rand(1.4, 3.6);
        }
        m.a += (m.target - m.a) * Math.min(1, dt * 3.2);
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.a);
        const L = s.size / 2;
        const strokes = [
          [0, 1, 0.16],
          [Math.PI / 3, 0.92, 0.1],
          [-Math.PI / 3, 0.92, 0.1],
          [Math.PI / 2, 0.55, 0.06],
        ];
        for (const [rot, len, wdt] of strokes) {
          ctx.save();
          ctx.rotate(rot);
          const g = ctx.createLinearGradient(0, -L * len, 0, L * len);
          g.addColorStop(0, '#f3dcd5');
          g.addColorStop(0.55, '#f08a7a');
          g.addColorStop(1, '#d6372f');
          ctx.fillStyle = g;
          ctx.fillRect((-s.size * wdt) / 2 / 3, -L * len, (s.size * wdt) / 3, L * len * 2);
          ctx.restore();
        }
        ctx.restore();
      }
    },
  },
};

export function start(root, reduceMotion) {
  const canvas = root.querySelector('canvas');
  const label = root.querySelector('.gen-name');
  const ctx = canvas.getContext('2d');
  const order = ['minka', 'ultra', 'tracebit'];
  let i = Math.floor(Math.random() * order.length);
  let sys, state, w, h, last = 0, raf = 0, visible = true;

  const size = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const use = (k) => {
    sys = systems[order[k]];
    state = sys.setup(w, h);
    label.textContent = sys.name;
    root.dataset.system = order[k];
    sys.draw(ctx, state, w, h, 0);
  };
  const frame = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    sys.draw(ctx, state, w, h, dt);
    raf = requestAnimationFrame(frame);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (!reduceMotion && visible) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  const shuffle = () => {
    i = (i + 1) % order.length;
    use(i);
  };

  size();
  use(i);
  run();
  root.addEventListener('click', shuffle);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      shuffle();
    }
  });
  window.addEventListener('resize', () => {
    size();
    use(i);
  });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    run();
  }).observe(root);
}
