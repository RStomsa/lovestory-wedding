import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const order = await prisma.order.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        amount: true,
        status: true,
        paidAt: true,
        type: true,
        targetItemId: true,
        user: {
          select: {
            id: true,
            plan: true,
            planExpiresAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: order.status,
      paidAt: order.paidAt,
      type: order.type,
      userPlan: order.user.plan,
    });
  } catch (error) {
    console.error('Check order error:', error);
    return NextResponse.json({ error: 'Lỗi kiểm tra trạng thái đơn hàng' }, { status: 500 });
  }
}
