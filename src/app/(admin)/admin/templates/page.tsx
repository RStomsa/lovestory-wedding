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

  // Load harvested templates summary index
  let harvestedTemplates: any[] = [];
  try {
    const indexFile = path.join(process.cwd(), 'src', 'data', 'harvested_templates', 'index.json');
    if (fs.existsSync(indexFile)) {
      harvestedTemplates = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
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
