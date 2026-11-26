const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(process.cwd(), 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copy icon.ico
const srcIco = path.join(process.cwd(), 'src', 'app', 'favicon.ico');
if (fs.existsSync(srcIco)) {
  fs.copyFileSync(srcIco, path.join(iconsDir, 'icon.ico'));
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#e11d48"/>
  <path d="M256 420c-150-100-200-200-140-270 45-52 110-30 140 30 30-60 95-82 140-30 60 70 10 170-140 270z" fill="#ffffff"/>
</svg>`;

async function main() {
  const buf = Buffer.from(svg);
  await sharp(buf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon.png'));
  await sharp(buf).resize(128, 128).png().toFile(path.join(iconsDir, '128x128.png'));
  await sharp(buf).resize(256, 256).png().toFile(path.join(iconsDir, '128x128@2x.png'));
  await sharp(buf).resize(32, 32).png().toFile(path.join(iconsDir, '32x32.png'));
  console.log('Icons generated successfully in src-tauri/icons!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
