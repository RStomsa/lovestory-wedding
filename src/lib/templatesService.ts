import fs from 'fs';
import path from 'path';
import { CATALOG_TEMPLATES, CatalogTemplate } from '@/data/templatesCatalog';

const CUSTOM_TEMPLATES_FILE = path.join(process.cwd(), 'src', 'data', 'customTemplates.json');
const TRASHED_TEMPLATES_FILE = path.join(process.cwd(), 'src', 'data', 'trashedTemplates.json');

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

function writeCustomTemplates(list: CatalogTemplate[]) {
  try {
    fs.writeFileSync(CUSTOM_TEMPLATES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write custom templates:', err);
  }
}

export function getTrashedTemplates(): CatalogTemplate[] {
  try {
    if (fs.existsSync(TRASHED_TEMPLATES_FILE)) {
      const data = fs.readFileSync(TRASHED_TEMPLATES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read trashed templates:', err);
  }
  return [];
}

function writeTrashedTemplates(list: CatalogTemplate[]) {
  try {
    fs.writeFileSync(TRASHED_TEMPLATES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write trashed templates:', err);
  }
}

/**
 * Move a template to the Trash bin (Thùng rác)
 * Allows restoring later or permanent deletion
 */
export function moveToTrash(id: string): { success: boolean; message: string; template?: CatalogTemplate } {
  const normId = id.trim().toLowerCase();
  const custom = readCustomTemplates();
  const trashed = getTrashedTemplates();

  // 1. Check in custom templates
  const customIndex = custom.findIndex(
    (t) => t.id.toLowerCase() === normId || (t.slug && t.slug.toLowerCase() === normId)
  );

  let targetTemplate: CatalogTemplate | null = null;

  if (customIndex >= 0) {
    targetTemplate = custom[customIndex];
    custom.splice(customIndex, 1);
    writeCustomTemplates(custom);
  } else {
    // 2. Check in built-in CATALOG_TEMPLATES
    const builtIn = CATALOG_TEMPLATES.find(
      (t) => t.id.toLowerCase() === normId || (t.slug && t.slug.toLowerCase() === normId)
    );
    if (builtIn) {
      targetTemplate = { ...builtIn };
    }
  }

  if (!targetTemplate) {
    return { success: false, message: 'Không tìm thấy mẫu thiệp cần bỏ vào thùng rác.' };
  }

  const trashedItem: CatalogTemplate = {
    ...targetTemplate,
    trashedAt: new Date().toISOString(),
    trashedReason: 'Đã chuyển vào thùng rác bởi Quản trị viên',
  };

  // Prevent duplicate in trash
  const existingTrashIdx = trashed.findIndex(
    (t) => t.id.toLowerCase() === trashedItem.id.toLowerCase() || t.slug.toLowerCase() === trashedItem.slug.toLowerCase()
  );

  if (existingTrashIdx >= 0) {
    trashed[existingTrashIdx] = trashedItem;
  } else {
    trashed.unshift(trashedItem);
  }

  writeTrashedTemplates(trashed);
  return { success: true, message: `Đã bỏ mẫu "${trashedItem.name}" vào thùng rác thành công.`, template: trashedItem };
}

/**
 * Restore a template from the Trash bin back to active catalog
 */
export function restoreFromTrash(id: string): { success: boolean; message: string; template?: CatalogTemplate } {
  const normId = id.trim().toLowerCase();
  const trashed = getTrashedTemplates();
  const trashIndex = trashed.findIndex(
    (t) => t.id.toLowerCase() === normId || (t.slug && t.slug.toLowerCase() === normId)
  );

  if (trashIndex < 0) {
    return { success: false, message: 'Không tìm thấy mẫu thiệp trong thùng rác.' };
  }

  const [item] = trashed.splice(trashIndex, 1);
  writeTrashedTemplates(trashed);

  const restoredItem: CatalogTemplate = {
    ...item,
    trashedAt: undefined,
    trashedReason: undefined,
    isCustom: true,
  };

  const custom = readCustomTemplates();
  const existingCustomIdx = custom.findIndex(
    (t) => t.id.toLowerCase() === restoredItem.id.toLowerCase() || t.slug.toLowerCase() === restoredItem.slug.toLowerCase()
  );

  if (existingCustomIdx >= 0) {
    custom[existingCustomIdx] = restoredItem;
  } else {
    custom.unshift(restoredItem);
  }

  writeCustomTemplates(custom);
  return { success: true, message: `Đã khôi phục mẫu "${restoredItem.name}" về danh mục hoạt động!`, template: restoredItem };
}

/**
 * Permanently delete a template from Trash
 */
export function permanentlyDeleteFromTrash(id: string): boolean {
  const normId = id.trim().toLowerCase();
  const trashed = getTrashedTemplates();
  const filtered = trashed.filter(
    (t) => t.id.toLowerCase() !== normId && (!t.slug || t.slug.toLowerCase() !== normId)
  );

  if (filtered.length !== trashed.length) {
    writeTrashedTemplates(filtered);
    return true;
  }
  return false;
}

/**
 * Empty the entire Trash bin
 */
export function emptyTrash(): boolean {
  try {
    writeTrashedTemplates([]);
    return true;
  } catch (err) {
    console.error('Failed to empty trash:', err);
    return false;
  }
}

/**
 * Get all available catalog templates (built-in + admin created)
 * Excludes any templates currently in the Trash bin
 */
export function getAllCatalogTemplates(): CatalogTemplate[] {
  const custom = readCustomTemplates();
  const trashed = getTrashedTemplates();

  const trashedIds = new Set(trashed.map((t) => t.id.toLowerCase()));
  const trashedSlugs = new Set(trashed.map((t) => (t.slug || '').toLowerCase()).filter(Boolean));

  // Filter custom templates (remove any trashed ones)
  const activeCustom = custom.filter(
    (c) => !trashedIds.has(c.id.toLowerCase()) && !trashedSlugs.has((c.slug || '').toLowerCase())
  );

  const activeCustomIds = new Set(activeCustom.map((c) => c.id.toLowerCase()));
  const activeCustomSlugs = new Set(activeCustom.map((c) => (c.slug || c.id).toLowerCase()));

  // Filter built-in templates (not trashed and not overridden by custom)
  const remainingBuiltIn = CATALOG_TEMPLATES.filter((t) => {
    const idNorm = t.id.toLowerCase();
    const slugNorm = (t.slug || '').toLowerCase();
    if (trashedIds.has(idNorm) || (slugNorm && trashedSlugs.has(slugNorm))) return false;
    if (activeCustomIds.has(idNorm) || (slugNorm && activeCustomSlugs.has(slugNorm))) return false;
    return true;
  });

  return [...activeCustom, ...remainingBuiltIn];
}

/**
 * Update an existing catalog template (custom or built-in override)
 */
export function updateCatalogTemplate(id: string, updates: Partial<CatalogTemplate>): CatalogTemplate | null {
  const custom = readCustomTemplates();
  const existingCustomIndex = custom.findIndex((t) => t.id === id || t.slug === id);

  if (existingCustomIndex >= 0) {
    const updated = { ...custom[existingCustomIndex], ...updates };
    custom[existingCustomIndex] = updated;
    writeCustomTemplates(custom);
    return updated;
  }

  // If it's a built-in template, clone it into custom templates with the updates
  const builtIn = CATALOG_TEMPLATES.find((t) => t.id === id || t.slug === id);
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
export function addCustomTemplate(
  template: Omit<CatalogTemplate, 'likes' | 'views'> & { likes?: number; views?: number }
): CatalogTemplate {
  const custom = readCustomTemplates();
  const existingIndex = custom.findIndex((t) => t.id === template.id || t.slug === template.slug);

  const newTemplate: CatalogTemplate = {
    ...template,
    likes: template.likes || 0,
    views: template.views || 0,
    isCustom: true,
  };

  if (existingIndex >= 0) {
    custom[existingIndex] = { ...custom[existingIndex], ...newTemplate };
  } else {
    custom.unshift(newTemplate);
  }

  writeCustomTemplates(custom);

  // If it was in trash before, remove from trash
  const trashed = getTrashedTemplates();
  const trashIdx = trashed.findIndex((t) => t.id === template.id || t.slug === template.slug);
  if (trashIdx >= 0) {
    trashed.splice(trashIdx, 1);
    writeTrashedTemplates(trashed);
  }

  return newTemplate;
}

/**
 * Delete a custom template directly (or legacy fallback)
 */
export function deleteCustomTemplate(id: string): boolean {
  const result = moveToTrash(id);
  return result.success;
}
