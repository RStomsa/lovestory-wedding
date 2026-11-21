import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    const session = await prisma.session.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!session) {
      return NextResponse.json({ error: 'Phiên đăng nhập không tồn tại hoặc đã hết hạn' }, { status: 404 });
    }

    await prisma.session.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Đã buộc đăng xuất thành công phiên của ${session.user.name} (${session.user.email})`,
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json({ error: 'Lỗi hủy phiên đăng nhập' }, { status: 500 });
  }
}
