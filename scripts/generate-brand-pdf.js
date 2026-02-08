const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const JimpModule = require('jimp');

async function sampleColors(imagePath) {
  const Jimp = JimpModule.Jimp || JimpModule.default || JimpModule;
  const img = await Jimp.read(imagePath);
  const { data, width, height } = img.bitmap;
  const counts = new Map();
  const isLogo = /logo/i.test(imagePath);
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const radius = Math.floor(Math.min(width, height) / 2 * 0.78);
  const boxSize = Math.floor(Math.min(width, height) * 0.5);
  const boxX0 = Math.floor(cx - boxSize / 2);
  const boxY0 = Math.floor(cy - boxSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isLogo) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy > radius * radius) continue;
      } else {
        if (x < boxX0 || x >= boxX0 + boxSize || y < boxY0 || y >= boxY0 + boxSize) continue;
      }
      const idx = (width * y + x) << 2;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r > 240 && g > 240 && b > 240) continue;
      const qr = (r >> 4) & 0x0f;
      const qg = (g >> 4) & 0x0f;
      const qb = (b >> 4) & 0x0f;
      const key = (qr << 8) | (qg << 4) | qb;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
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

async function createPdf() {
  const assetsDir = path.join(__dirname, '..', 'public', 'Assets for UI', 'Kola design assets');
  const logoPath = path.join(assetsDir, 'kola logo.png');
  const mascotA = path.join(assetsDir, '5.png');
  const mascotB = path.join(assetsDir, '9.png');

  const outDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'Kola-brand-one-pager.pdf');

  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  doc.fontSize(20).fillColor('#111827').text('Kola — Brand One‑Pager', { align: 'left' });
  doc.moveDown(0.5);

  // Logo
  try {
    doc.image(logoPath, { fit: [160, 160], align: 'left' });
  } catch (e) {
    doc.fillColor('#ff0000').text('Logo image missing', { continued: false });
  }

  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#374151').text('Primary logo and mascots, color palette, and basic usage notes.', { align: 'left' });

  // Mascots
  const mascX = doc.x;
  const mascY = doc.y + 8;
  try {
    doc.image(mascotA, mascX, mascY, { fit: [96, 96] });
    doc.image(mascotB, mascX + 110, mascY, { fit: [96, 96] });
  } catch (e) {}

  doc.moveDown(6);

  // Sample and render colors
  const logoColors = await sampleColors(logoPath);
  const mascotAColors = await sampleColors(mascotA);
  const mascotBColors = await sampleColors(mascotB);

  const palette = [logoColors[0]?.hex, mascotAColors[0]?.hex, logoColors[2]?.hex, mascotBColors[1]?.hex].filter(Boolean);

  doc.fontSize(14).fillColor('#111827').text('Color Palette', { underline: true });
  doc.moveDown(0.5);

  const swatchSize = 36;
  let x = doc.x;
  const y = doc.y;
  palette.forEach((hex, i) => {
    doc.rect(x + i * (swatchSize + 12), y, swatchSize, swatchSize).fill(hex);
  });
  doc.moveDown(2);

  // Palette labels
  palette.forEach((hex, i) => {
    doc.fontSize(10).fillColor('#111827').text(hex, x + i * (swatchSize + 12), y + swatchSize + 6);
  });

  doc.moveDown(6);
  doc.fontSize(12).fillColor('#111827').text('Usage Notes', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#374151').list([
    'Logo: Use the full-color logo on light backgrounds. Provide sufficient clear space.',
    `Primary color: ${palette[0] || '(sample unavailable)'}. Use for CTAs and accent elements.`,
    `Secondary color: ${palette[1] || '(sample unavailable)'}. Use for highlights and icons.`,
  ]);

  doc.end();
  await new Promise((res) => stream.on('close', res));
  console.log('PDF generated at', outPath);
}

createPdf().catch((err) => {
  console.error('Error creating PDF:', err);
  process.exit(1);
});
