// Windows 95 mode: a retro desktop version of the portfolio.
// Loaded on demand (W key, menu, or footer link). Icons are original pixel
// drawings in the 95 spirit; no Microsoft logos.

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---- Icons (32×32 pixel-style SVG) ----
const ICONS = {
  folder: (tint = '#ffff80') => `<svg viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges"><path d="M2 8h10l2 3h16v17H2z" fill="#c0c000"/><path d="M2 12h28v16H2z" fill="#ffff80"/><path d="M2 8h10l2 3h16v17H2z" fill="none" stroke="#000"/><rect x="21" y="19" width="7" height="7" fill="${tint}" stroke="#000"/></svg>`,
  notepad: `<svg viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges"><path d="M6 3h16l5 5v21H6z" fill="#fff" stroke="#000"/><path d="M22 3v5h5" fill="#c0c0c0" stroke="#000"/><path d="M9 12h14M9 15h14M9 18h14M9 21h10M9 24h12" stroke="#000080"/></svg>`,
  computer: `<svg viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges"><rect x="4" y="3" width="24" height="18" fill="#c0c0c0" stroke="#000"/><rect x="7" y="6" width="18" height="12" fill="#008080" stroke="#7f7f7f"/><rect x="10" y="22" width="12" height="3" fill="#c0c0c0" stroke="#000"/><rect x="5" y="25" width="22" height="4" fill="#c0c0c0" stroke="#000"/><path d="M9 9h6M9 12h10" stroke="#fff"/></svg>`,
  mail: `<svg viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges"><rect x="3" y="8" width="26" height="17" fill="#fff" stroke="#000"/><path d="M3 8l13 10 13-10" fill="none" stroke="#000"/><path d="M3 25l10-8M29 25l-10-8" stroke="#7f7f7f"/></svg>`,
  bin: `<svg viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges"><path d="M8 9h16l-2 20H10z" fill="#dfdfdf" stroke="#000"/><rect x="6" y="6" width="20" height="3" fill="#c0c0c0" stroke="#000"/><path d="M12 12v14M16 12v14M20 12v14" stroke="#7f7f7f"/></svg>`,
  logo: `<svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges"><rect x="1" y="1" width="6" height="6" fill="#000080"/><rect x="9" y="1" width="6" height="6" fill="#008080"/><rect x="1" y="9" width="6" height="6" fill="#008080"/><rect x="9" y="9" width="6" height="6" fill="#000"/></svg>`,
};

export function start(data, { onExit }) {
  const root = el('div', 'w95');
  root.setAttribute('role', 'application');
  root.setAttribute('aria-label', 'Windows 95 mode');
  document.body.appendChild(root);
  document.documentElement.classList.add('w95-on');

  // ---- Boot screen ----
  const boot = el('div', 'w95-boot', `<div class="w95-boot-logo">${ICONS.logo}<span>Shawn Golden <b>95</b></span></div><div class="w95-boot-bar"><i></i></div><p>Starting portfolio…</p>`);
  root.appendChild(boot);

  const desktop = el('div', 'w95-desktop');
  const icons = el('div', 'w95-icons');
  const layer = el('div', 'w95-windows');
  const taskbar = el('div', 'w95-taskbar');
  desktop.append(icons, layer);
  root.append(desktop, taskbar);

  let z = 10;
  const open = new Map(); // id -> { win, task }

  // ---- Windows ----
  function focus(id) {
    const w = open.get(id);
    if (!w) return;
    w.win.hidden = false;
    w.win.style.zIndex = ++z;
    open.forEach((o, k) => {
      o.win.classList.toggle('is-active', k === id);
      o.task.classList.toggle('is-active', k === id);
    });
  }
  function close(id) {
    const w = open.get(id);
    if (!w) return;
    w.win.remove();
    w.task.remove();
    open.delete(id);
  }
  function makeWindow(id, title, icon, body, { width = 560, status = '' } = {}) {
    if (open.has(id)) return focus(id);
    const win = el('section', 'w95-window');
    win.setAttribute('aria-label', title);
    const count = open.size;
    const vw = window.innerWidth, vh = window.innerHeight - 30;
    const w = Math.min(width, vw - 16);
    win.style.width = `${w}px`;
    win.style.left = `${Math.max(8, Math.min(vw - w - 8, 120 + count * 28))}px`;
    win.style.top = `${Math.max(8, Math.min(vh - 200, 40 + count * 28))}px`;
    win.innerHTML = `<header class="w95-title"><span class="w95-title-icon">${icon}</span><span class="w95-title-text">${esc(title)}</span>
      <span class="w95-title-btns"><button class="w95-cb" data-act="min" aria-label="Minimize">_</button><button class="w95-cb" data-act="close" aria-label="Close">×</button></span></header>
      <div class="w95-body"></div>${status ? `<footer class="w95-status"><span>${status}</span></footer>` : ''}`;
    win.querySelector('.w95-body').append(body);
    layer.appendChild(win);
    const task = el('button', 'w95-task', `<span class="w95-task-icon">${icon}</span><span>${esc(title)}</span>`);
    taskbar.querySelector('.w95-tasks').appendChild(task);
    open.set(id, { win, task });
    task.addEventListener('click', () => {
      const o = open.get(id);
      if (!o.win.hidden && o.win.classList.contains('is-active')) o.win.hidden = true;
      else focus(id);
    });
    win.addEventListener('pointerdown', () => focus(id));
    win.querySelector('[data-act=close]').addEventListener('click', (e) => (e.stopPropagation(), close(id)));
    win.querySelector('[data-act=min]').addEventListener('click', (e) => (e.stopPropagation(), (win.hidden = true)));
    // Drag by the title bar
    const bar = win.querySelector('.w95-title');
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const sx = e.clientX - win.offsetLeft, sy = e.clientY - win.offsetTop;
      bar.setPointerCapture(e.pointerId);
      const move = (ev) => {
        win.style.left = `${Math.max(-w + 60, Math.min(window.innerWidth - 60, ev.clientX - sx))}px`;
        win.style.top = `${Math.max(0, Math.min(window.innerHeight - 60, ev.clientY - sy))}px`;
      };
      const up = () => {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
    });
    focus(id);
    return win;
  }

  // ---- Window contents ----
  function projectWindow(p) {
    const body = el('div', 'w95-project');
    let i = 0;
    body.innerHTML = `
      <div class="w95-viewer w95-sunken"><img alt=""></div>
      <div class="w95-row"><button class="w95-btn" data-nav="-1">&lt; Back</button><span class="w95-count"></span><button class="w95-btn" data-nav="1">Next &gt;</button></div>
      <div class="w95-field w95-sunken"><p><b>${esc(p.title)}</b>${p.role ? ` · ${esc(p.role)}` : ''}</p><p>${esc(p.summary)}</p><p class="w95-dim">${esc(p.tags)}</p></div>
      <div class="w95-row w95-row-end"><a class="w95-btn w95-btn-default" href="${p.href}">Open full project…</a></div>`;
    const img = body.querySelector('img');
    const count = body.querySelector('.w95-count');
    const show = () => {
      img.src = p.images[i];
      img.alt = `${p.title}, image ${i + 1}`;
      count.textContent = `${i + 1} of ${p.images.length}`;
    };
    body.querySelectorAll('[data-nav]').forEach((b) =>
      b.addEventListener('click', () => {
        i = (i + +b.dataset.nav + p.images.length) % p.images.length;
        show();
      })
    );
    show();
    makeWindow(`p-${p.slug}`, p.title, ICONS.folder(p.accent), body, { width: 640, status: `${p.images.length} object(s)` });
  }
  function textWindow(id, title, text) {
    const body = el('div', 'w95-notepad');
    body.innerHTML = `<div class="w95-menubar"><span>File</span><span>Edit</span><span>Search</span><span>Help</span></div><textarea class="w95-sunken" readonly spellcheck="false">${esc(text)}</textarea>`;
    makeWindow(id, `${title} - Notepad`, ICONS.notepad, body, { width: 520 });
  }
  function folderWindow() {
    const body = el('div', 'w95-folder w95-sunken');
    data.projects.forEach((p) => body.appendChild(iconButton(p.title, ICONS.folder(p.accent), () => projectWindow(p), true)));
    makeWindow('projects', 'My Projects', ICONS.folder(), body, { width: 600, status: `${data.projects.length} object(s)` });
  }
  function binWindow() {
    const body = el('div', 'w95-field w95-sunken w95-center', `<p>The Recycle Bin is empty.</p><p class="w95-dim">Every idea made the cut. (Not really. But the good ones did.)</p>`);
    makeWindow('bin', 'Recycle Bin', ICONS.bin, body, { width: 380, status: '0 object(s)' });
  }

  // ---- Desktop icons ----
  function iconButton(label, icon, action, dark = false) {
    const b = el('button', `w95-icon${dark ? ' is-dark' : ''}`, `<span class="w95-icon-img">${icon}</span><span class="w95-icon-label">${esc(label)}</span>`);
    b.addEventListener('dblclick', action);
    b.addEventListener('click', (e) => {
      icons.querySelectorAll('.w95-icon').forEach((x) => x.classList.remove('is-selected'));
      b.classList.add('is-selected');
      if (e.detail === 0 || matchMedia('(hover: none)').matches) action(); // keyboard / touch
    });
    return b;
  }
  icons.append(
    iconButton('My Projects', ICONS.computer, folderWindow),
    iconButton('About Me.txt', ICONS.notepad, () => textWindow('about', 'About Me', data.about)),
    iconButton('All Work', ICONS.folder('#c0c0c0'), () => (location.href = data.workHref)),
    iconButton('Email Shawn', ICONS.mail, () => (location.href = `mailto:${data.email}`)),
    ...data.projects.map((p) => iconButton(p.title, ICONS.folder(p.accent), () => projectWindow(p))),
    iconButton('Recycle Bin', ICONS.bin, binWindow)
  );

  // ---- Taskbar + Start menu ----
  taskbar.innerHTML = `<button class="w95-start" aria-haspopup="menu" aria-expanded="false">${ICONS.logo}<b>Start</b></button><div class="w95-tasks"></div><div class="w95-tray w95-sunken"><span class="w95-clock"></span></div>`;
  const menu = el('div', 'w95-menu');
  menu.setAttribute('role', 'menu');
  menu.hidden = true;
  menu.innerHTML = `<div class="w95-menu-banner"><span>Shawn Golden <b>95</b></span></div><ul>
      <li class="has-sub"><button role="menuitem">${ICONS.folder()}<span>Projects</span><span class="w95-arrow">▸</span></button><ul class="w95-sub" role="menu"></ul></li>
      <li><button role="menuitem" data-go="work">${ICONS.folder('#c0c0c0')}<span>All Work</span></button></li>
      <li><button role="menuitem" data-go="about">${ICONS.notepad}<span>About Me</span></button></li>
      <li><button role="menuitem" data-go="mail">${ICONS.mail}<span>Email Shawn</span></button></li>
      <li class="w95-sep"></li>
      <li><button role="menuitem" data-go="exit">${ICONS.computer}<span>Shut Down…</span></button></li></ul>`;
  const sub = menu.querySelector('.w95-sub');
  data.projects.forEach((p) => {
    const li = el('li', '', `<button role="menuitem">${ICONS.folder(p.accent)}<span>${esc(p.title)}</span></button>`);
    li.querySelector('button').addEventListener('click', () => (toggleMenu(false), projectWindow(p)));
    sub.appendChild(li);
  });
  root.appendChild(menu);
  const startBtn = taskbar.querySelector('.w95-start');
  const toggleMenu = (on = menu.hidden) => {
    menu.hidden = !on;
    startBtn.classList.toggle('is-pressed', on);
    startBtn.setAttribute('aria-expanded', String(on));
  };
  startBtn.addEventListener('click', (e) => (e.stopPropagation(), toggleMenu()));
  menu.addEventListener('click', (e) => e.stopPropagation());
  root.addEventListener('click', () => toggleMenu(false));
  menu.querySelectorAll('[data-go]').forEach((b) =>
    b.addEventListener('click', () => {
      toggleMenu(false);
      const go = b.dataset.go;
      if (go === 'work') location.href = data.workHref;
      else if (go === 'about') textWindow('about', 'About Me', data.about);
      else if (go === 'mail') location.href = `mailto:${data.email}`;
      else if (go === 'exit') shutDown();
    })
  );

  // Detroit clock
  const clock = taskbar.querySelector('.w95-clock');
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', hour: 'numeric', minute: '2-digit' });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  const clockTimer = setInterval(tick, 15000);

  // ---- Shut down ----
  function shutDown() {
    const screen = el('div', 'w95-off', `<p>It’s now safe to turn off<br>your computer.</p>`);
    root.appendChild(screen);
    setTimeout(exit, 1600);
  }
  function exit() {
    clearInterval(clockTimer);
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    document.documentElement.classList.remove('w95-on');
    onExit && onExit();
  }
  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (!menu.hidden) toggleMenu(false);
      else shutDown();
    }
  };
  document.addEventListener('keydown', onKey, true);

  setTimeout(() => boot.classList.add('is-done'), 1300);
  setTimeout(() => boot.remove(), 1700);
  return { exit };
}
