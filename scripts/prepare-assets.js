const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

async function prepare() {
  const assetsDir = path.join(__dirname, '..', 'public', 'Assets for UI', 'Kola design assets');
  const outDir = path.join(__dirname, '..', 'dist', 'kola-assets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const files = ['kola logo.png', '5.png', '9.png'];
  const sizes = [512, 256, 128];

  for (const f of files) {
    const src = path.join(assetsDir, f);
    const baseName = f.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9\-\.]/g, '');
    try {
      // Copy original
      fs.copyFileSync(src, path.join(outDir, baseName));
      // Use macOS `sips` to create resized copies (fast, available on macOS)
      for (const s of sizes) {
        const outName = baseName.replace(/\.png$/i, `@${s}.png`);
        try {
          execFileSync('sips', ['-Z', String(s), src, '--out', path.join(outDir, outName)]);
        } catch (e) {
          // sips may fail on some systems; fall back to copying original
          fs.copyFileSync(src, path.join(outDir, outName));
        }
      }
      console.log('Processed', f);
    } catch (e) {
      console.error('Error processing', f, e.message);
    }
  }
  console.log('Assets prepared in', outDir);
}

prepare().catch((err) => {
  console.error(err);
  process.exit(1);
});
