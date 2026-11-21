import fs from 'fs';
import path from 'path';
import { StudioTemplatePreset } from '@/data/studioTemplatePresets';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CUSTOM_PRESETS_FILE = path.join(DATA_DIR, 'customStudioPresets.json');

function readPresetsFile(): StudioTemplatePreset[] {
  try {
    if (fs.existsSync(CUSTOM_PRESETS_FILE)) {
      const data = fs.readFileSync(CUSTOM_PRESETS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read custom studio presets:', err);
  }
  return [];
}

function writePresetsFile(list: StudioTemplatePreset[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CUSTOM_PRESETS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write custom studio presets:', err);
    return false;
  }
}

/**
 * Get all custom studio template presets created by Admin
 */
export function getCustomStudioPresets(): StudioTemplatePreset[] {
  return readPresetsFile();
}

/**
 * Get a specific custom studio preset by slug or ID
 */
export function getCustomStudioPreset(slugOrId: string): StudioTemplatePreset | null {
  const norm = slugOrId.toLowerCase().trim();
  const list = readPresetsFile();
  return (
    list.find(
      (p) => p.slug.toLowerCase() === norm || p.id.toLowerCase() === norm
    ) || null
  );
}

/**
 * Save or update a custom studio template preset
 */
export function saveCustomStudioPreset(preset: StudioTemplatePreset): StudioTemplatePreset {
  const list = readPresetsFile();
  const existingIndex = list.findIndex(
    (p) => p.slug === preset.slug || p.id === preset.id
  );

  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...preset };
  } else {
    list.unshift(preset);
  }

  writePresetsFile(list);
  return preset;
}

/**
 * Delete a custom studio preset by slug or ID
 */
export function deleteCustomStudioPreset(slugOrId: string): boolean {
  const list = readPresetsFile();
  const filtered = list.filter(
    (p) => p.slug !== slugOrId && p.id !== slugOrId
  );
  if (filtered.length !== list.length) {
    writePresetsFile(filtered);
    return true;
  }
  return false;
}
