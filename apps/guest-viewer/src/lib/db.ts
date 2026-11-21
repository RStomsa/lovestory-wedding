import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

let dbInstance: DatabaseSync | null = null;

function resolveDbPath(): string {
  const candidates = [
    path.resolve(process.cwd(), '../../prisma/dev.db'),
    path.resolve(process.cwd(), '../prisma/dev.db'),
    path.resolve(process.cwd(), 'prisma/dev.db'),
    'D:/WEB/cinelove/prisma/dev.db',
    'D:\\WEB\\cinelove\\prisma\\dev.db'
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch {}
  }
  return candidates[3];
}

export function getDb(): DatabaseSync | null {
  if (dbInstance) return dbInstance;

  try {
    const dbPath = resolveDbPath();
    dbInstance = new DatabaseSync(dbPath);
    return dbInstance;
  } catch (err) {
    console.error('Failed to open SQLite database:', err);
    return null;
  }
}

export interface SiteRecord {
  id: string;
  slug: string;
  title: string;
  status: string;
  maxViews: number;
  viewCount: number;
  activeExpiresAt: string | null;
  backupExpiresAt: string | null;
  draftData: string;
  publishedSnapshot: string | null;
  templateId: string | null;
  templateName: string | null;
}

export function getSiteBySlug(slug: string): SiteRecord | null {
  try {
    const db = getDb();
    if (!db) return null;

    const query = db.prepare(`
      SELECT 
        s.id, s.slug, s.title, s.status, s.maxViews, s.viewCount, 
        s.activeExpiresAt, s.backupExpiresAt, s.draftData, s.publishedSnapshot,
        t.id as templateId, t.name as templateName
      FROM Site s
      LEFT JOIN Template t ON s.templateId = t.id
      WHERE s.slug = ?
      LIMIT 1
    `);

    const site = query.get(slug) as SiteRecord | undefined;
    if (site) {
      // Increment view count asynchronously in SQLite
      try {
        db.prepare(`UPDATE Site SET viewCount = viewCount + 1 WHERE id = ?`).run(site.id);
      } catch (err) {
        console.error('Error updating view count:', err);
      }
      return site;
    }
  } catch (err) {
    console.error('Failed to query site by slug:', err);
  }
  return null;
}
