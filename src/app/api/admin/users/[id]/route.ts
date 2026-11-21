import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

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
    const { role, plan } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role ? { role } : {}),
        ...(plan ? { plan } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}
