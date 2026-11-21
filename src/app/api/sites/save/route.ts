import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { CATALOG_TEMPLATES } from '@/data/templatesCatalog';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để lưu trữ thiệp cưới trên đám mây' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { slug, title, templateId, data } = body;

    if (!slug || !data) {
      return NextResponse.json({ error: 'Thiếu dữ liệu thiệp cưới hoặc đường dẫn' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!cleanSlug) {
      return NextResponse.json({ error: 'Đường dẫn thiệp cưới không hợp lệ' }, { status: 400 });
    }

    // Resolve template in database
    let resolvedTemplateId = templateId || 'thiep-cuoi-165';
    let template = await prisma.template.findUnique({
      where: { id: resolvedTemplateId },
    });

    if (!template) {
      template = await prisma.template.findUnique({
        where: { slug: resolvedTemplateId },
      });
      if (template) {
        resolvedTemplateId = template.id;
      }
    }

    // If still not found, search in CATALOG_TEMPLATES or fallback
    if (!template) {
      const cat = CATALOG_TEMPLATES.find((c) => c.id === resolvedTemplateId || c.slug === resolvedTemplateId) || CATALOG_TEMPLATES[0];
      const tier = cat?.tier === 'PREMIUM' ? 'VIP' : 'BASIC';
      template = await prisma.template.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          slug: cat.slug,
          thumbnail: cat.longThumbnail,
          tier,
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          tier,
          price: cat.price || 0,
          thumbnail: cat.longThumbnail,
          isActive: true,
        },
      });
      resolvedTemplateId = template.id;
    }

    // Calculate lifecycle and limits according to plan
    const now = new Date();
    let maxViews = 300;
    let activeExpiresAt: Date | null = new Date();
    let backupExpiresAt: Date | null = new Date();

    if (user.plan === 'LIFETIME_VIP_200K') {
      maxViews = -1; // Unlimited
      activeExpiresAt = null;
      backupExpiresAt = null;
    } else if (user.plan === 'ANNUAL_50K') {
      maxViews = -1;
      activeExpiresAt.setDate(now.getDate() + 365);
      backupExpiresAt.setDate(now.getDate() + 395); // +1 month backup
    } else {
      // FREE: 300 views, 1 month active, 1 month backup
      maxViews = 300;
      activeExpiresAt.setDate(now.getDate() + 30);
      backupExpiresAt.setDate(now.getDate() + 60);
    }

    // Check if site already exists
    const existing = await prisma.site.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing && existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Đường dẫn thiệp cưới này đã có người sử dụng. Vui lòng chọn đường dẫn khác.' },
        { status: 409 }
      );
    }

    const site = await prisma.site.upsert({
      where: { slug: cleanSlug },
      update: {
        title: title || 'Thiệp Cưới LoveStory',
        templateId: resolvedTemplateId,
        draftData: typeof data === 'string' ? data : JSON.stringify(data),
        maxViews,
        activeExpiresAt,
        backupExpiresAt,
      },
      create: {
        slug: cleanSlug,
        ownerId: user.id,
        templateId: resolvedTemplateId,
        title: title || 'Thiệp Cưới LoveStory',
        status: 'DRAFT',
        draftData: typeof data === 'string' ? data : JSON.stringify(data),
        maxViews,
        activeExpiresAt,
        backupExpiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      site: {
        id: site.id,
        slug: site.slug,
        status: site.status,
        viewCount: site.viewCount,
        maxViews: site.maxViews,
        activeExpiresAt: site.activeExpiresAt,
        backupExpiresAt: site.backupExpiresAt,
      },
    });
  } catch (error) {
    console.error('Save site error:', error);
    return NextResponse.json({ error: 'Lỗi lưu thiệp cưới' }, { status: 500 });
  }
}
