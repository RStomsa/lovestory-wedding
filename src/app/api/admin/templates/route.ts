import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAllCatalogTemplates, addCustomTemplate } from '@/lib/templatesService';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const templates = getAllCatalogTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Fetch templates error:', error);
    return NextResponse.json({ error: 'Lỗi nạp danh sách template' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Quản trị viên (Admin) mới có quyền phát hành mẫu mới' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      code,
      subtitle,
      slug,
      category,
      tier,
      price,
      badge,
      longThumbnail,
      baseTemplateId,
      description,
      studioPresetData,
      isPublished,
    } = body;

    if (!name || !longThumbnail) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên mẫu và đường dẫn ảnh xem trước (longThumbnail)' },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const id = `tpl-${category || 'wedding'}-${Date.now().toString(36)}`;

    // Add to custom templates catalog
    const newTemplate = addCustomTemplate({
      id,
      code: code?.trim() || undefined,
      name: name.trim(),
      subtitle: subtitle?.trim() || undefined,
      slug: generatedSlug,
      category: category || 'wedding',
      tier: tier || 'PREMIUM',
      price: tier === 'FREE' ? 0 : Number(price) || (tier === 'BASIC' ? 50000 : 30000),
      badge: badge?.trim() || (tier === 'PREMIUM' ? 'Premium' : tier === 'BASIC' ? 'Basic' : 'Miễn phí'),
      longThumbnail: longThumbnail.trim(),
      baseTemplateId: baseTemplateId || generatedSlug,
      description: description?.trim() || 'Mẫu thiệp scrollytelling điện ảnh sang trọng và hiện đại.',
      studioPresetData: studioPresetData || undefined,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      isCustom: true,
    });

    // Also register in SQLite Template table if not exists so foreign key constraints on Site table remain valid
    try {
      await prisma.template.upsert({
        where: { id: newTemplate.baseTemplateId },
        update: {},
        create: {
          id: newTemplate.baseTemplateId,
          name: newTemplate.name,
          slug: newTemplate.baseTemplateId,
          description: newTemplate.description,
          tier: newTemplate.tier === 'PREMIUM' ? 'VIP' : 'BASIC',
          price: newTemplate.price,
          thumbnail: newTemplate.longThumbnail,
        },
      });
    } catch (err) {
      console.warn('Template foreign key note:', err);
    }

    return NextResponse.json({
      success: true,
      message: `Đã phát hành mẫu "${newTemplate.name}" thành công!`,
      template: newTemplate,
    });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'Lỗi phát hành template' }, { status: 500 });
  }
}
