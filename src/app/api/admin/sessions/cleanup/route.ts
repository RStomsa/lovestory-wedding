import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const now = new Date();
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã dọn dẹp ${result.count} phiên đăng nhập đã hết hạn khỏi cơ sở dữ liệu.`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Cleanup sessions error:', error);
    return NextResponse.json({ error: 'Lỗi dọn dẹp phiên đăng nhập' }, { status: 500 });
  }
}
