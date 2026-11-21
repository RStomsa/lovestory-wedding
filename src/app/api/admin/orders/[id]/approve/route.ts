import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    if (order.status === 'PAID') {
      return NextResponse.json({ error: 'Đơn hàng này đã được thanh toán trước đó' }, { status: 400 });
    }

    // 1. Mark order as PAID
    const now = new Date();
    await prisma.order.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: now,
      },
    });

    // 2. Apply benefits according to OrderType
    if (order.type === 'PLAN_LIFETIME_VIP_200K') {
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          plan: 'LIFETIME_VIP_200K',
          planExpiresAt: null, // Lifetime
        },
      });
    } else if (order.type === 'PLAN_ANNUAL_50K') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 365);

      await prisma.user.update({
        where: { id: order.userId },
        data: {
          plan: 'ANNUAL_50K',
          planExpiresAt: expiresAt,
        },
      });
    } else if (order.type === 'SINGLE_TEMPLATE_VIP' && order.targetItemId) {
      // Record template purchase
      await prisma.userPurchasedTemplate.upsert({
        where: {
          userId_templateId: {
            userId: order.userId,
            templateId: order.targetItemId,
          },
        },
        update: {
          pricePaid: order.amount,
        },
        create: {
          userId: order.userId,
          templateId: order.targetItemId,
          pricePaid: order.amount,
        },
      });
    }

    // 3. Create audit transaction record
    await prisma.transaction.create({
      data: {
        orderId: order.id,
        provider: 'manual_admin',
        providerTxnId: `MANUAL_${admin.id}_${Date.now()}`,
        amount: order.amount,
        transferContent: `Admin ${admin.name} duyệt thủ công đơn ${order.code}`,
        rawPayload: JSON.stringify({ approvedBy: admin.email, date: now.toISOString() }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã kích hoạt thành công đơn hàng ${order.code} cho ${order.user.name}`,
    });
  } catch (error) {
    console.error('Approve order error:', error);
    return NextResponse.json({ error: 'Lỗi duyệt đơn hàng' }, { status: 500 });
  }
}
