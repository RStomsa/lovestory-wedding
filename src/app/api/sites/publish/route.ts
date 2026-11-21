import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: 'Thiếu đường dẫn thiệp cưới' }, { status: 400 });
    }

    const site = await prisma.site.findUnique({
      where: { slug },
      include: { template: true },
    });

    if (!site) {
      return NextResponse.json({ error: 'Không tìm thấy thiệp cưới' }, { status: 404 });
    }

    if (site.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền xuất bản thiệp này' }, { status: 403 });
    }

    // Check if user has permission to publish with this template
    if (site.template.tier === 'VIP' && user.role !== 'ADMIN' && user.plan !== 'LIFETIME_VIP_200K') {
      const purchase = await prisma.userPurchasedTemplate.findUnique({
        where: {
          userId_templateId: {
            userId: user.id,
            templateId: site.templateId,
          },
        },
      });

      if (!purchase) {
        return NextResponse.json(
          {
            error: `Mẫu ${site.template.name} thuộc hạng VIP. Vui lòng nâng cấp gói 200k hoặc mua lẻ mẫu này để xuất bản.`,
            requiresUpgrade: true,
            templateId: site.templateId,
            templateName: site.template.name,
            templatePrice: site.template.price,
          },
          { status: 403 }
        );
      }
    }

    const now = new Date();
    const updated = await prisma.site.update({
      where: { id: site.id },
      data: {
        status: 'ACTIVE',
        publishedSnapshot: site.draftData,
        publishedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Xuất bản thiệp cưới thành công!',
      site: {
        id: updated.id,
        slug: updated.slug,
        status: updated.status,
        url: `/${updated.slug}`,
      },
    });
  } catch (error) {
    console.error('Publish site error:', error);
    return NextResponse.json({ error: 'Lỗi xuất bản thiệp cưới' }, { status: 500 });
  }
}
