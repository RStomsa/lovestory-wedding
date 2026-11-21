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
    const { email, plan, note } = body;

    if (!email || !plan) {
      return NextResponse.json({ error: 'Vui lòng cung cấp email và gói nâng cấp' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { sites: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `Không tìm thấy tài khoản với email: ${email}` },
        { status: 404 }
      );
    }

    const now = new Date();
    let planExpiresAt: Date | null = null;
    let amount = 0;
    let orderType = 'PLAN_LIFETIME_VIP_200K';

    if (plan === 'ANNUAL_50K') {
      planExpiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      amount = 50000;
      orderType = 'PLAN_ANNUAL_50K';
    } else if (plan === 'LIFETIME_VIP_200K') {
      planExpiresAt = null; // Trọn đời
      amount = 200000;
      orderType = 'PLAN_LIFETIME_VIP_200K';
    } else if (plan === 'FREE') {
      planExpiresAt = null;
      amount = 0;
      orderType = 'PLAN_FREE';
    } else {
      return NextResponse.json({ error: 'Gói dịch vụ không hợp lệ' }, { status: 400 });
    }

    // 1. Update User Plan
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan,
        planExpiresAt,
      },
    });

    // 2. Unlock all user sites
    if (plan === 'ANNUAL_50K' || plan === 'LIFETIME_VIP_200K') {
      await prisma.site.updateMany({
        where: { ownerId: user.id },
        data: {
          maxViews: -1, // Unlimited views
          status: 'ACTIVE',
        },
      });
    }

    // 3. Create Audit Order and Transaction if paid package
    if (amount > 0) {
      const orderCode = `ADMIN_UPGRADE_${Date.now().toString(36).toUpperCase()}`;
      const newOrder = await prisma.order.create({
        data: {
          userId: user.id,
          code: orderCode,
          type: orderType,
          amount,
          status: 'PAID',
          paymentMethod: 'ADMIN_MANUAL',
          paidAt: now,
        },
      });

      await prisma.transaction.create({
        data: {
          orderId: newOrder.id,
          provider: 'admin_console',
          providerTxnId: `MANUAL_${admin.id}_${Date.now()}`,
          amount,
          transferContent: `Admin ${admin.name} nâng cấp ${plan} cho ${user.email}. Ghi chú: ${note || 'Nâng cấp thủ công'}`,
          rawPayload: JSON.stringify({
            adminId: admin.id,
            adminEmail: admin.email,
            note: note || '',
            date: now.toISOString(),
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Đã nâng cấp thành công tài khoản ${user.name} (${user.email}) lên gói ${plan}!`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Quick upgrade error:', error);
    return NextResponse.json({ error: 'Lỗi nâng cấp gói tài khoản' }, { status: 500 });
  }
}
