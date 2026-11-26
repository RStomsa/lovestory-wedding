import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { STUDIO_FONTS, StudioFont } from '@/lib/studioFonts';
import { GRAPHICS_CATALOG, GraphicSticker } from '@/data/graphicsCatalog';
import defaultMusicCatalog from '@/data/weddingMusicCatalog.json';
import defaultStockCatalog from '@/data/stockGraphicsCatalog.json';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CUSTOM_FONTS_FILE = path.join(DATA_DIR, 'customFonts.json');
const CUSTOM_GRAPHICS_FILE = path.join(DATA_DIR, 'customGraphics.json');
const CUSTOM_GRAPHICS_FOLDERS_FILE = path.join(DATA_DIR, 'customGraphicFolders.json');
const CUSTOM_MUSIC_FILE = path.join(DATA_DIR, 'customMusic.json');

export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  originalUrl?: string;
  isCustom?: boolean;
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// ==========================================
// 1. FONTS SERVICE (Prisma SQLite with JSON fallback)
// ==========================================
export async function getCustomFonts(): Promise<(StudioFont & { isCustom?: boolean })[]> {
  try {
    let dbFonts = await prisma.customFont.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Auto-seed initial curated wedding fonts into database if empty
    if (!dbFonts || dbFonts.length === 0) {
      try {
        await prisma.customFont.createMany({
          data: STUDIO_FONTS.map((f) => ({
            name: f.name,
            family: f.family,
            googleFont: f.googleFont,
            desc: f.desc,
            category: f.category,
          })),
        });
        dbFonts = await prisma.customFont.findMany({
          orderBy: { createdAt: 'asc' },
        });
      } catch (seedErr) {
        console.warn('Could not auto-seed fonts into database:', seedErr);
      }
    }

    if (dbFonts && dbFonts.length > 0) {
      return dbFonts.map((f) => ({
        id: f.id,
        name: f.name,
        family: f.family,
        googleFont: f.googleFont || '',
        fileUrl: f.fileUrl || undefined,
        desc: f.desc || '',
        category: f.category as 'script' | 'serif' | 'sans',
        isCustom: true,
      }));
    }
  } catch (err) {
    console.warn('Error querying Prisma custom fonts, falling back to JSON:', err);
  }
  return readJsonFile<(StudioFont & { isCustom?: boolean })[]>(CUSTOM_FONTS_FILE, []);
}

export async function getAllSystemFonts(): Promise<(StudioFont & { isCustom?: boolean })[]> {
  const custom = await getCustomFonts();
  if (custom && custom.length > 0) {
    return custom;
  }
  return STUDIO_FONTS;
}

export async function addCustomFont(fontData: {
  name: string;
  googleFont?: string;
  fileUrl?: string;
  desc?: string;
  category: 'script' | 'serif' | 'sans';
  userId?: string;
}): Promise<StudioFont & { isCustom: boolean }> {
  const cleanName = fontData.name.trim();
  const googleFont = fontData.fileUrl ? '' : (fontData.googleFont?.trim() || cleanName.replace(/\s+/g, '+'));
  const family = `'${cleanName}', ${fontData.category === 'serif' ? 'serif' : fontData.category === 'sans' ? 'sans-serif' : 'cursive, serif'}`;
  const desc = fontData.desc?.trim() || (fontData.fileUrl ? 'Phông chữ tải từ máy tính' : 'Phông chữ tùy chỉnh do Admin thêm');

  try {
    const created = await prisma.customFont.create({
      data: {
        name: cleanName,
        family,
        googleFont,
        fileUrl: fontData.fileUrl?.trim() || null,
        desc,
        category: fontData.category,
        userId: fontData.userId || null,
      },
    });

    return {
      id: created.id,
      name: created.name,
      family: created.family,
      googleFont: created.googleFont || '',
      fileUrl: created.fileUrl || undefined,
      desc: created.desc || '',
      category: created.category as 'script' | 'serif' | 'sans',
      isCustom: true,
    };
  } catch (err) {
    console.error('Prisma create font error, using JSON fallback:', err);
    const id = `custom-font-${Date.now().toString(36)}`;
    const newFont: StudioFont & { isCustom: boolean } = {
      id,
      name: cleanName,
      family,
      googleFont,
      fileUrl: fontData.fileUrl?.trim(),
      desc,
      category: fontData.category,
      isCustom: true,
    };
    const custom = readJsonFile<(StudioFont & { isCustom?: boolean })[]>(CUSTOM_FONTS_FILE, []);
    writeJsonFile(CUSTOM_FONTS_FILE, [newFont, ...custom]);
    return newFont;
  }
}

export async function deleteCustomFont(id: string): Promise<boolean> {
  try {
    await prisma.customFont.delete({ where: { id } });
    return true;
  } catch {
    const custom = readJsonFile<(StudioFont & { isCustom?: boolean })[]>(CUSTOM_FONTS_FILE, []);
    const filtered = custom.filter((f) => f.id !== id);
    if (filtered.length !== custom.length) {
      writeJsonFile(CUSTOM_FONTS_FILE, filtered);
      return true;
    }
    return false;
  }
}

// ==========================================
// 2. GRAPHICS & FOLDERS SERVICE (Prisma SQLite with JSON fallback)
// ==========================================

export interface GraphicFolder {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  createdAt?: string;
  isDefault?: boolean;
  count?: number;
}

export const DEFAULT_GRAPHIC_FOLDERS: GraphicFolder[] = [
  { id: 'folder-nen-thiep', name: 'Nền thiệp', icon: '🖼️', description: 'Các họa tiết texture nền thiệp hoa văn nhã nhặn', isDefault: true },
  { id: 'folder-khung-vien', name: 'Khung viền', icon: '🔲', description: 'Khung viền vàng, góc hoa, đường biên thanh lịch', isDefault: true },
  { id: 'folder-no-hoa', name: 'Nơ & Ruy băng', icon: '🎀', description: 'Nơ lụa thắt, ruy băng trang trí sang trọng', isDefault: true },
  { id: 'folder-hoa-cuoi', name: 'Hoa & Họa tiết', icon: '🌸', description: 'Hoa cưới nghệ thuật, cành ô liu, hoa hồng pastel', isDefault: true },
  { id: 'folder-yeu-to-cuoi', name: 'Yếu tố đám cưới', icon: '💍', description: 'Nhẫn cưới, ly rượu champagne, bánh cưới, chân nến', isDefault: true },
  { id: 'folder-chu-hy', name: 'Chữ Hỷ & Thư pháp', icon: '囍', description: 'Chữ Song Hỷ đỏ kim, chữ thư pháp chúc phúc', isDefault: true },
  { id: 'folder-con-dau-sap', name: 'Con dấu sáp & Phong bì', icon: '💌', description: 'Con dấu sáp nổi 3D, tem thư vintage, bao thư', isDefault: true },
  { id: 'folder-trai-tim', name: 'Trái tim', icon: '❤️', description: 'Trái tim lãng mạn, đôi cánh tình yêu', isDefault: true },
  { id: 'folder-van-hoa-viet', name: 'Văn hóa Việt', icon: '🏮', description: 'Áo dài cưới, nón quai thao, họa tiết truyền thống', isDefault: true },
  { id: 'folder-nhan-vat', name: 'Nhân vật', icon: '👫', description: 'Chibi cô dâu chú rể, hình vẽ phác thảo', isDefault: true },
  { id: 'folder-bieu-tuong', name: 'Biểu tượng & Icon', icon: '✨', description: 'Ngôi sao, hoa tuyết, icon phụ trợ trang trí', isDefault: true },
];

export async function getGraphicFolders(): Promise<GraphicFolder[]> {
  const customFolders = readJsonFile<GraphicFolder[]>(CUSTOM_GRAPHICS_FOLDERS_FILE, []);
  const allGraphics = await getAllSystemGraphics();

  // Map to count graphics in each folder
  const folderCounts: Record<string, number> = {};
  for (const g of allGraphics) {
    const folderKey = (g.folder || g.subCategory || g.category || '').trim();
    if (folderKey) {
      folderCounts[folderKey] = (folderCounts[folderKey] || 0) + 1;
    }
  }

  const combinedMap = new Map<string, GraphicFolder>();

  // Add default folders
  for (const df of DEFAULT_GRAPHIC_FOLDERS) {
    combinedMap.set(df.name.toLowerCase(), {
      ...df,
      count: folderCounts[df.name] || 0,
    });
  }

  // Add custom folders
  for (const cf of customFolders) {
    combinedMap.set(cf.name.toLowerCase(), {
      ...cf,
      count: folderCounts[cf.name] || 0,
    });
  }

  // Also collect any dynamic folder names used in custom graphics
  for (const [folderName, count] of Object.entries(folderCounts)) {
    if (folderName && !combinedMap.has(folderName.toLowerCase())) {
      combinedMap.set(folderName.toLowerCase(), {
        id: `folder-dyn-${encodeURIComponent(folderName.toLowerCase())}`,
        name: folderName,
        icon: '📁',
        description: 'Thư mục tự tạo từ đồ họa',
        isDefault: false,
        count,
      });
    }
  }

  return Array.from(combinedMap.values());
}

export async function createGraphicFolder(folderData: {
  name: string;
  icon?: string;
  description?: string;
}): Promise<GraphicFolder> {
  const name = folderData.name.trim();
  if (!name) throw new Error('Tên thư mục không được để trống');

  const customFolders = readJsonFile<GraphicFolder[]>(CUSTOM_GRAPHICS_FOLDERS_FILE, []);
  const existing = customFolders.find((f) => f.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return existing;
  }

  const newFolder: GraphicFolder = {
    id: `folder-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    icon: folderData.icon?.trim() || '📁',
    description: folderData.description?.trim() || 'Thư mục đồ họa',
    createdAt: new Date().toISOString(),
    isDefault: false,
    count: 0,
  };

  customFolders.push(newFolder);
  writeJsonFile(CUSTOM_GRAPHICS_FOLDERS_FILE, customFolders);
  return newFolder;
}

export async function deleteGraphicFolder(folderIdOrName: string): Promise<boolean> {
  const customFolders = readJsonFile<GraphicFolder[]>(CUSTOM_GRAPHICS_FOLDERS_FILE, []);
  const filtered = customFolders.filter(
    (f) => f.id !== folderIdOrName && f.name.toLowerCase() !== folderIdOrName.toLowerCase()
  );

  if (filtered.length !== customFolders.length) {
    writeJsonFile(CUSTOM_GRAPHICS_FOLDERS_FILE, filtered);
    return true;
  }
  return false;
}

export async function getCustomGraphics(): Promise<(GraphicSticker & { isCustom?: boolean })[]> {
  try {
    const dbGfx = await prisma.customGraphic.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (dbGfx && dbGfx.length > 0) {
      return dbGfx.map((g) => ({
        id: g.id,
        name: g.name,
        src: g.src,
        category: g.category as GraphicSticker['category'],
        subCategory: g.subCategory || undefined,
        folder: g.subCategory || g.category,
        defaultWidth: g.defaultWidth,
        defaultHeight: g.defaultHeight,
        isCustom: true,
      }));
    }
  } catch (err) {
    console.warn('Error querying Prisma custom graphics, falling back to JSON:', err);
  }

  const jsonCustom = readJsonFile<(GraphicSticker & { isCustom?: boolean })[]>(CUSTOM_GRAPHICS_FILE, []);
  return jsonCustom.map((g) => ({
    ...g,
    folder: g.folder || g.subCategory || g.category,
    isCustom: true,
  }));
}

export async function getAllSystemGraphics(): Promise<(GraphicSticker & { isCustom?: boolean })[]> {
  const custom = await getCustomGraphics();
  const stockWithFolders = (defaultStockCatalog as GraphicSticker[]).map((g) => ({
    ...g,
    folder: g.folder || g.subCategory || g.category,
  }));
  const catalogWithFolders = GRAPHICS_CATALOG.map((g) => ({
    ...g,
    folder: g.folder || g.subCategory || g.category,
  }));
  return [...custom, ...stockWithFolders, ...catalogWithFolders];
}

export async function addCustomGraphic(graphicData: {
  name: string;
  src: string;
  category: GraphicSticker['category'];
  subCategory?: string;
  folder?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  userId?: string;
}): Promise<GraphicSticker & { isCustom: boolean }> {
  const folderName = (graphicData.folder || graphicData.subCategory || graphicData.category || '').trim();

  // If new folder is specified, automatically persist it into custom folders if not default
  if (folderName) {
    try {
      await createGraphicFolder({ name: folderName });
    } catch {
      // Ignored if already exists
    }
  }

  try {
    const created = await prisma.customGraphic.create({
      data: {
        name: graphicData.name.trim(),
        src: graphicData.src.trim(),
        category: graphicData.category,
        subCategory: folderName || null,
        defaultWidth: graphicData.defaultWidth || 100,
        defaultHeight: graphicData.defaultHeight || 100,
        userId: graphicData.userId || null,
      },
    });

    return {
      id: created.id,
      name: created.name,
      src: created.src,
      category: created.category as GraphicSticker['category'],
      subCategory: folderName || undefined,
      folder: folderName || undefined,
      defaultWidth: created.defaultWidth,
      defaultHeight: created.defaultHeight,
      isCustom: true,
    };
  } catch (err) {
    console.error('Prisma create graphic error, using JSON fallback:', err);
    const id = `custom-gfx-${Date.now().toString(36)}`;
    const newGraphic: GraphicSticker & { isCustom: boolean } = {
      id,
      name: graphicData.name.trim(),
      src: graphicData.src.trim(),
      category: graphicData.category,
      subCategory: folderName || undefined,
      folder: folderName || undefined,
      defaultWidth: graphicData.defaultWidth || 100,
      defaultHeight: graphicData.defaultHeight || 100,
      isCustom: true,
    };
    const custom = readJsonFile<(GraphicSticker & { isCustom?: boolean })[]>(CUSTOM_GRAPHICS_FILE, []);
    writeJsonFile(CUSTOM_GRAPHICS_FILE, [newGraphic, ...custom]);
    return newGraphic;
  }
}

export async function deleteCustomGraphic(id: string): Promise<boolean> {
  try {
    await prisma.customGraphic.delete({ where: { id } });
    return true;
  } catch {
    const custom = readJsonFile<(GraphicSticker & { isCustom?: boolean })[]>(CUSTOM_GRAPHICS_FILE, []);
    const filtered = custom.filter((g) => g.id !== id);
    if (filtered.length !== custom.length) {
      writeJsonFile(CUSTOM_GRAPHICS_FILE, filtered);
      return true;
    }
    return false;
  }
}

// ==========================================
// 3. MUSIC SERVICE
// ==========================================
export function getCustomMusic(): MusicTrack[] {
  return readJsonFile<MusicTrack[]>(CUSTOM_MUSIC_FILE, []);
}

export function getAllSystemMusic(): MusicTrack[] {
  const custom = getCustomMusic();
  const defaultTracks: MusicTrack[] = defaultMusicCatalog.map((item) => ({
    id: item.id,
    title: item.title,
    artist: item.artist,
    url: item.url,
  }));
  return [...custom, ...defaultTracks];
}

export function addCustomMusic(musicData: {
  title: string;
  artist?: string;
  url: string;
}): MusicTrack {
  const custom = getCustomMusic();
  const id = `custom-music-${Date.now().toString(36)}`;

  const newTrack: MusicTrack = {
    id,
    title: musicData.title.trim(),
    artist: musicData.artist?.trim() || 'LoveStory Wedding Collection',
    url: musicData.url.trim(),
    isCustom: true,
  };

  const updated = [newTrack, ...custom];
  writeJsonFile(CUSTOM_MUSIC_FILE, updated);
  return newTrack;
}

export function deleteCustomMusic(id: string): boolean {
  const custom = getCustomMusic();
  const filtered = custom.filter((m) => m.id !== id);
  if (filtered.length !== custom.length) {
    writeJsonFile(CUSTOM_MUSIC_FILE, filtered);
    return true;
  }
  return false;
}
