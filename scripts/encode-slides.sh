#!/bin/bash
# Encode 2x Figma exports (source/slides2x, 3840x2160) into web sizes.
set -e
S=source/slides2x D=docs/assets/slides
INFO="taptopay-05 taptopay-06 ugly-05 ugly-07 ugly-09"
for f in $S/*.png; do
  b=$(basename "$f" .png)
  if [[ " $INFO " == *" $b "* ]]; then
    magick "$f" -crop 2774x1844+1006+256 +repage /tmp/claude-501/panel.png
    cwebp -quiet -q 82 -m 6 -resize 2774 0 /tmp/claude-501/panel.png -o $D/$b-panel-2x.webp
    cwebp -quiet -q 84 -m 6 -resize 1387 0 /tmp/claude-501/panel.png -o $D/$b-panel.webp
    cwebp -quiet -q 80 -m 6 -resize 800 0 /tmp/claude-501/panel.png -o $D/$b-panel-sm.webp
  else
    cwebp -quiet -q 80 -m 6 -resize 3200 0 "$f" -o $D/$b-2x.webp
    cwebp -quiet -q 84 -m 6 -resize 1920 0 "$f" -o $D/$b.webp
    cwebp -quiet -q 80 -m 6 -resize 960 0 "$f" -o $D/$b-sm.webp
  fi
done
magick $S/taptopay-05.png -crop 640x320+60+1334 +repage /tmp/claude-501/d.png && cwebp -quiet -lossless /tmp/claude-501/d.png -o $D/taptopay-05-diagram.webp
magick $S/taptopay-06.png -crop 640x396+60+1182 +repage /tmp/claude-501/d.png && cwebp -quiet -lossless /tmp/claude-501/d.png -o $D/taptopay-06-diagram.webp
magick $S/taptopay-06.png -crop 536x172+60+1610 +repage /tmp/claude-501/d.png && cwebp -quiet -lossless /tmp/claude-501/d.png -o $D/taptopay-06-easing.webp
