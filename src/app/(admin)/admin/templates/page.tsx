import React from 'react';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getAllCatalogTemplates } from '@/lib/templatesService';
import TemplatesManagerClient from './TemplatesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminTemplatesPage() {
  const dbTemplates = await prisma.template.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      sites: {
        select: { id: true },
      },
      purchases: {
        select: { id: true },
      },
    },
  });

  const catalogTemplates = getAllCatalogTemplates();

  // Load harvested templates summary index (streamlined preview data to keep RSC payload ultra-light)
  let harvestedTemplates: any[] = [];
  try {
    const indexFile = path.join(process.cwd(), 'src', 'data', 'harvested_templates', 'index.json');
    if (fs.existsSync(indexFile)) {
      const raw = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
      if (Array.isArray(raw)) {
        harvestedTemplates = raw.map((item: any) => ({
          slug: item.slug,
          title: item.title,
          category: item.category,
          imagesCount: item.imagesCount || 10,
          coverImage: item.coverImage || item.longThumbnail || (item.images && item.images.length > 0 ? item.images[0] : ''),
        }));
      }
    }
  } catch (err) {
    console.error('Failed to load harvested templates index:', err);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <TemplatesManagerClient
        initialDbTemplates={JSON.parse(JSON.stringify(dbTemplates))}
        initialCatalogTemplates={catalogTemplates}
        initialHarvestedTemplates={harvestedTemplates}
      />
    </div>
  );
}
