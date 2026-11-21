import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderCode } = await request.json();

    if (!orderCode) {
      return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { code: orderCode },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: `Không tìm thấy đơn ${orderCode}` }, { status: 404 });
    }

    if (order.status === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Đơn hàng này đã được thanh toán trước đó',
      });
    }

    const now = new Date();

    // 1. Mark order as PAID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paidAt: now,
      },
    });

    // 2. Apply upgrade benefits
    if (order.type === 'PLAN_LIFETIME_VIP_200K') {
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          plan: 'LIFETIME_VIP_200K',
          planExpiresAt: null,
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

    // 3. Record test transaction
    await prisma.transaction.create({
      data: {
        orderId: order.id,
        provider: 'dev_simulator',
        providerTxnId: `SIM_${order.code}_${Date.now()}`,
        bankAccount: 'DEV_TEST_BANK',
        amount: order.amount,
        transferContent: `Giả lập thanh toán thành công cho ${order.code}`,
        rawPayload: JSON.stringify({ mode: 'simulation', timestamp: now.toISOString() }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Giả lập thanh toán thành công! Đã kích hoạt gói cho ${order.user.name}`,
    });
  } catch (error) {
    console.error('Simulate payment error:', error);
    return NextResponse.json({ error: 'Lỗi giả lập thanh toán' }, { status: 500 });
  }
}
