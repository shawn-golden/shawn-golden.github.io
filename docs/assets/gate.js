// Password gate: decrypts the page body in the browser. The derived key is
// remembered (this browser only) so other pages open without asking again.
(async () => {
  const el = document.getElementById('locked');
  if (!el || !window.crypto?.subtle) return;
  const { salt, iter, iv, data } = JSON.parse(el.textContent);
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const KEY = 'gate-key';

  async function open(raw) {
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(iv) }, key, b64(data));
    return new TextDecoder().decode(plain);
  }
  function show(html) {
    document.body.innerHTML = html;
    document.body.removeAttribute('data-locked');
    document.dispatchEvent(new Event('site:unlocked'));
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }

  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return show(await open(b64(saved)));
  } catch (e) {
    try {
      localStorage.removeItem(KEY);
    } catch (_) {}
  }

  document.documentElement.classList.add('is-gated');
  const form = document.querySelector('.gate-form');
  const input = form.querySelector('input');

  // The security-conscious hot dog: watches the cursor, points at the
  // password field, and covers his eyes while you type.
  const dog = form.querySelector('.gate-dog');
  if (dog) {
    const pupils = [...dog.querySelectorAll('.pupil')];
    const svg = dog.querySelector('.dog-pupils');
    const look = (x, y) => {
      const box = svg.getBoundingClientRect();
      const scale = box.width / 130;
      for (const p of pupils) {
        const cx = +p.dataset.cx, cy = +p.dataset.cy;
        const ex = box.left + (cx - 122) * scale, ey = box.top + (cy - 50) * scale;
        const dx = x - ex, dy = y - ey;
        const d = Math.hypot(dx, dy) || 1;
        const reach = Math.min(2.6, d / 60);
        p.setAttribute('cx', (cx + (dx / d) * reach).toFixed(2));
        p.setAttribute('cy', (cy + (dy / d) * reach).toFixed(2));
      }
    };
    window.addEventListener('pointermove', (e) => look(e.clientX, e.clientY), { passive: true });
    input.addEventListener('focus', () => dog.classList.add('is-hiding'));
    input.addEventListener('blur', () => dog.classList.remove('is-hiding'));
  }
  const error = form.querySelector('.gate-error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.classList.add('is-busy');
    try {
      const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(input.value.trim()), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: b64(salt), iterations: iter, hash: 'SHA-256' }, base, 256);
      const html = await open(bits);
      try {
        localStorage.setItem(KEY, toB64(bits));
      } catch (_) {}
      document.documentElement.classList.remove('is-gated');
      show(html);
    } catch (err) {
      form.classList.remove('is-busy');
      error.hidden = false;
      form.classList.remove('is-wrong');
      void form.offsetWidth;
      form.classList.add('is-wrong');
      input.select();
    }
  });
})();
