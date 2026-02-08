const path = require('path');

async function avgColor(imagePath) {
  const JimpModule = await import('jimp');
  const Jimp = JimpModule.Jimp || JimpModule.default || JimpModule;
  const img = await Jimp.read(imagePath);
  const { data, width, height } = img.bitmap;
  // Build a quantized histogram to find dominant color
  const counts = new Map();
  // Decide sampling mask: circle for logo, center-box for others
  const isLogo = /logo/i.test(imagePath);
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const radius = Math.floor(Math.min(width, height) / 2 * 0.78);
  const boxSize = Math.floor(Math.min(width, height) * 0.5);
  const boxX0 = Math.floor(cx - boxSize / 2);
  const boxY0 = Math.floor(cy - boxSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Mask selection
      if (isLogo) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy > radius * radius) continue; // outside circle
      } else {
        if (x < boxX0 || x >= boxX0 + boxSize || y < boxY0 || y >= boxY0 + boxSize) continue;
      }
      const idx = (width * y + x) << 2;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Skip near-white background pixels
      if (r > 240 && g > 240 && b > 240) continue;
      // Quantize to reduce unique keys (4-bit per channel)
      const qr = (r >> 4) & 0x0f;
      const qg = (g >> 4) & 0x0f;
      const qb = (b >> 4) & 0x0f;
      const key = (qr << 8) | (qg << 4) | qb;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  // Sort buckets by count descending and return top 3 colors
  const entries = Array.from(counts.entries());
  entries.sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 5).map(([key, cnt]) => {
    const qr = (key >> 8) & 0x0f;
    const qg = (key >> 4) & 0x0f;
    const qb = key & 0x0f;
    const rFinal = (qr << 4) + 8;
    const gFinal = (qg << 4) + 8;
    const bFinal = (qb << 4) + 8;
    const hex = ((rFinal << 16) + (gFinal << 8) + bFinal).toString(16).padStart(6, '0');
    return { r: rFinal, g: gFinal, b: bFinal, hex: `#${hex.toUpperCase()}`, count: cnt };
  });
  return top;
}

(async function() {
  const assetsDir = path.join(__dirname, '..', 'public', 'Assets for UI', 'Kola design assets');
  const files = ['kola logo.png', '5.png', '9.png'];
  for (const f of files) {
    const p = path.join(assetsDir, f);
    try {
      const c = await avgColor(p);
      console.log(f + ':');
      c.forEach((col, i) => console.log(`  ${i+1}. ${col.hex} rgb(${col.r},${col.g},${col.b}) (${col.count})`));
    } catch (err) {
      console.error('Error reading', f, err.message);
    }
  }
})();
