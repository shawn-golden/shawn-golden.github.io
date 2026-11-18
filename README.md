# Shawn Golden: Portfolio 2026

A static portfolio site built from the Figma file *Portfolio 2026* (Staging page).

- `content/site.mjs`: all text, project order, colors, slides and video placements
- `src/`: stylesheet, script and favicon
- `build.mjs`: generates the site into `docs/` (`node build.mjs`)
- `docs/`: the finished site, ready for GitHub Pages
- `source/slides/`: full-size PNG exports from Figma (not committed)

## Preview locally

```bash
node build.mjs && python3 -m http.server 4321 --directory docs
```

## Videos

Clips were pulled from Figma's own video stream at full resolution. Masters
live in `source/videos/` (not committed); silent, web-sized copies are in
`docs/assets/video/`. Each slide in `content/site.mjs` lists its clips by
position on the 1920×1080 slide, plus optional `blends` (CSS blend-mode
layers that recreate Figma's) and `overlays` (transparent images in
`docs/assets/overlays/` for artwork that sat above a clip). Videos load only
when scrolled near, play while visible, and stay as stills for visitors who
prefer reduced motion.

To add or replace a clip, re-encode it first, then rebuild:

```bash
ffmpeg -i in.mov -an -vf "scale='min(1600,iw)':-2" -c:v libx264 -crf 25 -preset slow -movflags +faststart -pix_fmt yuv420p out.mp4
```

## Publishing on GitHub Pages

Push this folder to a GitHub repository, then in **Settings → Pages** choose
"Deploy from a branch", branch `main`, folder `/docs`.

## Password

Pages are encrypted with the password in `.site-password` (one line, never
committed). Change it by editing that file and running `node build.mjs`, then
push. Delete the file to publish the site without a password. Images and
videos are still reachable by direct URL, so this keeps casual visitors out;
it isn't a secure lock.
