import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            plan: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Fetch sessions error:', error);
    return NextResponse.json({ error: 'Lỗi nạp danh sách phiên đăng nhập' }, { status: 500 });
  }
}
