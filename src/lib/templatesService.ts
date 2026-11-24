import fs from 'fs';
import path from 'path';
import { CATALOG_TEMPLATES, CatalogTemplate } from '@/data/templatesCatalog';

const CUSTOM_TEMPLATES_FILE = path.join(process.cwd(), 'src', 'data', 'customTemplates.json');
const HARVESTED_INDEX_FILE = path.join(process.cwd(), 'src', 'data', 'harvested_templates', 'index.json');
const MINVITE_FILE = path.join(process.cwd(), 'src', 'data', 'minvite_templates.json');

const FALLBACK_CATEGORY_THUMBS: Record<string, string> = {
  birthday: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
  graduation: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
  event: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  anniversary: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
};

function readCustomTemplates(): CatalogTemplate[] {
  try {
    if (fs.existsSync(CUSTOM_TEMPLATES_FILE)) {
      const data = fs.readFileSync(CUSTOM_TEMPLATES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read custom templates:', err);
  }
  return [];
}

function readNonWeddingHarvestedTemplates(): CatalogTemplate[] {
  try {
    if (fs.existsSync(HARVESTED_INDEX_FILE)) {
      const raw = fs.readFileSync(HARVESTED_INDEX_FILE, 'utf-8');
      const items: any[] = JSON.parse(raw);
      return items
        .filter((t) => t.category && t.category !== 'wedding')
        .map((t) => {
          const cleanTitle = (t.title || '')
            .replace(/-\s*Thiệp online LoveStory.*$/i, '')
            .replace(/-\s*CineLove.*$/i, '')
            .trim() || t.slug;

          let thumb =
            t.coverImage ||
            t.longThumbnail ||
            (t.images && t.images.length > 0 ? t.images[0] : null);

          if (!thumb || typeof thumb !== 'string' || thumb.includes('assets.lovestory.vn')) {
            thumb = FALLBACK_CATEGORY_THUMBS[t.category] || FALLBACK_CATEGORY_THUMBS.event;
          }

          return {
            id: `harvested-${t.slug}`,
            name: cleanTitle,
            slug: t.slug,
            category: t.category,
            style: t.style || 'modern',
            tier: 'PREMIUM' as const,
            price: 30000,
            badge: 'Premium' as const,
            longThumbnail: thumb,
            likes: 0,
            views: 0,
            baseTemplateId: 'burgundy',
            description: `${cleanTitle} - Mẫu thiệp trực tuyến chuẩn Responsive cao cấp, hỗ trợ tương tác và lưu trữ trực tiếp.`,
          };
        });
    }
  } catch (err) {
    console.error('Failed to read harvested non-wedding templates:', err);
  }
  return [];
}

function readNonWeddingMinviteTemplates(): CatalogTemplate[] {
  try {
    if (fs.existsSync(MINVITE_FILE)) {
      const raw = fs.readFileSync(MINVITE_FILE, 'utf-8');
      const items: any[] = JSON.parse(raw);
      return items
        .filter((t) => t.category && t.category !== 'wedding')
        .map((t) => ({
          id: `minvite-${t.slug || t.id}`,
          name: t.title || 'Mẫu Sự Kiện LoveStory',
          slug: t.slug,
          category: t.category === 'birthday' ? 'birthday' : 'event',
          style: 'modern' as const,
          tier: t.planRequired === 1 ? ('PREMIUM' as const) : ('FREE' as const),
          price: t.planRequired === 1 ? 200000 : 0,
          badge: t.planRequired === 1 ? ('Premium' as const) : ('Miễn phí' as const),
          longThumbnail: t.coverImage || t.thumbnail || FALLBACK_CATEGORY_THUMBS[t.category] || FALLBACK_CATEGORY_THUMBS.event,
          likes: 0,
          views: 0,
          baseTemplateId: 'burgundy',
          description: t.description || `Mẫu thiệp hiện đại ${t.title} - LoveStory Collection.`,
        }));
    }
  } catch (err) {
    console.error('Failed to read minvite non-wedding templates:', err);
  }
  return [];
}

function writeCustomTemplates(list: CatalogTemplate[]) {
  try {
    fs.writeFileSync(CUSTOM_TEMPLATES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write custom templates:', err);
  }
}

/**
 * Get all available catalog templates (built-in + admin created + categorized events)
 */
export function getAllCatalogTemplates(): CatalogTemplate[] {
  const custom = readCustomTemplates();
  const customIds = new Set(custom.map((c) => c.id.toLowerCase()));
  const customSlugs = new Set(custom.map((c) => (c.slug || c.id).toLowerCase()));

  // Filter out any built-in template that has an updated custom version with the same ID or slug
  const remainingBuiltIn = CATALOG_TEMPLATES.filter(
    (t) => !customIds.has(t.id.toLowerCase()) && !customSlugs.has(t.slug.toLowerCase()) && !customIds.has(t.slug.toLowerCase())
  );

  const nonWeddingHarvested = readNonWeddingHarvestedTemplates().filter(
    (t) => !customIds.has(t.id.toLowerCase()) && !customSlugs.has(t.slug.toLowerCase())
  );

  const nonWeddingMinvite = readNonWeddingMinviteTemplates().filter(
    (t) => !customIds.has(t.id.toLowerCase()) && !customSlugs.has(t.slug.toLowerCase())
  );

  return [...custom, ...remainingBuiltIn, ...nonWeddingHarvested, ...nonWeddingMinvite];
}

/**
 * Update an existing catalog template (custom or built-in override)
 */
export function updateCatalogTemplate(id: string, updates: Partial<CatalogTemplate>): CatalogTemplate | null {
  const custom = readCustomTemplates();
  const existingCustomIndex = custom.findIndex((t) => t.id === id);

  if (existingCustomIndex >= 0) {
    const updated = { ...custom[existingCustomIndex], ...updates };
    custom[existingCustomIndex] = updated;
    writeCustomTemplates(custom);
    return updated;
  }

  // If it's a built-in template, clone it into custom templates with the updates
  const builtIn = CATALOG_TEMPLATES.find((t) => t.id === id);
  if (builtIn) {
    const updated: CatalogTemplate = { ...builtIn, ...updates, isCustom: true };
    custom.unshift(updated);
    writeCustomTemplates(custom);
    return updated;
  }

  return null;
}

/**
 * Add and publish a new custom template
 */
export function addCustomTemplate(template: Omit<CatalogTemplate, 'likes' | 'views'> & { likes?: number; views?: number }): CatalogTemplate {
  const custom = readCustomTemplates();
  const existingIndex = custom.findIndex((t) => t.id === template.id || t.slug === template.slug);

  const newTemplate: CatalogTemplate = {
    ...template,
    likes: template.likes || 0,
    views: template.views || 0,
  };

  if (existingIndex >= 0) {
    custom[existingIndex] = { ...custom[existingIndex], ...newTemplate };
  } else {
    custom.unshift(newTemplate);
  }

  writeCustomTemplates(custom);
  return newTemplate;
}

/**
 * Delete a custom template
 */
export function deleteCustomTemplate(id: string): boolean {
  const custom = readCustomTemplates();
  const filtered = custom.filter((t) => t.id !== id);
  if (filtered.length !== custom.length) {
    writeCustomTemplates(filtered);
    return true;
  }
  return false;
}
