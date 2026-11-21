import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const { slug, id } = await context.params;

    const site = await prisma.site.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });

    if (!site) {
      return NextResponse.json({ error: 'Không tìm thấy thiệp cưới' }, { status: 404 });
    }

    if (site.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền xóa lời chúc này' }, { status: 403 });
    }

    await prisma.wishMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa lời chúc thành công' });
  } catch (error) {
    console.error('Delete wish error:', error);
    return NextResponse.json({ error: 'Lỗi xóa lời chúc' }, { status: 500 });
  }
}
