import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Vui lòng cung cấp ID người dùng' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    const result = await prisma.session.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: `Đã buộc đăng xuất tất cả ${result.count} thiết bị của ${user.name} (${user.email}).`,
      revokedCount: result.count,
    });
  } catch (error) {
    console.error('Revoke user sessions error:', error);
    return NextResponse.json({ error: 'Lỗi thu hồi phiên đăng nhập của người dùng' }, { status: 500 });
  }
}
