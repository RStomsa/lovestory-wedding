import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
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
    const { role, plan, name, phone, newPassword } = body;

    const updateData: Record<string, any> = {};
    if (role) updateData.role = role;
    if (plan) updateData.plan = plan;
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;

    if (newPassword && newPassword.trim()) {
      updateData.passwordHash = await hashPassword(newPassword.trim());
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        plan: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin tài khoản thành công',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent admin from deleting their own current account
    if (admin.id === id) {
      return NextResponse.json(
        { error: 'Không thể xóa chính tài khoản bạn đang đăng nhập' },
        { status: 400 }
      );
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 });
    }

    // Cascade delete in transaction to guarantee referential integrity
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: id } }),
      prisma.rsvpResponse.deleteMany({ where: { site: { ownerId: id } } }),
      prisma.wishMessage.deleteMany({ where: { site: { ownerId: id } } }),
      prisma.site.deleteMany({ where: { ownerId: id } }),
      prisma.order.deleteMany({ where: { userId: id } }),
      prisma.userPurchasedTemplate.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Đã xóa vĩnh viễn tài khoản "${userToDelete.name}" (${userToDelete.email})`,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa tài khoản' }, { status: 500 });
  }
}
