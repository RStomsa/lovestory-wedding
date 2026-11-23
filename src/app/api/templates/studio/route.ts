import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getStudioTemplate } from '@/lib/harvestedTemplateConverter';
import { STUDIO_TEMPLATE_PRESETS } from '@/data/studioTemplatePresets';
import { getCustomStudioPresets } from '@/lib/studioPresetsService';
import { getAllCatalogTemplates } from '@/lib/templatesService';
import minviteTemplates from '@/data/minvite_templates.json';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    // 1. If specific slug requested, return the full converted template preset with 100% real data
    if (slug) {
      const preset = getStudioTemplate(slug);
      if (!preset) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy mẫu thiệp' }, { status: 404 });
      }
      return NextResponse.json({ success: true, preset });
    }

    // 2. Return directory list of templates for Studio left rail
    const indexFile = path.join(process.cwd(), 'src', 'data', 'harvested_templates', 'index.json');
    let harvestedList: any[] = [];
    if (fs.existsSync(indexFile)) {
      harvestedList = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
    }

    const customPresets = getCustomStudioPresets();
    const curatedCustom = customPresets.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      tier: p.tier,
      thumbnail: p.thumbnail,
      imagesCount: p.imagesCount || p.elements?.filter((e) => e.type === 'image').length || 10,
      description: p.description,
      isCustom: true,
    }));

    // Curated standard presets with accurate element counts
    const curatedStandard = STUDIO_TEMPLATE_PRESETS.map((p) => {
      const livePreset = getStudioTemplate(p.slug) || p;
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        tier: p.tier,
        thumbnail: p.thumbnail,
        imagesCount: livePreset.imagesCount || p.imagesCount || 12,
        description: p.description,
      };
    });

    // 26 Catalog Market templates
    const catalogList = getAllCatalogTemplates().map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      category: cat.category,
      tier: cat.tier,
      badge: cat.badge,
      price: cat.price,
      thumbnail: cat.longThumbnail,
      imagesCount: 12,
      description: cat.description,
    }));

    return NextResponse.json({
      success: true,
      curated: [...curatedCustom, ...curatedStandard],
      catalog: catalogList,
      harvestedCount: harvestedList.length,
      harvested: harvestedList,
      minviteCount: minviteTemplates.length,
      minvite: minviteTemplates,
    });
  } catch (error) {
    console.error('Studio template API error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi nạp mẫu thiệp' }, { status: 500 });
  }
}
