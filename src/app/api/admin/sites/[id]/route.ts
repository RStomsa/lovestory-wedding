import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, viewCount, maxViews, activeExpiresAt, backupExpiresAt } = body;

    const updatedSite = await prisma.site.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(typeof viewCount === 'number' ? { viewCount } : {}),
        ...(typeof maxViews === 'number' ? { maxViews } : {}),
        ...(activeExpiresAt !== undefined
          ? { activeExpiresAt: activeExpiresAt ? new Date(activeExpiresAt) : null }
          : {}),
        ...(backupExpiresAt !== undefined
          ? { backupExpiresAt: backupExpiresAt ? new Date(backupExpiresAt) : null }
          : {}),
      },
      include: {
        owner: { select: { name: true, email: true, plan: true } },
        template: { select: { name: true, tier: true } },
      },
    });

    return NextResponse.json({ success: true, site: updatedSite });
  } catch (error) {
    console.error('Update site error:', error);
    return NextResponse.json({ error: 'Cập nhật thiệp thất bại' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.site.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Đã xóa thiệp cưới thành công' });
  } catch (error) {
    console.error('Delete site error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa thiệp' }, { status: 500 });
  }
}
