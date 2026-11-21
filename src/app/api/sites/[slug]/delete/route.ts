import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: 'Thiếu đường dẫn thiệp cưới' }, { status: 400 });
    }

    const site = await prisma.site.findUnique({
      where: { slug },
    });

    if (!site) {
      return NextResponse.json({ error: 'Không tìm thấy thiệp cưới' }, { status: 404 });
    }

    if (site.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bạn không có quyền xóa thiệp này' }, { status: 403 });
    }

    await prisma.site.delete({
      where: { id: site.id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa thiệp cưới thành công' });
  } catch (error) {
    console.error('Delete site error:', error);
    return NextResponse.json({ error: 'Lỗi xóa thiệp cưới' }, { status: 500 });
  }
}
