import fs from 'fs';
import path from 'path';
import { CATALOG_TEMPLATES, CatalogTemplate } from '@/data/templatesCatalog';

const CUSTOM_TEMPLATES_FILE = path.join(process.cwd(), 'src', 'data', 'customTemplates.json');

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

/**
 * Get all available catalog templates (built-in + admin created)
 */
export function getAllCatalogTemplates(): CatalogTemplate[] {
  const custom = readCustomTemplates();
  const customIds = new Set(custom.map((c) => c.id));
  // Filter out any built-in template that has an updated custom version with the same ID
  const remainingBuiltIn = CATALOG_TEMPLATES.filter((t) => !customIds.has(t.id));
  return [...custom, ...remainingBuiltIn];
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
