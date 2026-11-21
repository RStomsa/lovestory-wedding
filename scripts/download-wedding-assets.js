const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const categorized = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'all_categorized_assets.json'), 'utf8'));

const BASE_OUT = path.join(__dirname, '..', 'public', 'assets', 'wedding');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return resolve({ url, destPath, skipped: true });
    }

    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with HTTP ${res.statusCode}: ${url}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => resolve({ url, destPath, skipped: false }));
      });
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    req.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
    req.setTimeout(30000, () => {
      req.abort();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function downloadPool(items, concurrency = 5) {
  let index = 0;
  let completed = 0;
  const total = items.length;

  return new Promise((resolve) => {
    function next() {
      if (index >= total) {
        if (completed === total) resolve();
        return;
      }

      const current = items[index++];
      downloadFile(current.url, current.dest)
        .then(() => {
          completed++;
          process.stdout.write(`\r[${completed}/${total}] Downloaded ${path.basename(current.dest)}`);
          next();
        })
        .catch((err) => {
          completed++;
          console.error(`\nError downloading ${current.url}:`, err.message);
          next();
        });
    }

    for (let i = 0; i < Math.min(concurrency, total); i++) {
      next();
    }
  });
}

async function run() {
  console.log('=== BẮT ĐẦU TẢI TOÀN BỘ ASSETS TỪ CINELOVE.ME ===\n');
  ensureDir(BASE_OUT);

  const downloadQueue = [];
  const manifest = {};

  // 1. Opening effects
  const openingDir = path.join(BASE_OUT, 'opening-effects');
  ensureDir(openingDir);
  manifest.openingEffects = [];
  categorized['opening-effects'].forEach((url) => {
    const filename = path.basename(url);
    const dest = path.join(openingDir, filename);
    downloadQueue.push({ url, dest });
    manifest.openingEffects.push({
      name: filename,
      url: `/assets/wedding/opening-effects/${filename}`,
      originalUrl: url
    });
  });

  // 2. Audio (Wedding MP3s)
  const audioDir = path.join(BASE_OUT, 'audio');
  ensureDir(audioDir);
  manifest.audio = [];
  categorized['audio'].forEach((url, i) => {
    const filename = `wedding-melody-${String(i + 1).padStart(2, '0')}.mp3`;
    const dest = path.join(audioDir, filename);
    downloadQueue.push({ url, dest });
    manifest.audio.push({
      name: `Nhạc cưới lãng mạn ${i + 1}`,
      url: `/assets/wedding/audio/${filename}`,
      originalUrl: url
    });
  });

  // 3. Music player icons
  const playerDir = path.join(BASE_OUT, 'music-player');
  ensureDir(playerDir);
  manifest.musicPlayer = [];
  categorized['music-player'].forEach((url) => {
    const filename = path.basename(url);
    const dest = path.join(playerDir, filename);
    downloadQueue.push({ url, dest });
    manifest.musicPlayer.push({
      name: filename,
      url: `/assets/wedding/music-player/${filename}`
    });
  });

  // 4. Plugins (Wax seal, Calendar heart, Gifts...)
  const pluginsDir = path.join(BASE_OUT, 'plugins');
  ensureDir(pluginsDir);
  manifest.plugins = [];
  categorized['plugins'].forEach((url) => {
    const filename = path.basename(url);
    const dest = path.join(pluginsDir, filename);
    downloadQueue.push({ url, dest });
    manifest.plugins.push({
      name: filename,
      url: `/assets/wedding/plugins/${filename}`
    });
  });

  // 5. Flowchart icons
  const iconsDir = path.join(BASE_OUT, 'flowchart-icons');
  ensureDir(iconsDir);
  manifest.flowchartIcons = [];
  categorized['flowchart-icons'].forEach((url, i) => {
    const ext = path.extname(url) || '.png';
    const filename = `timeline-icon-${String(i + 1).padStart(2, '0')}${ext}`;
    const dest = path.join(iconsDir, filename);
    downloadQueue.push({ url, dest });
    manifest.flowchartIcons.push({
      name: `Icon lịch trình ${i + 1}`,
      url: `/assets/wedding/flowchart-icons/${filename}`
    });
  });

  // 6. Crop Shapes (Masks)
  const shapesDir = path.join(BASE_OUT, 'crop-shapes');
  ensureDir(shapesDir);
  manifest.cropShapes = [];
  categorized['crop-shapes'].forEach((url, i) => {
    const ext = path.extname(url) || '.png';
    const filename = `crop-mask-${String(i + 1).padStart(2, '0')}${ext}`;
    const dest = path.join(shapesDir, filename);
    downloadQueue.push({ url, dest });
    manifest.cropShapes.push({
      name: `Khung ảnh mask ${i + 1}`,
      url: `/assets/wedding/crop-shapes/${filename}`
    });
  });

  // 7. Characters (Chibi Bride & Groom)
  const charDir = path.join(BASE_OUT, 'characters');
  ensureDir(charDir);
  manifest.characters = [];
  categorized['characters'].forEach((url, i) => {
    const ext = path.extname(url) || '.png';
    const filename = `chibi-${String(i + 1).padStart(2, '0')}${ext}`;
    const dest = path.join(charDir, filename);
    downloadQueue.push({ url, dest });
    manifest.characters.push({
      name: `Sticker chibi ${i + 1}`,
      url: `/assets/wedding/characters/${filename}`
    });
  });

  // 8. Template decorations (frames, ribbons, floral ornaments)
  const decorDir = path.join(BASE_OUT, 'decorations');
  ensureDir(decorDir);
  manifest.decorations = [];
  categorized['templates-decor'].forEach((url, i) => {
    const ext = path.extname(url) || '.png';
    const filename = `decor-${String(i + 1).padStart(3, '0')}${ext}`;
    const dest = path.join(decorDir, filename);
    downloadQueue.push({ url, dest });
    manifest.decorations.push({
      name: `Họa tiết trang trí ${i + 1}`,
      url: `/assets/wedding/decorations/${filename}`
    });
  });

  console.log(`Tổng số tệp cần tải: ${downloadQueue.length} tệp`);
  console.log(`- Opening Effects: ${manifest.openingEffects.length}`);
  console.log(`- MP3 Nhạc nền: ${manifest.audio.length}`);
  console.log(`- Đĩa than / Audio icon: ${manifest.musicPlayer.length}`);
  console.log(`- Dấu sáp & Plugins: ${manifest.plugins.length}`);
  console.log(`- Icon lịch trình: ${manifest.flowchartIcons.length}`);
  console.log(`- Khung Crop Mask: ${manifest.cropShapes.length}`);
  console.log(`- Sticker Chibi: ${manifest.characters.length}`);
  console.log(`- Họa tiết trang trí: ${manifest.decorations.length}\n`);

  await downloadPool(downloadQueue, 6);

  // Write manifest
  fs.writeFileSync(path.join(BASE_OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Generate Typescript helper
  const tsContent = `// Tự động sinh từ WeddingStudio Asset Downloader
export interface WeddingStudioAsset {
  name: string;
  url: string;
  originalUrl?: string;
}

export interface WeddingStudioAssetManifest {
  openingEffects: WeddingStudioAsset[];
  audio: WeddingStudioAsset[];
  musicPlayer: WeddingStudioAsset[];
  plugins: WeddingStudioAsset[];
  flowchartIcons: WeddingStudioAsset[];
  cropShapes: WeddingStudioAsset[];
  characters: WeddingStudioAsset[];
  decorations: WeddingStudioAsset[];
}

export const CINELOVE_ASSETS: WeddingStudioAssetManifest = ${JSON.stringify(manifest, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'weddingAssets.ts'), tsContent);

  console.log('\n\n✅ ĐÃ HOÀN TẤT TẢI TOÀN BỘ ASSETS!');
  console.log(`📁 Thư mục lưu: public/assets/wedding/`);
  console.log(`📄 Manifest JSON: public/assets/wedding/manifest.json`);
  console.log(`📘 TypeScript Helper: src/data/weddingAssets.ts`);
}

run().catch(console.error);
