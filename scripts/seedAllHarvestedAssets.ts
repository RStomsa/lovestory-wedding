import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma';
import { STUDIO_FONTS } from '../src/lib/studioFonts';
import { WEDDING_ASSETS } from '../src/data/weddingAssets';

async function seedAssets() {
  console.log('=== BẮT ĐẦU NHẬP DỮ LIỆU FONT CHỮ VÀ ĐỒ HỌA VÀO CƠ SỞ DỮ LIỆU HỆ THỐNG ===\n');

  // 1. NHẬP TOÀN BỘ FONT CHỮ VÀO DATABASE
  console.log('1. Nhập phông chữ đám cưới vào Database (CustomFont)...');
  let fontsImported = 0;
  for (const font of STUDIO_FONTS) {
    const existing = await prisma.customFont.findFirst({
      where: { name: font.name },
    });

    if (!existing) {
      await prisma.customFont.create({
        data: {
          name: font.name,
          family: font.family,
          googleFont: font.googleFont || null,
          desc: font.desc || 'Phông chữ đám cưới LoveStory',
          category: font.category,
        },
      });
      fontsImported++;
    }
  }
  console.log(`-> Đã nhập thành công ${fontsImported} phông chữ mới vào Database.\n`);

  // 2. NHẬP TOÀN BỘ ĐỒ HỌA TRANG TRÍ ĐÃ CÀO VÀO DATABASE
  console.log('2. Nhập đồ họa trang trí cào từ CineLove vào Database (CustomGraphic)...');
  let gfxImported = 0;

  // A. 91 Decorations (Hoa, cành lá, nơ, khung viền trang trí)
  for (let i = 1; i <= 91; i++) {
    const num = i.toString().padStart(3, '0');
    const filename = `decor-${num}.png`;
    const localPath = path.join(process.cwd(), 'public', 'assets', 'wedding', 'decorations', filename);
    if (fs.existsSync(localPath)) {
      const src = `/assets/wedding/decorations/${filename}`;
      const name = `Họa tiết trang trí #${num}`;
      const existing = await prisma.customGraphic.findFirst({ where: { src } });
      if (!existing) {
        await prisma.customGraphic.create({
          data: {
            name,
            src,
            category: 'Hoa & Họa tiết',
            subCategory: i <= 30 ? 'Hoa cưới & Cành lá' : i <= 60 ? 'Khung viền & Nơ' : 'Họa tiết lãng mạn',
            defaultWidth: 150,
            defaultHeight: 150,
          },
        });
        gfxImported++;
      }
    }
  }

  // B. 11 Chibi Characters (Nhân vật chibi cô dâu chú rể hoạt hình)
  const charactersDir = path.join(process.cwd(), 'public', 'assets', 'wedding', 'characters');
  if (fs.existsSync(charactersDir)) {
    const charFiles = fs.readdirSync(charactersDir).filter((f) => f.endsWith('.png') || f.endsWith('.webp'));
    for (const file of charFiles) {
      const src = `/assets/wedding/characters/${file}`;
      const cleanName = file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const existing = await prisma.customGraphic.findFirst({ where: { src } });
      if (!existing) {
        await prisma.customGraphic.create({
          data: {
            name: `Nhân vật Chibi - ${cleanName}`,
            src,
            category: 'Nhân vật',
            subCategory: 'Cô dâu & Chú rể hoạt hình',
            defaultWidth: 120,
            defaultHeight: 150,
          },
        });
        gfxImported++;
      }
    }
  }

  // C. 12 Crop Shapes (Khung cắt hình dạng nghệ thuật)
  const shapesDir = path.join(process.cwd(), 'public', 'assets', 'wedding', 'crop-shapes');
  if (fs.existsSync(shapesDir)) {
    const shapeFiles = fs.readdirSync(shapesDir).filter((f) => f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.svg'));
    for (const file of shapeFiles) {
      const src = `/assets/wedding/crop-shapes/${file}`;
      const cleanName = file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const existing = await prisma.customGraphic.findFirst({ where: { src } });
      if (!existing) {
        await prisma.customGraphic.create({
          data: {
            name: `Khung cắt - ${cleanName}`,
            src,
            category: 'Khung viền',
            subCategory: 'Hình dạng khung ảnh',
            defaultWidth: 160,
            defaultHeight: 160,
          },
        });
        gfxImported++;
      }
    }
  }

  // D. 8 Flowchart Timeline Icons (Biểu tượng lịch trình đám cưới)
  const iconsDir = path.join(process.cwd(), 'public', 'assets', 'wedding', 'flowchart-icons');
  if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir).filter((f) => f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.svg'));
    for (const file of iconFiles) {
      const src = `/assets/wedding/flowchart-icons/${file}`;
      const cleanName = file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const existing = await prisma.customGraphic.findFirst({ where: { src } });
      if (!existing) {
        await prisma.customGraphic.create({
          data: {
            name: `Biểu tượng sự kiện - ${cleanName}`,
            src,
            category: 'Yếu tố đám cưới',
            subCategory: 'Lịch trình đám cưới',
            defaultWidth: 80,
            defaultHeight: 80,
          },
        });
        gfxImported++;
      }
    }
  }

  // E. 5 Plugins (Con dấu sáp, con dấu trái tim, seal)
  const pluginsDir = path.join(process.cwd(), 'public', 'assets', 'wedding', 'plugins');
  if (fs.existsSync(pluginsDir)) {
    const pluginFiles = fs.readdirSync(pluginsDir).filter((f) => f.endsWith('.png') || f.endsWith('.webp'));
    for (const file of pluginFiles) {
      const src = `/assets/wedding/plugins/${file}`;
      const cleanName = file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const existing = await prisma.customGraphic.findFirst({ where: { src } });
      if (!existing) {
        await prisma.customGraphic.create({
          data: {
            name: `Con dấu niêm phong - ${cleanName}`,
            src,
            category: 'Yếu tố đám cưới',
            subCategory: 'Con dấu sáp & Sticker',
            defaultWidth: 90,
            defaultHeight: 90,
          },
        });
        gfxImported++;
      }
    }
  }

  console.log(`-> Đã nhập thành công ${gfxImported} đồ họa thực tế vào Database.\n`);

  const totalFontsInDb = await prisma.customFont.count();
  const totalGfxInDb = await prisma.customGraphic.count();

  console.log(`=== TỔNG KẾT NHẬP DỮ LIỆU ===`);
  console.log(`Tổng số phông chữ trong Database: ${totalFontsInDb}`);
  console.log(`Tổng số hình đồ họa trong Database: ${totalGfxInDb}`);
}

seedAssets()
  .catch((err) => {
    console.error('Seed error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
